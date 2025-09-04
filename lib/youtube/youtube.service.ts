export interface YouTubeVideo {
  title: string
  channel: string
  url: string
  duration: string
  viewCount: string
  publishedAt: string
  rating: number
  description: string
}

export class YouTubeService {
  private static instance: YouTubeService
  private readonly API_KEY = process.env.YOUTUBE_API_KEY

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService()
    }
    return YouTubeService.instance
  }

  async searchToolVideos(toolName: string, searchTerms: string[]): Promise<YouTubeVideo | null> {
    if (!this.API_KEY) {
      // Return null if no API key - Toddy will give manual recommendations
      return null
    }

    try {
      // Use the most relevant search term
      const searchQuery = `${toolName} ${searchTerms[0]} safety tutorial`
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&q=${encodeURIComponent(searchQuery)}&` +
        `type=video&videoEmbeddable=true&videoSyndicated=true&` +
        `order=relevance&maxResults=5&key=${this.API_KEY}`
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      if (!data.items || data.items.length === 0) {
        return null
      }

      // Get video details for the top result
      const videoId = data.items[0].id.videoId
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?` +
        `part=statistics,contentDetails&id=${videoId}&key=${this.API_KEY}`
      )

      if (!videoResponse.ok) {
        return null
      }

      const videoData = await videoResponse.json()
      const video = data.items[0]
      const stats = videoData.items[0]?.statistics || {}

      return {
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: this.formatDuration(stats.duration || 'PT0S'),
        viewCount: this.formatViewCount(stats.viewCount || '0'),
        publishedAt: new Date(video.snippet.publishedAt).getFullYear().toString(),
        rating: this.calculateRating(stats),
        description: video.snippet.description
      }

    } catch (error) {
      console.error('YouTube API error:', error)
      return null
    }
  }

  private formatDuration(duration: string): string {
    // Convert PT4M32S to 4:32
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return '0:00'
    
    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount)
    if (count > 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`
    } else if (count > 1000) {
      return `${(count / 1000).toFixed(1)}K views`
    }
    return `${count} views`
  }

  private calculateRating(stats: any): number {
    // Simple rating based on engagement
    const views = parseInt(stats.viewCount || '0')
    const likes = parseInt(stats.likeCount || '0')
    
    if (views === 0) return 3
    
    const likeRatio = likes / views
    if (likeRatio > 0.05) return 5
    if (likeRatio > 0.03) return 4
    if (likeRatio > 0.01) return 3
    return 2
  }

  /**
   * Get manual video recommendation guidance
   */
  getVideoGuidance(toolName: string, whatToLookFor: string[]): string {
    return `**LEARNING RESOURCES:**

**What to look for in good tutorials:**
${whatToLookFor.map(tip => `• ${tip}`).join('\n')}

**Good search terms:**
• "${toolName} safety tutorial"
• "${toolName} proper technique"
• "how to use ${toolName} safely"
• "professional ${toolName} tips"

**Red flags to avoid:**
• Videos without safety equipment shown
• DIY hacks that bypass safety features
• Poor quality audio/video (hard to follow)
• Very old videos (techniques may be outdated)`
  }
}

export const youtubeService = YouTubeService.getInstance()