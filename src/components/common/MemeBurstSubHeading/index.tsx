'use client'

import { ChevronRight } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/hooks/useLanguage'
import { useRouter } from 'next/navigation'
interface MemeBurstSubHeadingProps {
  title: string
  description?: string
  viewAllUrl?: string
  viewAllButtonText?: string
  className?: string
  id?: string
  textTransform?: 'uppercase' | 'capitalize'
}

const MemeBurstSubHeading: React.FC<MemeBurstSubHeadingProps> = ({
  title,
  viewAllUrl,
  viewAllButtonText,
  className = '',
  id,
  textTransform = 'uppercase'
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
        <h2
          className={cn(
            `md:text-[20px] text-[16px] font-medium text-gray-900 ${textTransform}`,
            isTamil && 'md:text-[25px] text-[14px]'
          )}
        >
          {title}
        </h2>
      </div>
      {viewAllUrl && (
        <button
          onClick={() => {
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

export default MemeBurstSubHeading