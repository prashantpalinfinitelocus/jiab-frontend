'use client'
import React from 'react'
import Image from 'next/image'

interface SpicyActionsProps {
  className?: string
  viewsCount?: number
  likesCount?: number
  isLiked?: boolean
  onLike?: () => void
  shareCount?: number
  onShare?: () => void
  /** When set, an Instagram icon under the views opens this link in a new tab. */
  instagramUrl?: string
}

const cls = (...args: Array<string | undefined | false>) => args.filter(Boolean).join(' ')

const CountText: React.FC<{ value?: number; className?: string }> = ({ value = 0, className }) => {
  return <span className={cls('text-white text-[10px] leading-[12px] text-center select-none', className)}>{formatCount(value)}</span>
}

const formatCount = (num: number) => {
  if (num < 1000) return `${num}`
  const units = ['K', 'M', 'B']
  let unitIndex = -1
  let n = num
  while (n >= 1000 && unitIndex < units.length - 1) {
    n = n / 1000
    unitIndex += 1
  }
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}${units[unitIndex]}`
}

// Views and likes show only when a count is given, and share only when there is a share action.
const SpicyActions: React.FC<SpicyActionsProps> = ({ className, viewsCount, likesCount, shareCount = 0, isLiked = false, onLike, onShare, instagramUrl }) => {
  return (
    <div className={cls('absolute right-[12px] bottom-[34px] flex flex-col items-center gap-[10px] z-20', className)}>
      {viewsCount !== undefined && (
        <button aria-label='Views' className='flex flex-col items-center gap-[4px]'>
          <Image src={'/static/sprite/icons/spicy-view.svg'} alt='views' width={32} height={32} className='w-[32px] h-[32px]' />
          <CountText value={viewsCount} />
        </button>
      )}

      {instagramUrl && (
        <a
          href={instagramUrl}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Watch on Instagram'
          className='flex flex-col items-center'
        >
          <Image src={'/static/sprite/icons/spicy-instagram.svg'} alt='instagram' width={28} height={28} className='w-[28px] h-[28px]' />
        </a>
      )}

      {likesCount !== undefined && (
        <button aria-label='Like' onClick={onLike} className='flex flex-col items-center gap-[4px]'>
          <Image
            src={isLiked ? '/static/sprite/icons/spicy-heart-filled.svg' : '/static/sprite/icons/spicy-heart.svg'}
            alt='like'
            width={32}
            height={32}
            className='w-[32px] h-[32px]'
          />
          <CountText value={likesCount} />
        </button>
      )}

      {onShare && (
        <button aria-label='Share' onClick={onShare} className='flex flex-col items-center gap-[4px]'>
          <Image src={'/static/sprite/icons/spicy-share.svg'} alt='share' width={32} height={32} className='w-[32px] h-[32px]' />
          <CountText value={shareCount} />
        </button>
      )}
    </div>
  )
}

export default SpicyActions


