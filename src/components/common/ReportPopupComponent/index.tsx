import { isHttpsUrl } from '@/utils/secure'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import CustomPopupWrapper from '../CustomPopupWrapper'
import { GA_EVENTS, ICONS_NAMES } from '@/constants'
import { triggerGAEvent } from '@/utils/gTagEvents'
import ReportPopup from '../ReportPopup'
import { usePathname, useRouter } from 'next/navigation'
import { useSendReportToGluedin } from '@/api/hooks/GluedinHooks'
import { useSendReport } from '@/api/hooks/ReportHooks'
import {
  BaseCDPEventPayload,
  CDPEventPayloadBuilder
} from '@/api/utils/cdpEvents'
import { useSendCDPEvent } from '@/api/hooks/CDPHooks'
import { useCMSData } from '@/data'
import useAppSelector from '@/hooks/useSelector'
import useAlloyEvents from '@/hooks/useAlloyEvents'

const isValidUrl = (url: string) => isHttpsUrl(url)

const isValidUrl2 = (url: string) => url.startsWith('http://') && isHttpsUrl(url, true)

const ReportPopupComponent = ({
  open,
  onClose,
  setOpen,
  assetId,
  userId,
  actingUserId,
  onReported,
  showSuccessPopup = true
}: {
  open: boolean
  onClose: () => void
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  assetId: string
  userId: string
  actingUserId: string
  onReported?: () => void
  /** The jokes success popup, which points to the joke box. Memes show their own toast instead. */
  showSuccessPopup?: boolean
}) => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const cmsData = useCMSData(mounted)
  const [refferalLink, setRefferalLink] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [open2, setOpen2] = useState<boolean>(false)
  const { mutate: sendReportToGluedin, data: reportData } =
    useSendReportToGluedin()
  const { mutate: sendReport } = useSendReport()
  const pathName = usePathname()
  const { reportPopup, thandRakh } = useCMSData()
  const errorRef = useRef(false)
  const { trackClick, CDP_EVENT_SUB_TYPES } = useAlloyEvents()
  const { user } = useAppSelector(state => state.profile)

  const handleChange = (key: string, value: string) => {
    if (value?.length === 0) {
      errorRef.current = true
      setError(cmsData.validation.reportPopupUrlValidation)
    } else {
      if (isValidUrl(value) || isValidUrl2(value)) {
        setError('')
      } else {
        if (errorRef.current) {
          setError(cmsData.validation.reportPopupUrlValidation)
        }
      }
    }
    setRefferalLink(value)
  }
  const { mutate: sendCDPEvent } = useSendCDPEvent()

  const submitReport = () => {
    trackClick(CDP_EVENT_SUB_TYPES.REPORT_JOKES)
    //validate refferal link  
    if (refferalLink.length === 0) {
      setError(cmsData.validation.reportPopupUrlValidation)
      return
    }

    //validate url
    if (!isValidUrl(refferalLink) && !isValidUrl2(refferalLink)) {
      errorRef.current = true
      setError(cmsData.validation.reportPopupUrlValidation)
      return
    }

    // Call both APIs simultaneously
    sendReportToGluedin({
      assetId,
      reason: refferalLink,
      userId: userId,
      actingUserId: actingUserId
    })

    sendReport({
      assetId,
      information: refferalLink
    })
  }

  const triggerReportCDPEvent = useCallback(() => {
    if (userId) {
      const payload: BaseCDPEventPayload =
        CDPEventPayloadBuilder.buildJokeReportedPayload(
          user?.phone_number ?? '',
          user?.email ?? ''
        )
      sendCDPEvent(payload)
    }
  }, [sendCDPEvent, userId])

  useEffect(() => {
    if (reportData?.ok) {
      triggerReportCDPEvent()
      onReported?.()
      setOpen?.(false)
      if (showSuccessPopup) setOpen2(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportData])

  const router = useRouter()

  useEffect(() => {
    return () => {
      setOpen?.(false)
      setOpen2(false)
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {open && (
        <ReportPopup
          title={reportPopup.report_heading}
          ctaText={reportPopup.report_submit_button}
          placeholder={reportPopup.report_placeholder}
          refferalLink={refferalLink}
          onChange={handleChange}
          open={open}
          onSubmit={() => {
            triggerGAEvent(GA_EVENTS.SPRITE_J24_REFER_NOW)
            submitReport()
          }}
          error={error}
          onBlur={() => {
            if (refferalLink.length === 0) {
              setError(cmsData.validation.reportPopupUrlValidation)
              errorRef.current = true
            }
          }}
          onClose={() => {
            onClose()
            setOpen?.(false)
            setOpen2(false)
            setRefferalLink('')
            setError('')
            errorRef.current = false
          }}
        />
      )}
      {open2 && (
        <CustomPopupWrapper
          icon={ICONS_NAMES.CRYING}
          title={thandRakh.thand_rakh_heading}
          subtitle={thandRakh.thand_rakh_subheading}
          singleButtonText={thandRakh.thand_rakh_explore_button}
          singleButtonOnClick={() => {
            if (pathName === '/user-generated-jokes') {
              setOpen2(false)
              setOpen?.(false)
              onClose()
              return
            }
            router.push('/user-generated-jokes')
          }}
          open={open2}
          onClose={() => {
            onClose()
            setOpen?.(false)
            setOpen2(false)
            setRefferalLink('')
            setError('')
            errorRef.current = false
          }}
        />
      )}
    </>
  )
}

export default ReportPopupComponent
