/**
 * Video URL parser and playback type detector
 */

export type VideoType = 'youtube' | 'vimeo' | 'direct' | 'unsupported'

export interface VideoInfo {
  type: VideoType
  embedUrl?: string
  originalUrl: string
  videoId?: string
  errorMessage?: string
  suggestions?: string[]
}

/**
 * Extract YouTube video ID from various URL formats
 * @param url - YouTube URL
 * @returns Video ID or null
 */
function extractYouTubeId(url: string): string | null {
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://m.youtube.com/watch?v=VIDEO_ID

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\/]+)/,
    /youtube\.com\/.*[?&]v=([^&]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extract Vimeo video ID from URL
 * @param url - Vimeo URL
 * @returns Video ID or null
 */
function extractVimeoId(url: string): string | null {
  // https://vimeo.com/VIDEO_ID
  // https://player.vimeo.com/video/VIDEO_ID

  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Check if URL is a direct video file link
 * @param url - URL to check
 * @returns True if direct video link
 */
function isDirectVideoLink(url: string): boolean {
  const lowerUrl = url.toLowerCase()
  return (
    lowerUrl.endsWith('.mp4') ||
    lowerUrl.endsWith('.mov') ||
    lowerUrl.endsWith('.webm') ||
    lowerUrl.endsWith('.m4v') ||
    lowerUrl.endsWith('.avi')
  )
}

/**
 * Detect if URL is from Google Drive
 * @param url - URL to check
 * @returns True if Google Drive URL
 */
function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com') || url.includes('docs.google.com')
}

/**
 * Detect if URL is from Dropbox
 * @param url - URL to check
 * @returns True if Dropbox URL
 */
function isDropboxUrl(url: string): boolean {
  return url.includes('dropbox.com') || url.includes('dl.dropboxusercontent.com')
}

/**
 * Parse video URL and determine playback type
 * @param url - Video URL to parse
 * @returns VideoInfo object with playback information
 */
export function parseVideoUrl(url: string): VideoInfo {
  if (!url || url.trim() === '') {
    return {
      type: 'unsupported',
      originalUrl: url,
      errorMessage: '動画URLが指定されていません',
    }
  }

  const trimmedUrl = url.trim()

  // Check for YouTube
  const youtubeId = extractYouTubeId(trimmedUrl)
  if (youtubeId) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      originalUrl: trimmedUrl,
      videoId: youtubeId,
    }
  }

  // Check for Vimeo
  const vimeoId = extractVimeoId(trimmedUrl)
  if (vimeoId) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      originalUrl: trimmedUrl,
      videoId: vimeoId,
    }
  }

  // Check for direct video link
  if (isDirectVideoLink(trimmedUrl)) {
    return {
      type: 'direct',
      originalUrl: trimmedUrl,
    }
  }

  // Handle special cases with suggestions
  const suggestions: string[] = []

  if (isGoogleDriveUrl(trimmedUrl)) {
    suggestions.push(
      'Google Driveの動画は直接埋め込めません。以下の方法をお試しください：',
      '1. ファイルを右クリック → 「共有」 → 「リンクを知っている全員が閲覧可」に変更',
      '2. ファイルID（/d/の後の文字列）をコピー',
      '3. 以下の形式でURLを設定: https://drive.google.com/file/d/FILE_ID/preview',
      '',
      'または、mp4ファイルとして直接ダウンロードして、Vercel BlobやS3にアップロードしてください。'
    )
  } else if (isDropboxUrl(trimmedUrl)) {
    suggestions.push(
      'Dropboxの動画は直接埋め込めません。以下の方法をお試しください：',
      '1. URLの末尾の「dl=0」を「raw=1」に変更すると直リンクになります',
      '2. 例: https://www.dropbox.com/s/xxxxx/video.mp4?raw=1',
      '',
      'または、mp4ファイルとして直接ダウンロードして、Vercel BlobやS3にアップロードしてください。'
    )
  } else {
    suggestions.push(
      '対応している形式：',
      '• YouTube URL（共有URLまたはwatch URL）',
      '• Vimeo URL',
      '• 動画の直リンク（.mp4、.mov、.webmなど）',
      '',
      '推奨：',
      '1. YouTubeやVimeoにアップロードして共有URLを使用',
      '2. Vercel BlobやAWS S3に動画をアップロードして直リンクを使用'
    )
  }

  return {
    type: 'unsupported',
    originalUrl: trimmedUrl,
    errorMessage: 'このURLは直接再生できません。埋め込み用URLまたは直リンクに変更してください。',
    suggestions,
  }
}

/**
 * Get video type label in Japanese
 * @param type - Video type
 * @returns Japanese label
 */
export function getVideoTypeLabel(type: VideoType): string {
  switch (type) {
    case 'youtube':
      return 'YouTube動画'
    case 'vimeo':
      return 'Vimeo動画'
    case 'direct':
      return '直リンク動画'
    case 'unsupported':
      return '未対応'
    default:
      return '不明'
  }
}
