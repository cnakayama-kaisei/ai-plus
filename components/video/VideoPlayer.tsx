'use client'

import { parseVideoUrl, getVideoTypeLabel, type VideoInfo } from '@/lib/video/parser'

interface VideoPlayerProps {
  url: string
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const videoInfo: VideoInfo = parseVideoUrl(url)

  // YouTube player
  if (videoInfo.type === 'youtube') {
    return (
      <div className="mb-6">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg
              className="w-6 h-6 text-red-600 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">
              {getVideoTypeLabel(videoInfo.type)}
            </h3>
          </div>

          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded"
              src={videoInfo.embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    )
  }

  // Vimeo player
  if (videoInfo.type === 'vimeo') {
    return (
      <div className="mb-6">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg
              className="w-6 h-6 text-blue-500 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">
              {getVideoTypeLabel(videoInfo.type)}
            </h3>
          </div>

          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded"
              src={videoInfo.embedUrl}
              title="Vimeo video player"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    )
  }

  // Direct video link (HTML5 video)
  if (videoInfo.type === 'direct') {
    return (
      <div className="mb-6">
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <svg
              className="w-6 h-6 text-blue-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">
              {getVideoTypeLabel(videoInfo.type)}
            </h3>
          </div>

          <video
            className="w-full rounded"
            controls
            preload="metadata"
            controlsList="nodownload"
          >
            <source src={videoInfo.originalUrl} type="video/mp4" />
            <source src={videoInfo.originalUrl} type="video/webm" />
            <source src={videoInfo.originalUrl} type="video/quicktime" />
            お使いのブラウザは動画の再生に対応していません。
          </video>
        </div>
      </div>
    )
  }

  // Unsupported URL - show guide
  return (
    <div className="mb-6">
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6">
        <div className="flex items-start mb-3">
          <svg
            className="w-6 h-6 text-yellow-600 mr-2 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              動画を再生できません
            </h3>
            <p className="text-yellow-700 mb-4">{videoInfo.errorMessage}</p>

            {videoInfo.suggestions && videoInfo.suggestions.length > 0 && (
              <div className="bg-white rounded p-4 border border-yellow-200">
                <h4 className="font-semibold text-gray-800 mb-2">解決方法：</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  {videoInfo.suggestions.map((suggestion, index) => (
                    <p
                      key={index}
                      className={suggestion === '' ? 'h-2' : ''}
                    >
                      {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold mb-1">現在のURL:</p>
              <code className="bg-white px-2 py-1 rounded border border-yellow-200 text-xs break-all block">
                {videoInfo.originalUrl}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
