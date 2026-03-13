export interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  channelId: string
  description: string
  publishedAt: string
  viewCount: number
  likeCount: number
  url: string
}

export async function searchYouTube(query: string, maxResults = 20): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY not configured')
  }

  // Search for videos
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(Math.min(maxResults, 50)),
    order: 'date',
    relevanceLanguage: 'es',
    key: apiKey,
  })

  const searchResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${searchParams}`
  )

  if (!searchResponse.ok) {
    throw new Error(`YouTube search failed: ${searchResponse.status} ${searchResponse.statusText}`)
  }

  const searchData = await searchResponse.json()
  const items = searchData?.items ?? []

  if (items.length === 0) return []

  // Fetch video stats
  const videoIds = items.map((item: any) => item.id.videoId).join(',')
  const statsParams = new URLSearchParams({
    part: 'statistics',
    id: videoIds,
    key: apiKey,
  })

  const statsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${statsParams}`
  )

  const statsMap: Record<string, { viewCount: number; likeCount: number }> = {}

  if (statsResponse.ok) {
    const statsData = await statsResponse.json()
    for (const video of statsData?.items ?? []) {
      statsMap[video.id] = {
        viewCount: parseInt(video.statistics?.viewCount ?? '0', 10),
        likeCount: parseInt(video.statistics?.likeCount ?? '0', 10),
      }
    }
  }

  return items.map((item: any) => {
    const videoId = item.id.videoId
    const stats = statsMap[videoId] ?? { viewCount: 0, likeCount: 0 }
    return {
      id: videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      description: item.snippet.description || '',
      publishedAt: item.snippet.publishedAt,
      viewCount: stats.viewCount,
      likeCount: stats.likeCount,
      url: `https://www.youtube.com/watch?v=${videoId}`,
    } as YouTubeVideo
  })
}
