import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import useAppSelector from '@/hooks/useSelector'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { FLOOD_LIGHT_EVENTS, GA_EVENTS } from '@/constants'
import { triggerFloodLightEvents, triggerGAEvent } from '@/utils/gTagEvents'
import { useCMSData } from '@/data'
import { CDPEventPayloadBuilder } from '@/api/utils/cdpEvents'
import { useSendCDPEvent } from '@/api/hooks/CDPHooks'

const BuyNowButton = () => {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useAppSelector(state => state.profile)
  const { mutate: sendCDPEvent } = useSendCDPEvent()

  // Draggable state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ y: 0 })
  const [dragStart, setDragStart] = useState({ y: 0, startY: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { homePage } = useCMSData()
  const [animateOpen, setAnimateOpen] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { selectedLanguage } = useAppSelector(state => state.language)

  // Initialize position based on screen size
  useEffect(() => {
    if (mounted && !isInitialized) {
      const initializePosition = () => {
        const windowHeight = window.innerHeight
        const isMobile = window.innerWidth < 768 // md breakpoint

        let initialY
        if (isMobile) {
          // Mobile: 70% from top, but ensure it's within bounds
          initialY = windowHeight * 0.7
        } else {
          // Desktop: 50% from top
          initialY = windowHeight * 0.6
        }

        setPosition({ y: initialY })
        setIsInitialized(true)
      }

      initializePosition()
      window.addEventListener('resize', initializePosition)
      return () => window.removeEventListener('resize', initializePosition)
    }
  }, [mounted, isInitialized])

  // Calculate dragging boundaries
  const getDragBoundaries = useCallback(() => {
    const windowHeight = window.innerHeight
    const isMobile = window.innerWidth < 768 // md breakpoint

    // Navbar heights (approximate)
    const navbarHeight = isMobile ? 77 : 80 // Mobile nav is around 77px, desktop around 80px
    const mobileFooterHeight = 71 // From MobileFooter component
    const desktopFooterHeight = 440 // From DesktopFooter component (h-[440px])

    const topBoundary = navbarHeight + 20 // 20px from navbar
    const bottomBoundary = isMobile
      ? windowHeight - mobileFooterHeight - 60 // 40px from mobile footer
      : windowHeight - desktopFooterHeight - 20 // 20px from desktop footer

    return { topBoundary, bottomBoundary }
  }, [])

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      if (isOpen) return // disable dragging when menu is open
      setIsDragging(true)
      setDragStart({
        y: e.clientY,
        startY: position.y
      })
    },
    [position.y, isOpen]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return

      const deltaY = e.clientY - dragStart.y
      const newY = dragStart.startY + deltaY

      const { topBoundary, bottomBoundary } = getDragBoundaries()
      const clampedY = Math.max(topBoundary, Math.min(bottomBoundary, newY))

      setPosition({ y: clampedY })
    },
    [isDragging, dragStart, getDragBoundaries]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch event handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (isOpen) return // disable dragging when menu is open
      setIsDragging(true)
      setDragStart({
        y: touch.clientY,
        startY: position.y
      })
    },
    [position.y, isOpen]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return

      const touch = e.touches[0]
      const deltaY = touch.clientY - dragStart.y
      const newY = dragStart.startY + deltaY

      const { topBoundary, bottomBoundary } = getDragBoundaries()
      const clampedY = Math.max(topBoundary, Math.min(bottomBoundary, newY))

      setPosition({ y: clampedY })
    },
    [isDragging, dragStart, getDragBoundaries]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, {
        passive: false
      })
      document.addEventListener('touchend', handleTouchEnd)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd
  ])

  // Adjust position on window resize
  useEffect(() => {
    const handleResize = () => {
      const { topBoundary, bottomBoundary } = getDragBoundaries()
      setPosition(prev => ({
        y: Math.max(topBoundary, Math.min(bottomBoundary, prev.y))
      }))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getDragBoundaries])

  const handleBuyNowClick = () => {
    if (!isDragging) {
      setIsOpen(true)
    }
  }

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    // trigger closing animation then unmount
    setAnimateOpen(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    const ICON_ANIM_MS = 340
    const ICON_STAGGER_MS = 60
    const CENTER_ANIM_MS = 260
    const total = Math.max(
      CENTER_ANIM_MS,
      ICON_ANIM_MS + ICON_STAGGER_MS * Math.max(brandItems.length - 1, 0)
    )
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, total + 80)
  }

  // Animate in after mount for smooth open
  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setAnimateOpen(true))
      return () => cancelAnimationFrame(id)
    }
    return
  }, [isOpen])

  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth < 768 : true

  // Links mapped from HomePage carousel config
  type BuyNowLink = {
    mobile?: string
    web?: string
    link?: string
    floodLightEvent: string
  }
  const buyNowLinks = useMemo<Record<string, BuyNowLink>>(
    () => ({
      blinkit: {
        floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_BlinkIt_Counter,
        mobile:
          'https://blinkit.onelink.me/z75u/lxnzgoxg?utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=BlinkitBuyOutOnSpriteJIABMobile&utm_content=image',
        web: 'https://blinkit.com/dc/?collection_uuid=OTg3NjU0MzIxMjM0NDI5NzQ=&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=BlinkitBuyOutOnSpriteJIABweb&utm_content=image'
      },
      swiggy: {
        floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Swiggy_Counter,
        web: 'https://www.swiggy.com/stores/instamart/item/L86AQ309CP?share=true&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=SwiggyIMbuynowJIABweb&utm_content=image'
      },
      flipkart: {
        floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Flipkart_Counter,
        web: 'https://www.flipkart.com/grocery/snacks-beverages/soft-drinks/cold-drinks/pr?sid=73z%2Cujs%2Cdfw%2Czxc&otracker%5b%5d=categorytree&otracker%5b%5d=pp_rich_navigation_2_1.navigationCard.RICH_NAVIGATION_Snacks%2B%2526%2BBeverages%2B~Soft%2BDrinks~Aerated%2BDrinks_3FYS7U5BONJL&marketplace=GROCERY&fm=neo%2Fmerchandising&iid=M_ff082628-f373-4ca9-9384-ada0a7063f7e_1_3UF14KMKC2VU_MC.3FYS7U5BONJL&cid=3FYS7U5BONJL&p%5b%5d=facets.brand%255B%255D%3DSprite&ocmpid=BrandAds_Sprite&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=flipkartbuyOutOnSpriteJIAB&utm_content=image'
      },
      bb: {
        floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_BigBasket_Counter,
        web: 'https://www.bigbasket.com/ps/?q=sprite&utm_source=coke&utm_medium=referral&utm_campaign=coke2home_shopbybrand_Sprite&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=bigbasketbuyOutOnSpriteJIAB&utm_content=image'
      },
      // jio: {
      //   floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_JioMart_Counter,
      //   web: 'https://www.jiomart.com/groceries/b/sprite/636?utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=jiomartOutOnSpriteJIAB&utm_content=image'
      // },
      amazon: {
        floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Amazone_Counter,
        web: 'https://www.amazon.in/stores/page/3D23EFF4-EF2F-4F2C-A540-06234B9E9BEC?ingress=0&visitId=73dc4d1b-6236-4998-8d55-776c1440222d&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=AmazonBuyOutOnSpriteJIAB&utm_content=image'
      }
    }),
    []
  )

  // Brand icons positioned on a left semicircle with explicit angles
  // Order: top (bb), between top & left (amazon), left (blinkit),
  // between left & bottom (jio), bottom (flipkart)
  const brandItems = useMemo(
    () => [
      {
        name: 'Flipkart',
        key: 'flipkart',
        img: '/assets/surprise-me/buy-now-flipkart.png',
        angle: 270
      },
      {
        name: 'Amazon',
        key: 'amazon',
        img: '/assets/surprise-me/buy-now-amazon.png',
        angle: 135
      },
      {
        name: 'Blinkit',
        key: 'blinkit',
        img: '/assets/surprise-me/buy-now-blinkit.png',
        angle: 225
      },
      {
        name: 'Swiggy',
        key: 'swiggy',
        img: '/assets/surprise-me/buy-now-swiggy.png',
        angle: 180
      },
      // {
      //   name: 'Jio',
      //   key: 'jio',
      //   img: '/assets/surprise-me/buy-now-jio.png',
      //   angle: 234
      // },
      {
        name: 'BigBasket',
        key: 'bb',
        img: '/assets/surprise-me/buy-now-bb.png',
        angle: 90
      }
    ],
    []
  )

  // Sizes and spacing
  // Keep the close CTA (center) small as earlier
  const centerSize = isMobile ? 40 : 56
  const brandSize = isMobile ? 40 : 56
  const gap = isMobile ? 18 : 24
  const radius = centerSize / 2 + brandSize / 2 + gap

  if (pathname === '/refresh-rings') {
    return null
  }

  if (!isInitialized) {
    return null // Don't render until position is initialized
  }

  return (
    <>
      {!isOpen && (
        <button
          ref={buttonRef}
          style={{
            position: 'fixed',
            top: `${position.y}px`,
            right: '10px',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
            zIndex: 40
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onClick={handleBuyNowClick}
          className='border-[1px] border-[#11A64B] rounded-[100px] max-w-[98px] md:max-w-[180px] py-1 pl-[5px] pr-[8px] md:pl-[12px] md:pr-[18px] flex items-center bg-yellow md:leading-[16px] leading-[12px] transition-none gap-1'
        >
          <div className='relative min-w-[25px] min-h-[25px] md:min-w-[42px]  md:min-h-[42px]  rounded-full flex items-center justify-center'>
            <Image
              className='md:w-[30px] w-[20px]'
              src={`/assets/surprise-me/buy-now-icon.svg`}
              alt='buy now'
              width={42}
              height={42}
            />
          </div>
          <p
            className={cn(
              'text-[#11A64B] uppercase leading-tight text-center break-words whitespace-normal text-[9px] md:text-[16px] font-bold',
              {
                'text-[6px] md:text-[11px]': selectedLanguage === 'kn',
                'text-[7px] md:text-[13px]': selectedLanguage === 'hi',
                'xxs:text-[5px] text-[6px] lg:text-[14px] md:text-[14px] xl:text-[14px] 2xl:text-[14px] break-all':
                  selectedLanguage === 'ta'
              }
            )}
          >
            {homePage.buyNow}
          </p>
        </button>
      )}

      {isOpen && (
        <>
          {/* backdrop to close when clicking outside */}
          <div
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 39 }}
          />

          {/* radial tooltip container */}
          <div
            style={{
              position: 'fixed',
              top: `${position.y}px`,
              right: `${isMobile ? '30px' : '50px'}`,
              transform: 'translateY(-50%)',
              zIndex: 40,
              width: 0,
              height: 0
            }}
            aria-label='Buy now options'
            role='dialog'
          >
            {/* Center close button (replaces CTA) */}
            <button
              onClick={handleClose}
              aria-label='Close buy now options'
              className='rounded-full border-[3px] border-[#11A64B] bg-yellow flex items-center justify-center shadow-[0_4px_4px_rgba(0,0,0,0.25)]'
              style={{
                left: 0,
                top: 0,
                transform: `translate(-50%, -50%) scale(${
                  animateOpen ? 1 : 0.8
                })`,
                transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
                width: centerSize,
                height: centerSize
              }}
            >
              <Image
                src={`/assets/surprise-me/buy-now-close.svg`}
                alt='close'
                width={isMobile ? 15 : 22}
                height={isMobile ? 15 : 22}
              />
            </button>

            {/* Brands positioned radially around center */}
            {brandItems.map((item, idx) => {
              const rad = (item.angle * Math.PI) / 180
              const dx = Math.cos(rad) * radius
              const dy = Math.sin(rad) * radius
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    const linkConfig =
                      buyNowLinks[item.key as keyof typeof buyNowLinks]
                    if (user?.id) {
                      sendCDPEvent(
                        CDPEventPayloadBuilder.buildBuyNowPayload(
                          item.key,
                          user?.phone_number ?? ""
                        )
                      )
                    }
                    triggerGAEvent(GA_EVENTS.BUY_NOW, {
                      promotion_id: item?.name,
                      promotion_name: item?.name,
                      redirect_domain:
                        linkConfig?.link ??
                        linkConfig?.web ??
                        linkConfig?.mobile ??
                        '',
                      redirect_url:
                        linkConfig?.link ??
                        linkConfig?.web ??
                        linkConfig?.mobile ??
                        ''
                    })
                    triggerFloodLightEvents(linkConfig.floodLightEvent)
                    if (!linkConfig) return
                    const url =
                      (isMobile && linkConfig.mobile) ||
                      linkConfig.web ||
                      linkConfig.link
                    if (typeof window !== 'undefined' && url) {
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }
                  }}
                  className='absolute rounded-full'
                  style={{
                    left: 0,
                    top: 0,
                    transform: animateOpen
                      ? `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`
                      : `translate(-50%, -50%) scale(0.6)`,
                    opacity: animateOpen ? 1 : 0,
                    transition:
                      'transform 340ms cubic-bezier(0.22,1,0.36,1), opacity 240ms ease',
                    transitionDelay: `${idx * 60}ms`,
                    width: brandSize,
                    height: brandSize
                  }}
                  aria-label={`Buy on ${item.key}`}
                >
                  <Image
                    src={item.img}
                    alt={item.key}
                    width={brandSize}
                    height={brandSize}
                  />
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

export default BuyNowButton
