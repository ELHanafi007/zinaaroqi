import { timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb/connect';
import { Property } from '@/models/Property';
import { serializeProperty } from '@/lib/mongodb/serialize';
import { extractTikTokUrl, resolveTikTokUrl, sameTikTokVideo } from '@/lib/tiktok-lookup';
import { openwaConfig, sendPropertyOpenwa } from '@/lib/openwa';
import { configuredPublicSiteOrigin } from '@/lib/site-url';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  const config = openwaConfig();
  const supplied = Buffer.from(req.headers.get('X-API-Key') || '');
  const expected = Buffer.from(config?.key || '');
  if (!expected.length || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid payload' }, { status: 400 }); }
  const { messageId, from, text, fromMe } = body || {};
  // Incoming private chats only: avoid replying to broadcasts, groups or ourselves.
  if (fromMe === true || typeof from !== 'string' || !/^\d+@(c\.us|s\.whatsapp\.net|lid)$/.test(from) || typeof text !== 'string' || typeof messageId !== 'string' || !messageId || messageId.length > 300 || text.length > 20000) return NextResponse.json({ ignored: true });
  const url = extractTikTokUrl(text);
  if (!url) return NextResponse.json({ ignored: true });
  const origin = configuredPublicSiteOrigin();
  if (!origin) return NextResponse.json({ error: 'Site URL missing' }, { status: 503 });
  try {
    await connectToDatabase();
    const claims = mongoose.connection.collection('whatsapp_webhook_receipts');
    // Insert before sending: duplicate events and ambiguous sends must not resend.
    const claim = await claims.updateOne({ _id: messageId as never }, { $setOnInsert: { receivedAt: new Date(), status: 'processing' } }, { upsert: true });
    if (!claim.upsertedCount) return NextResponse.json({ duplicate: true });
    const resolved = await resolveTikTokUrl(url).catch(() => url);
    const listings = await Property.find({ visibility: 'public', tiktokUrl: { $exists: true, $ne: '' } });
    const match = listings.find(property => sameTikTokVideo(property.tiktokUrl || '', url) || (resolved && sameTikTokVideo(property.tiktokUrl || '', resolved)));
    if (!match) { await claims.updateOne({ _id: messageId as never }, { $set: { status: 'not_found' } }); return NextResponse.json({ matched: false }); }
    const locale = process.env.WHATSAPP_REPLY_LOCALE === 'en' ? 'en' : 'ar';
    try {
      await sendPropertyOpenwa(config!, from, serializeProperty(match), origin, locale);
      await claims.updateOne({ _id: messageId as never }, { $set: { status: 'sent' } });
      return NextResponse.json({ matched: true, sent: true });
    } catch {
      await claims.updateOne({ _id: messageId as never }, { $set: { status: 'unconfirmed' } });
      return NextResponse.json({ error: 'Reply not confirmed' }, { status: 502 });
    }
  } catch { return NextResponse.json({ error: 'Lookup failed' }, { status: 500 }); }
}
