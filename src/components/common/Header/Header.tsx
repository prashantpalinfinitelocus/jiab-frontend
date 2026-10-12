'use client'

import { ChevronRight } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'
import { triggerFloodLightEvents } from '@/utils/gTagEvents'
import { FLOOD_LIGHT_EVENTS } from '@/constants'
interface HeaderProps {
  title: string
  description?: string
  viewAllUrl?: string
  viewAllButtonText?: string
  className?: string
  id?: string
  textTransform?: 'uppercase' | 'capitalize'
  type?: boolean
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  viewAllUrl,
  viewAllButtonText,
  className = '',
  id,
  textTransform = 'uppercase',
  type = true
}) => {
  const { selectedLanguage } = useLanguage()
  const isTamil = selectedLanguage === 'ta'
  const router = useRouter()

  return (
    <div
      className={`flex items-center justify-between w-full px-5 sm:px-0 ${className}`}
      id={id}
    >
      <div>
        {(() => {
          const HeadingTag = type ? 'h2' : 'h1'
          return (
            <HeadingTag
              className={cn(
                `md:text-[30px] text-[16px] font-bold text-gray-900 ${textTransform}`,
                isTamil && 'md:text-[25px] text-[14px]'
              )}
            >
              {title}
            </HeadingTag>
          )
        })()}
        {description && (
          <p
            className={cn(
              'md:mt-1 -mt-[1px] md:text-[20px] text-[12px] text-[#313131]',
              isTamil && 'md:text-[15px] text-[10px]'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {viewAllUrl && (
        <button
          onClick={() => {
            if (viewAllUrl === '/scroll-and-lol') {
              triggerFloodLightEvents(
                FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Scroll_AND_LOL_Counter
              )
            } else if (viewAllUrl === '/pick-mood') {
              triggerFloodLightEvents(
                FLOOD_LIGHT_EVENTS.Sprite_JIAB25_PickYourMood_Counter
              )
            } else if (viewAllUrl === '/user-generated-jokes') {
              triggerFloodLightEvents(
                FLOOD_LIGHT_EVENTS.Sprite_JIAB25_JokeBox_Counter
              )
            }
            router.push(viewAllUrl)
          }}
          className={cn(
            `flex items-center outline-none border-none bg-none md:text-[20px] text-[12px] font-[400] text-gray-900 group`,
            isTamil &&
              'md:text-[15px] text-[10px] text-right md:w-auto w-[90px]'
          )}
        >
          {viewAllButtonText}
          <span className='ml-1 group-hover:translate-x-1 transition-transform'>
            <ChevronRight className='w-4 h-4' />
          </span>
        </button>
      )}
    </div>
  )
}

export default Header
