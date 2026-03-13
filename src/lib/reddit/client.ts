export interface RedditPost {
  id: string
  author: string
  title: string
  selftext: string
  url: string
  score: number
  num_comments: number
  subreddit: string
  created_utc: number
}

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getRedditToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET not configured')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Itineramio/1.0 (UGC Finder)',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Reddit OAuth failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return cachedToken.token
}

const DEFAULT_SUBREDDITS = [
  'airbnb',
  'airbnb_hosts',
  'vrbo',
  'spain',
  'alicante',
  'digitalnomad',
  'realestateinvesting',
]

export async function searchReddit(
  query: string,
  subreddits: string[] = DEFAULT_SUBREDDITS,
  limit = 20
): Promise<RedditPost[]> {
  const token = await getRedditToken()

  const subredditFilter = subreddits.length > 0
    ? `subreddit:${subreddits.join('+')}`
    : ''

  const fullQuery = subredditFilter ? `${query} ${subredditFilter}` : query

  const params = new URLSearchParams({
    q: fullQuery,
    sort: 'new',
    limit: String(Math.min(limit, 100)),
    type: 'link',
  })

  const response = await fetch(`https://oauth.reddit.com/search.json?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Itineramio/1.0 (UGC Finder)',
    },
  })

  if (!response.ok) {
    throw new Error(`Reddit search failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const children = data?.data?.children ?? []

  return children.map((child: any) => ({
    id: child.data.id,
    author: child.data.author,
    title: child.data.title,
    selftext: child.data.selftext || '',
    url: `https://reddit.com${child.data.permalink}`,
    score: child.data.score,
    num_comments: child.data.num_comments,
    subreddit: child.data.subreddit,
    created_utc: child.data.created_utc,
  })) as RedditPost[]
}
