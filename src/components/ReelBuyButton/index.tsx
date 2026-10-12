'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FLOOD_LIGHT_EVENTS, GA_EVENTS } from '@/constants'
import { triggerFloodLightEvents, triggerGAEvent } from '@/utils/gTagEvents'


type BuyNowLink = {
  mobile?: string
  web?: string
  link?: string
  floodLightEvent: string
}

const BUY_NOW_LINKS: Record<string, BuyNowLink> = {
  blinkit: {
    floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_BlinkIt_Counter,
    mobile:
      'https://blinkit.onelink.me/z75u/lxnzgoxg?utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=BlinkitBuyOutOnSpriteJIABMobile&utm_content=image',
    web: 'https://blinkit.com/dc/?collection_uuid=OTg3NjU0MzIxMjM0NDI5NzQ=&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=BlinkitBuyOutOnSpriteJIABweb&utm_content=image',
  },
  swiggy: {
    floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Swiggy_Counter,
    web: 'https://www.swiggy.com/stores/instamart/item/L86AQ309CP?share=true&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=SwiggyIMbuynowJIABweb&utm_content=image',
  },
  flipkart: {
    floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Flipkart_Counter,
    web: 'https://www.flipkart.com/grocery/snacks-beverages/soft-drinks/cold-drinks/pr?sid=73z%2Cujs%2Cdfw%2Czxc&otracker%5b%5d=categorytree&otracker%5b%5d=pp_rich_navigation_2_1.navigationCard.RICH_NAVIGATION_Snacks%2B%2526%2BBeverages%2B~Soft%2BDrinks~Aerated%2BDrinks_3FYS7U5BONJL&marketplace=GROCERY&fm=neo%2Fmerchandising&iid=M_ff082628-f373-4ca9-9384-ada0a7063f7e_1_3UF14KMKC2VU_MC.3FYS7U5BONJL&cid=3FYS7U5BONJL&p%5b%5d=facets.brand%255B%255D%3DSprite&ocmpid=BrandAds_Sprite&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=flipkartbuyOutOnSpriteJIAB&utm_content=image',
  },
  bb: {
    floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_BigBasket_Counter,
    web: 'https://www.bigbasket.com/ps/?q=sprite&utm_source=coke&utm_medium=referral&utm_campaign=coke2home_shopbybrand_Sprite&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=bigbasketbuyOutOnSpriteJIAB&utm_content=image',
  },
  // jio: {
  //   floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_JioMart_Counter,
  //   web: 'https://www.jiomart.com/groceries/b/sprite/636?utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=jiomartOutOnSpriteJIAB&utm_content=image',
  // },
  amazon: {
    floodLightEvent: FLOOD_LIGHT_EVENTS.Sprite_JIAB25_Amazone_Counter,
    web: 'https://www.amazon.in/stores/page/3D23EFF4-EF2F-4F2C-A540-06234B9E9BEC?ingress=0&visitId=73dc4d1b-6236-4998-8d55-776c1440222d&utm_source=display_p&utm_medium=display&utm_campaign=&utm_term=AmazonBuyOutOnSpriteJIAB&utm_content=image',
  },
}

const BRAND_ITEMS = [
  { name: 'Flipkart',  key: 'flipkart', img: '/assets/surprise-me/buy-now-flipkart.png', glow: '#2874F0' },
  { name: 'Amazon',    key: 'amazon',   img: '/assets/surprise-me/buy-now-amazon.png',   glow: '#000000' },
  { name: 'Blinkit',   key: 'blinkit',  img: '/assets/surprise-me/buy-now-blinkit.png',  glow: '#F8CB46' },
  { name: 'Swiggy',    key: 'swiggy',   img: '/assets/surprise-me/buy-now-swiggy.png',   glow: '#F04F33' },
  // { name: 'Jio',       key: 'jio',      img: '/assets/surprise-me/buy-now-jio.png',      glow: '#E53935' },
  { name: 'BigBasket', key: 'bb',       img: '/assets/surprise-me/buy-now-bb.png',       glow: '#84C225' },
]

interface ReelBuyButtonProps {
  isActive?: boolean
}

