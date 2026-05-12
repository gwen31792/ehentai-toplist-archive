import { useState } from 'react'

import Image from 'next/image'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  width: number | null
  height: number | null
  className?: string
}

function getPreviewAspectRatio(width: number | null, height: number | null): string {
  return width && height && width > 0 && height > 0
    ? `${width} / ${height}`
    : '3 / 4'
}

// 这部分确定是有缓存的，在本地测试时，可以看到首次 GET /_next/image，后续不会 GET /_next/image
// 而且 ehentai 自己也套了 cloudflare，从 r2 中获取图片减少源站负担可以不着急做
export function ImageWithSkeleton({ src, alt, width, height, className }: ImageWithSkeletonProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const aspectRatio = getPreviewAspectRatio(width, height)
  const imageLoaded = loadedSrc === src

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
      {!imageLoaded && (
        <Skeleton className="absolute inset-0 h-full w-full bg-gray-200 dark:bg-gray-700" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        quality={100}
        className={cn('m-0 object-contain', className)}
        onLoad={() => setLoadedSrc(src)}
      />
    </div>
  )
}
