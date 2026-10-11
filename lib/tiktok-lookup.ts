export function tiktokUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !(url.hostname === 'tiktok.com' || url.hostname.endsWith('.tiktok.com'))) return null;
    url.hash = ''; url.search = '';
    return url;
  } catch { return null; }
}
export function extractTikTokUrl(text: string) {
  for (const candidate of text.match(/https:\/\/[^\s<>]+/gi) || []) {
    const url = tiktokUrl(candidate.replace(/[),.!?،؛]+$/, ''));
    if (url) return url.href;
  }
  return null;
}
export async function resolveTikTokUrl(value: string, fetcher = fetch) {
  let url = tiktokUrl(value);
  if (!url) return null;
  for (let hop = 0; hop < 5; hop++) {
    if (/\/video\/\d+/.test(url.pathname)) return url.href;
    const response = await fetcher(url.href, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(4000) });
    if (![301, 302, 303, 307, 308].includes(response.status)) return url.href;
    const location = response.headers.get('location');
    if (!location) return url.href;
    url = tiktokUrl(new URL(location, url).href);
    if (!url) return null;
  }
  return url.href;
}
export function sameTikTokVideo(a: string, b: string) {
  const first = tiktokUrl(a), second = tiktokUrl(b);
  if (!first || !second) return false;
  const id = first.pathname.match(/\/video\/(\d+)/)?.[1];
  const other = second.pathname.match(/\/video\/(\d+)/)?.[1];
  return id && other ? id === other : first.href.replace(/\/$/, '') === second.href.replace(/\/$/, '');
}
