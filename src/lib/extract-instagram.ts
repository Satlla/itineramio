const EXCLUDED_PATHS = new Set([
  'p', 'reel', 'reels', 'stories', 'explore', 'accounts',
  'tags', 'hashtag', 'share', 'tv', 'direct', 'about',
  'privacy', 'legal', 'help', 'web', 'api',
])

/**
 * Fetches a business website and extracts its Instagram profile URL.
 * Returns the full URL (https://www.instagram.com/username/) or null if not found.
 */
export async function extractInstagramFromWebsite(websiteUrl: string): Promise<string | null> {
  try {
    const res = await fetch(websiteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
      redirect: 'follow',
    })

    if (!res.ok) return null

    const html = await res.text()

    // Match instagram.com/username patterns in href, content, and plain text
    const matches = [...html.matchAll(/instagram\.com\/([a-zA-Z0-9._]{2,30})/g)]

    const username = matches
      .map(m => m[1])
      .find(u => !EXCLUDED_PATHS.has(u.toLowerCase()) && !u.startsWith('?') && !u.includes('='))

    return username ? `https://www.instagram.com/${username}/` : null
  } catch {
    return null
  }
}