const OPEN_STAGGER_MS = 110
const OPEN_DURATION_MS = 420
const CLOSE_STAGGER_MS = OPEN_STAGGER_MS
const CLOSE_DURATION_MS = OPEN_DURATION_MS
const CLOSE_ANIM_MS = CLOSE_DURATION_MS + (BRAND_ITEMS.length + 1) * CLOSE_STAGGER_MS

const ReelBuyButton: React.FC<ReelBuyButtonProps> = ({ isActive = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  const beginClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setIsClosing(true)
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, CLOSE_ANIM_MS)
  }

  useEffect(() => {
    if (!isActive) {
      if (isOpen && !isClosing) beginClose()
    } else {
      setIsHidden(false)
    }
  }, [isActive])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isOpen) {
      setIsOpen(true)
    } else if (!isClosing) {
      beginClose()
    }
  }

  const handleBrandClick = (e: React.MouseEvent, brandKey: string, brandName: string) => {
    e.stopPropagation()
    const linkConfig = BUY_NOW_LINKS[brandKey]
    if (!linkConfig) return

    triggerGAEvent(GA_EVENTS.BUY_NOW, {
      promotion_id: brandName,
      promotion_name: brandName,
      redirect_domain: linkConfig.link ?? linkConfig.web ?? linkConfig.mobile ?? '',
      redirect_url:    linkConfig.link ?? linkConfig.web ?? linkConfig.mobile ?? '',
    })
    triggerFloodLightEvents(linkConfig.floodLightEvent)

    const url = (isMobile && linkConfig.mobile) || linkConfig.web || linkConfig.link
    if (typeof window !== 'undefined' && url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    if (!isClosing) beginClose()
  }

  return (
    <>
      <style jsx>{`
        @keyframes reelBuyPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(14, 138, 62, 0.55), 0 6px 18px -6px rgba(14, 138, 62, 0.6); }
          50%      { box-shadow: 0 0 0 8px rgba(14, 138, 62, 0), 0 6px 22px -6px rgba(14, 138, 62, 0.85); }
        }
        @keyframes reelBuySheen {
          0%   { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
          40%  { opacity: 0.9; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        @keyframes reelChipIn {
          0%   { opacity: 0; transform: translateY(8px) scale(0.6) rotate(-12deg); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.08) rotate(2deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        @keyframes reelCloseIn {
          0%   { opacity: 0; transform: scale(0.4) rotate(-90deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes reelChipOut {
          0%   { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
          40%  { opacity: 1; transform: translateY(-2px) scale(1.08) rotate(2deg); }
          100% { opacity: 0; transform: translateY(8px) scale(0.6) rotate(-12deg); }
        }
        @keyframes reelCloseOut {
          0%   { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.4) rotate(-90deg); }
        }
        @keyframes reelBottleSway {
          0%, 100% { transform: rotate(-25deg) translateY(0); }
          25%      { transform: rotate(-18deg) translateY(-1px); }
          50%      { transform: rotate(-25deg) translateY(0); }
          75%      { transform: rotate(-32deg) translateY(-1px); }
        }
        @keyframes reelCrossSpin {
          0%, 100% { transform: rotate(-15deg); }
          50%      { transform: rotate(15deg); }
        }
        .reel-cross-spin {
          animation: reelCrossSpin 4s ease-in-out infinite;
        }
        @keyframes reelBottleBubble {
          0%   { opacity: 0; transform: translateY(0) scale(0.6); }
          30%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-6px) scale(1); }
        }
        .reel-bottle-sway {
          animation: reelBottleSway 2.8s ease-in-out infinite;
          transform-origin: 50% 90%;
        }
        .reel-bottle-bubble {
          transform-origin: center;
          animation: reelBottleBubble 1.8s ease-out infinite;
        }
        @keyframes reelTrayGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes reelTraySheen {
          0%   { transform: translateX(-150%) skewX(-20deg); opacity: 0; }
          30%  { opacity: 0.7; }
          100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
        }
        @keyframes reelChipFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes reelChipRing {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes reelCloseSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .reel-buy-pulse {
          animation: reelBuyPulse 2.4s ease-in-out infinite;
        }
        .reel-buy-sheen::after {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 35%; height: 100%;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%);
          animation: reelBuySheen 3.2s ease-in-out infinite;
          pointer-events: none;
        }
        .reel-chip-in {
          animation: reelChipIn 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .reel-close-in {
          animation: reelCloseIn 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .reel-tray {
          position: relative;
          background: transparent;
        }
        .reel-chip-float {
          animation: reelChipIn 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
          transition: transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
                      filter 220ms ease-out;
        }
        .reel-chip-float:hover {
          transform: scale(1.45) translateY(-3px);
          filter: brightness(1.08) saturate(1.15);
          z-index: 20;
        }
        .reel-chip-float:active {
          transform: scale(1.25);
        }
        .reel-chip-out {
          animation-name: reelChipOut;
          animation-timing-function: cubic-bezier(0.55, 0, 0.78, 0.2);
          animation-fill-mode: both;
          pointer-events: none;
        }
        .reel-close-out {
          animation-name: reelCloseOut;
          animation-timing-function: cubic-bezier(0.55, 0, 0.78, 0.2);
          animation-fill-mode: both;
          pointer-events: none;
        }
        .reel-chip-glow::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 9999px;
          padding: 2px;
          background: conic-gradient(
            from 0deg,
            #ff3d7f, #ffd23d, #4ade80, #38bdf8, #a855f7, #ff3d7f
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          animation: reelChipRing 4s linear infinite;
          pointer-events: none;
          opacity: 0.9;
        }
        .reel-close-spin {
          position: relative;
        }
        .reel-close-spin::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 9999px;
          background: conic-gradient(
            from 0deg,
            rgba(255,255,255,0.0),
            rgba(255,255,255,0.9),
            rgba(255,255,255,0.0) 50%,
            rgba(255,255,255,0.0)
          );
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          padding: 1.5px;
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          animation: reelCloseSpin 2.2s linear infinite;
          pointer-events: none;
        }
      `}</style>

      {!isHidden && <div
        ref={containerRef}
        className='relative inline-flex max-w-full min-w-0 items-center'
      >
        {!isOpen && !isClosing && (
          <button
            type='button'
            onClick={(e) => { e.stopPropagation(); setIsHidden(true) }}
            aria-label='Hide buy button'
            className={[
              'absolute -top-1 -right-1 xxs:-top-1 xxs:-right-1 lg:-top-1.5 lg:-right-1.5 z-20',
              'inline-flex items-center justify-center',
              'bg-transparent text-white',
              '[filter:drop-shadow(0_0_2px_rgba(14,138,62,1))_drop-shadow(0_0_5px_rgba(14,138,62,0.95))_drop-shadow(0_0_10px_rgba(14,138,62,0.7))_drop-shadow(0_2px_4px_rgba(0,0,0,0.5))]',
              'active:scale-90',
              'size-2.5 xxs:size-2.5 sm:size-2.5 md:size-2.5 lg:size-3 xl:size-3 2xl:size-3.5',
            ].join(' ')}
          >
            <svg
              viewBox='0 0 14 14'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden
              className='size-full'
            >
              <path d='M3 3L11 11M11 3L3 11' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
            </svg>
          </button>
        )}
        {!isOpen ? (
          <button
            type='button'
            onClick={handleToggle}
            aria-label='Buy Sprite now'
            aria-expanded={false}
            className={[
              'reel-buy-sheen',
              'relative overflow-hidden cursor-pointer outline-none',
              'inline-flex items-center justify-center whitespace-nowrap',
              'rounded-full border border-white/15',
              'bg-gradient-to-b from-[#12a04e] to-[#0e8a3e]',
              'shadow-[-3px_5px_8px_-1px_rgba(14,138,62,0.7),-6px_10px_16px_-3px_rgba(14,138,62,0.45)]',
              'h-6 px-2.5 gap-0.5',
              'xxs:h-6 xxs:px-2.5 xxs:gap-0.5',
              'sm:h-6 sm:px-2.5 sm:gap-0.5',
              'md:h-6 md:px-2.5 md:gap-0.5',
              'lg:h-7 lg:px-3 lg:gap-1',
              'xl:h-7 xl:px-3 xl:gap-1',
              '2xl:h-8 2xl:px-3.5 2xl:gap-1',
            ].join(' ')}
          >
            <span
              className={[
                'font-bold leading-none text-white drop-shadow-sm tracking-wide',
                'text-[9px]',
                'xxs:text-[9px]',
                'sm:text-[9px]',
                'md:text-[9px]',
                'lg:text-[10px]',
                'xl:text-[10px]',
                '2xl:text-[11px]',
              ].join(' ')}
            >
              Buy Sprite®
            </span>
            <svg
              className='size-2 shrink-0 self-center xxs:size-2 sm:size-2 md:size-2 lg:size-2.5 xl:size-2.5 2xl:size-3'
              viewBox='0 0 14 14'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden
            >
              <path d='M5.5 2H3.5C2.67157 2 2 2.67157 2 3.5V10.5C2 11.3284 2.67157 12 3.5 12H10.5C11.3284 12 12 11.3284 12 10.5V8.5' stroke='white' strokeWidth='1.3' strokeLinecap='round' strokeLinejoin='round'/>
              <path d='M7.5 6.5L12 2M12 2H8.5M12 2V5.5' stroke='white' strokeWidth='1.3' strokeLinecap='round' strokeLinejoin='round'/>
            </svg>
          </button>
        ) : (
          <div
            role='group'
            aria-label='Choose a store to buy Sprite'
            className={[
              'reel-tray',
              'inline-flex items-center rounded-full',
              'h-8 px-1 gap-0.5',
              'xxs:h-8 xxs:px-1 xxs:gap-0.5',
              'sm:h-8 sm:px-1 sm:gap-0.5',
              'md:h-8 md:px-1 md:gap-0.5',
              'lg:h-9 lg:px-1.5 lg:gap-1',
              'xl:h-9 xl:px-1.5 xl:gap-1',
              '2xl:h-10 2xl:px-2 2xl:gap-1.5',
            ].join(' ')}
          >
            {BRAND_ITEMS.map((brand, i) => (
              <button
                key={`${brand.key}-${isClosing ? 'out' : 'in'}`}
                type='button'
                onClick={(e) => handleBrandClick(e, brand.key, brand.name)}
                aria-label={`Buy on ${brand.name}`}
                className={[
                  isClosing ? 'reel-chip-out' : 'reel-chip-float reel-chip-glow',
                  'relative z-10 shrink-0 overflow-hidden rounded-full cursor-pointer',
                  'size-6 xxs:size-6 sm:size-6 md:size-6 lg:size-7 xl:size-7 2xl:size-8',
                ].join(' ')}
                style={{
                  animationDelay: `${i * (isClosing ? CLOSE_STAGGER_MS : OPEN_STAGGER_MS)}ms`,
                  animationDuration: `${isClosing ? CLOSE_DURATION_MS : OPEN_DURATION_MS}ms`,
                }}
              >
                <Image
                  src={brand.img}
                  alt={brand.name}
                  fill
                  unoptimized
                  className='object-cover object-center'
                />
              </button>
            ))}

            <button
              key={isClosing ? 'close-out' : 'close-in'}
              type='button'
              onClick={handleToggle}
              aria-label='Close store options'
              className={[
                isClosing ? 'reel-close-out' : 'reel-close-in reel-close-spin',
                'relative z-10 ml-0.5 shrink-0 inline-flex items-center justify-center rounded-full',
                'bg-black/55 hover:bg-black/70 text-white',
                'ring-1 ring-white/40',
                'transition-all duration-150 active:scale-90 hover:rotate-90',
                'size-6 xxs:size-6 sm:size-6 md:size-6 lg:size-7 xl:size-7 2xl:size-8',
              ].join(' ')}
              style={{
                animationDelay: `${BRAND_ITEMS.length * (isClosing ? CLOSE_STAGGER_MS : OPEN_STAGGER_MS)}ms`,
                animationDuration: `${isClosing ? CLOSE_DURATION_MS : OPEN_DURATION_MS}ms`,
              }}
            >
              <svg
                viewBox='0 0 14 14'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
                aria-hidden
                className='size-2.5 xxs:size-2.5 sm:size-2.5 md:size-2.5 lg:size-3 xl:size-3 2xl:size-3.5'
              >
                <path d='M3 3L11 11M11 3L3 11' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
              </svg>
            </button>
          </div>
        )}
      </div>}
    </>
  )
}

export default ReelBuyButton
