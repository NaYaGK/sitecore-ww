'use client';

import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { VideoPlayerComponentProps } from './VideoPlayer.props';
import { cn } from '@/lib/utils';

// Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

// Build YouTube embed URL with native controls
const buildYouTubeEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    feature: 'oembed',
    rel: '0', // Don't show related videos from other channels
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

const VideoPlayer = ({ fields, className }: VideoPlayerComponentProps) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Get video URL from fields
  const videoUrl = fields?.VideoUrl?.value?.href || '';
  const videoTitle = fields?.VideoTitle?.value || 'Video';

  // Extract video ID and build embed URL
  const videoId = getYouTubeVideoId(videoUrl);
  const embedUrl = videoId ? buildYouTubeEmbedUrl(videoId) : null;

  // Show placeholder in editing mode
  if (isPageEditing && !videoUrl) {
    return (
      <div className="w-full bg-gray-100 py-4 lg:py-8">
        <div className="mx-auto max-w-[1360px] px-2 lg:px-3">
          <p className="text-center text-gray-500">Add a YouTube video URL</p>
        </div>
      </div>
    );
  }

  if (!embedUrl) {
    return null;
  }

  return (
    <article className={cn('w-full', className)} data-component="VideoPlayer">
      <div className="mx-auto my-8 w-full max-w-[1360px] px-2 lg:my-12 lg:px-3">
        {/* Title */}
        {fields?.VideoTitle && (
          <Text
            tag="h2"
            field={fields.VideoTitle}
            className="mb-6 text-3xl font-bold lg:mb-12 lg:text-4xl"
          />
        )}

        {/* YouTube Video - Direct Embed with Native Controls */}
        <div className="relative w-full overflow-hidden rounded-md">
          {/* 16:9 Aspect Ratio Container */}
          <div className="relative w-full pb-[56.25%]">
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={embedUrl}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        {/* Caption */}
        {fields?.Caption?.value && (
          <Text
            tag="p"
            field={fields.Caption}
            className="mt-4 text-sm leading-relaxed text-gray-600"
          />
        )}
      </div>
    </article>
  );
};

export default VideoPlayer;
