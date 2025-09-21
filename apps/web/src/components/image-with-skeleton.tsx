import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

interface ImageWithSkeletonProps {
  src: string
  alt: string
  className?: string
}

// 这部分确定是有缓存的，在本地测试时，可以看到首次 GET /_next/image，后续不会 GET /_next/image
// 而且 ehentai 自己也套了 cloudflare，从 r2 中获取图片减少源站负担可以不着急做
export function ImageWithSkeleton({ src, alt, className }: ImageWithSkeletonProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="relative">
      {!imageLoaded && (
        <Skeleton className="aspect-[3/4] w-full bg-gray-200 dark:bg-gray-700" />
      )}
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        style={{
          width: '100%',
          height: 'auto',
        }}
        sizes="100vw"
        quality={100}
        className={`m-0 ${className || ''}`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  )
}
