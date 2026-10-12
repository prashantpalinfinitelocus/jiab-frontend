'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel'
import Header from '../common/Header/Header'
import { triggerGAEvent } from '@/utils/gTagEvents'
import { GA_EVENTS } from '@/constants'
import { useCMSData } from '@/data'
import { triggerFloodLightEvents } from "@/utils/gTagEvents";
import useAppSelector from '@/hooks/useSelector'
import { useSendCDPEvent } from '@/api/hooks/CDPHooks'
import { CDPEventPayloadBuilder } from '@/api/utils/cdpEvents'

type BuyNowItem = {
  id: number;
  image: string;
  title: string;
  link?: string;
  floodLightEvent?:string;
  mobileLink?: string;
  webLink?: string;
};

interface BuyNowCarouselProps {
  items?: BuyNowItem[]
  className?: string
}

const BuyNowCarousel: React.FC<BuyNowCarouselProps> = ({
  items = [],
  className
}) => {
  const { homePage } = useCMSData()
  const { user } = useAppSelector(state => state.profile)
  const { mutate: sendCDPEvent } = useSendCDPEvent()
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const pages = useMemo(() => {
    if (!items || items.length === 0) return [] as BuyNowItem[][]
    // On mobile, show 2 items per page
    if (isMobile) {
      const chunkedMobile: BuyNowItem[][] = []
      for (let i = 0; i < items.length; i += 2) {
        chunkedMobile.push(items.slice(i, i + 2))
      }
      return chunkedMobile
    }
    const chunked: BuyNowItem[][] = []
    for (let i = 0; i < items.length; i += 3) {
      chunked.push(items.slice(i, i + 3))
    }
    return chunked
  }, [items, isMobile])

  useEffect(() => {
    if (!api) return

    const updateFromApi = () => {
      const snaps = api.scrollSnapList()
      setPageCount(snaps?.length || 0 || pages.length)
      setCurrent(api.selectedScrollSnap())
    }

    updateFromApi()
    api.on('select', updateFromApi)
    api.on('reInit', updateFromApi)
    return () => {
      api.off('select', updateFromApi)
      api.off('reInit', updateFromApi)
    }
  }, [api, pages.length])

  // Detect viewport for mobile/web specific links
  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < 768)
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
    return () => window.removeEventListener('resize', updateIsMobile)
  }, [])

  const goToPage = (index: number) => {
    if (!api) return
    api.scrollTo(index)
  }

  if (!items.length) return null

  return (
    <>
      <Header
        title={homePage?.buyNow ?? 'BUY NOW'}
        className='md:mt-[58px] md:mb-[24px] mt-[20px] mb-[16px]'
      />
      <Carousel
        className={className ?? 'mx-0 md:mx-0'}
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
          containScroll: 'trimSnaps',
          skipSnaps: false,
          slidesToScroll: 1
        }}
      >
        <CarouselContent className='ml-0 md:-ml-4'>
          {pages.map((page, pageIdx) => (
            <CarouselItem
              key={`buy-now-page-${pageIdx}`}
              className='pl-0 md:pl-4 basis-full'
            >
              <div className={
                (isMobile ? page.length < 2 : page.length < 3)
                  ? 'flex flex-wrap gap-[12px] md:gap-6 justify-center md:[&>*]:w-[calc((100%-48px)/3)]'
                  : 'grid grid-cols-[repeat(2,165.5px)] md:grid-cols-3 gap-[12px] md:gap-6 justify-center md:justify-start'
              }>
                {page.map(item => {
                  const resolvedHref =
                    item.mobileLink || item.webLink
                      ? isMobile
                        ? item.mobileLink ?? item.webLink
                        : item.webLink ?? item.mobileLink
                      : item.link
                  const href = resolvedHref ?? '#'
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (user?.id) {
                          sendCDPEvent(
                            CDPEventPayloadBuilder.buildBuyNowPayload(
                              item.title,
                              user?.phone_number ?? ""
                            )
                          )
                        }
                        triggerGAEvent(GA_EVENTS.BUY_NOW, {
                          promotion_id: item?.title,
                          promotion_name: item?.title,
                          redirect_domain:
                            item?.link ??
                            item?.webLink ??
                            item?.mobileLink ??
                            '',
                          redirect_url: href
                        })
                        if (href) {
                          window.open(href, '_blank', 'noopener,noreferrer')
                        }
                      }}
                      // href={href}
                      // target="_blank"
                      // rel="noopener noreferrer"
                      className='block w-[165.5px] md:w-auto'
                    >
                      <div onClick={()=>{
                        if(item?.floodLightEvent){
                          triggerFloodLightEvents(item.floodLightEvent)
                        }
                      }} className="bg-white w-[165.5px] h-[165.5px] md:w-auto md:h-auto md:min-h-[325px] lg:min-h-[350px] rounded-[3.95px]">
                        <div className="flex flex-col items-center justify-center h-[105px] md:min-h-[250px]">
                          <Image
                            src={item.image}
                            alt={`buy-now-item-${item.id}`}
                            width={296}
                            height={94}
                            className='md:w-[296px] md:h-[94px] w-[120px] h-auto object-contain md:mx-0 mx-0 md:px-[30px] px-0'
                          />
                        </div>
                        <div className='flex flex-col items-center md:items-start justify-center md:min-h-[100px] min-h-0 md:ms-[32px] ms-0'>
                          <h3 className='md:text-[20px] text-[16px] font-[600] text-center md:text-left'>
                            {item.title}
                          </h3>
                          <div className='md:text-[16px] text-[12px] font-[600] flex items-center gap-[4px] underline'>
                            {homePage.buyNow}
                            <Image
                              src='/other-svgs/chev-right.svg'
                              alt='chevron-right'
                              className='md:w-[8px] md:h-[11.8px] mt-[2px] w-[6px] h-[8px]'
                              width={8}
                              height={11.8}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className='flex justify-center md:gap-2 gap-[1.77px] mt-[8px]'>
        {Array.from({ length: pageCount }).map((_, index) => (
          <button
            key={`buy-now-slide-${index}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === current
                ? 'w-[17.73px] bg-black'
                : 'w-[8.86px] bg-gray-300'
            }`}
            onClick={() => goToPage(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </>
  )
}

export default BuyNowCarousel
