import assert from 'node:assert/strict';
import { test } from 'node:test';
import { extractTikTokUrl, resolveTikTokUrl, sameTikTokVideo, tiktokUrl } from '../lib/tiktok-lookup';
test('extracts TikTok links without tracking and matches the same video', () => {
  assert.equal(extractTikTokUrl('تفاصيل https://www.tiktok.com/@office/video/123?share=1'), 'https://www.tiktok.com/@office/video/123');
  assert.equal(sameTikTokVideo('https://www.tiktok.com/@office/video/123', 'https://m.tiktok.com/@other/video/123?x=1'), true);
  assert.equal(sameTikTokVideo('https://www.tiktok.com/@office/video/123', 'https://www.tiktok.com/@office/video/124'), false);
});
test('rejects lookalike hosts, credentials and local redirects', async () => {
  for (const url of ['https://tiktok.com.evil.example/video/123', 'https://evil-tiktok.com/video/123', 'https://user@www.tiktok.com/video/123', 'http://www.tiktok.com/video/123']) assert.equal(tiktokUrl(url), null);
  let requests = 0;
  assert.equal(await resolveTikTokUrl('https://vm.tiktok.com/test/', async () => { requests++; return new Response(null, {status: 302, headers: {location: 'http://127.0.0.1/secret'}}); }), null);
  assert.equal(requests, 1);
});
test('resolves short links to the canonical TikTok video', async () => {
  assert.equal(await resolveTikTokUrl('https://vm.tiktok.com/test/', async () => new Response(null, { status: 302, headers: {location: 'https://www.tiktok.com/@office/video/123?x=1'} })), 'https://www.tiktok.com/@office/video/123');
});
