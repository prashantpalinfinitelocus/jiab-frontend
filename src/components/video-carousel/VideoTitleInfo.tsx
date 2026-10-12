import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import useAppSelector from '@/hooks/useSelector'
import useWindowWidth from '@/hooks/useWindowWidth'

interface VideoTitleInfoProps {
  title?: string
  language?: string
  className?: string
  showGradient?: boolean
  variant?: 'card' | 'scroll'
  genreImage?: string
  hideGenre?: boolean
  hideLanguage?: boolean
}

const VideoTitleInfo: React.FC<VideoTitleInfoProps> = ({
  title = 'Video Title',
  language,
  className = '',
  showGradient = true,
  variant = 'scroll',
  genreImage,
  hideGenre = false,
  hideLanguage = false
}) => {
  const { genres } = useAppSelector(state => state.reference)
  const [newGenreImage, setNewGenreImage] = useState<string>('')
  const [newTitle, setNewTitle] = useState<string>('')
  const [sliceLength, setSliceLength] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const windowWidth = useWindowWidth()

  useEffect(() => {
    const length = windowWidth > 768 ? 28 : 18
    setSliceLength(length)
  }, [windowWidth])

  useEffect(() => {
    if (isExpanded) {
      setNewTitle(title)
    } else {
      if (title?.length > sliceLength) {
        setNewTitle(title?.slice(0, sliceLength))
      } else {
        setNewTitle(title)
      }
    }
  }, [isExpanded, sliceLength])

  useEffect(() => {
    if (genres?.length > 0 || genreImage) {
      if (genreImage) {
        setNewGenreImage(genreImage)
      } else {
        if (genres?.length > 0) {
          setNewGenreImage(genres?.[0]?.image_url ?? '')
        }
      }
    }
  }, [genres, genreImage])

  const titleStyles = {
    card: 'md:text-[14px] text-[12px] leading-[100%] font-semibold mb-1 md:w-auto w-[200px]',
    // Original xl+; compact from md through below xl (768–1279px)
    scroll:
      'text-[16px] md:text-[13px] xl:text-[18px] leading-[100%] font-semibold mb-1 md:mb-0 xl:mb-1 md:w-auto w-[260px]'
  }

  const artistStyles = {
    card: 'md:text-[12px] text-[10px] opacity-80 leading-[100%]',
    scroll:
      'text-[14px] md:text-[11px] xl:text-[16px] opacity-80 leading-[100%]'
  }

  const iconSizes = {
    card: { width: 16, height: 16 },
    scroll: { width: 20, height: 20 }
  }

  const gradientStyles = {
    card: 'absolute bottom-0 left-0 w-full md:h-[80px] h-[60px] bg-gradient-to-t from-black to-transparent pointer-events-none',
    scroll:
      'absolute bottom-0 left-0 w-full md:h-[140px] h-[98px] bg-gradient-to-t from-black to-transparent pointer-events-none'
  }

  return (
    <>
      {showGradient && <div className={gradientStyles[variant]} />}
      <div className={`text-white ${className}`}>
        <div
          className={
            variant === 'scroll'
              ? 'flex items-center gap-[8px] md:gap-1.5 xl:gap-[8px]'
              : 'flex items-center gap-[8px]'
          }
        >
          {/* Need to update when BE is ready */}
          {!hideGenre && newGenreImage !== '' && (
            <Image
              src={newGenreImage ?? ''}
              alt='Gludein Logo'
              width={iconSizes[variant].width}
              height={iconSizes[variant].height}
              className={
                variant === 'scroll'
                  ? 'w-5 h-5 md:w-3.5 md:h-3.5 xl:w-5 xl:h-5 shrink-0'
                  : undefined
              }
            />
          )}
          <div>
            <h2 className={titleStyles[variant]}>
              {newTitle}
              {title?.length > sliceLength && !isExpanded && (
                <button onClick={() => setIsExpanded(true)}>...</button>
              )}
            </h2>
            {!hideLanguage && <p className={artistStyles[variant]}>{language}</p>}
          </div>
        </div>
      </div>
    </>
  )
}

export default VideoTitleInfo
