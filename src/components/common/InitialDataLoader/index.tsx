"use client";
import { LOCAL_STORAGE_KEYS } from "@/api/client/config";
import { useMutateRefreshToken, useMutateSsoAuthenticate } from "@/api/hooks/LoginHooks";
import {
  useGetUserAddresses,
  useGetAvatarsData,
  useGetUserProfileDetails,
  useChangeChatLanguage
} from '@/api/hooks/ProfileHooks'
import {
  useGetNotifications,
  useGetNotificationCount
} from '@/api/hooks/NotificationHooks'
import { MainService } from '@/api/services/MainService'
import { useGluedin } from '@/hooks/useGluedin'
import {
  FACEBOOK_PIXEL_EVENTS,
  FLOOD_LIGHT_EVENTS,
  LANGUAGE_IDS,
  MNEMONICS_TO_ID,
  REDUX_UPDATION_TYPES,
  SESSION_STORAGE_KEYS
} from '@/constants'
import useAppDispatch from '@/hooks/useDispatch'
import {
  updateIsAuthenticated,
  updateToken,
  updateGludeinIsAuthenticated,
  updateRefreshTokenNotVerified,
  updateLoginModal,
  updateIsFirstLogin,
  updateOtpVerified,
  updateOtpFilled,
  updateSurpriseMe,
  updateRefreshRing
} from '@/store/auth/auth.slice'
import {
  updateAddresses,
  updateAvatarsData,
  updateBalance,
  updateRank,
  updateReferralData,
  updateUser,
  updateUserSubmittedJokes
} from '@/store/profile/profile.slice'
import {
  getLocalStorageItem,
  setLocalStorageItem,
  getSessionStorageItem,
  setSessionStorageItem,
  removeSessionStorageItem,
  clearLocalStoragePreservingLanguage
} from '@/utils'
import { ReactNode, useEffect, useState } from 'react'
import { useGetAllReferrals } from '@/api/hooks/ReferralHooks'
import { useMutateGludeinLogin } from '@/api/hooks/GluedinHooks'
import {
  useGetGenres,
  useGetJokesFormats,
  useGetLanguages
} from '@/api/hooks/ReferenceHooks'
import {
  updateGenres,
  updateJokesFormats,
  updateLanguages
} from '@/store/reference'
import { useGetUserSubmittedJokes } from '@/api/hooks/JokeHooks'
import { clearAllModalSessions } from '@/hooks/useSessionModal'
import { usePathname } from 'next/navigation'
import useAppSelector from '@/hooks/useSelector'
import { setLanguage } from '@/store/language/language.slice'
import { useGetUserGeolocation } from '@/api/hooks/GeolocationHooks'
import { useSendCDPEvent } from '@/api/hooks/CDPHooks'
import {
  BaseCDPEventPayload,
  CDPEventPayloadBuilder,
  LandingPageCDPEventPayload,
} from "@/api/utils/cdpEvents";
import { ILocalGeoData } from "@/api/types/GeolocationTypes";
import { useQueryParams } from "@/hooks/useQueryParams";
import { useNotificationRouteRefetch } from "@/hooks/useNotificationRouteRefetch";
import { triggerFloodLightEvents, triggerPixelEvents, triggerSSOLoginSuccessEvent } from "@/utils/gTagEvents";
import { routesToName } from "@/utils/alloyEvents";
let mainServiceInstance: MainService | null = null;
if (typeof window !== "undefined") {
  mainServiceInstance = MainService.getInstance();
}

const InitialDataLoader = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const [tokenUpdated, setTokenUpdated] = useState(false)
  const { data: userProfileData } = useGetUserProfileDetails()
  const { data: userAddressesData } = useGetUserAddresses()
  const { mutate: mutateGludeinLogin, data: gluedinLoginData } =
    useMutateGludeinLogin()

  const { refresh: refreshTokenFromParams, lang: langKey, sso_token: ssoTokenFromParams } = useQueryParams()

  const { data: referralData } = useGetAllReferrals({ page: 1 })
  const { data: avatarsData } = useGetAvatarsData()
  const { data: genresData } = useGetGenres()
  const { data: languagesData } = useGetLanguages()
  const { data: jokesFormatsData } = useGetJokesFormats()

  const gluedIn = useGluedin()

  useEffect(() => {
    if (gluedIn) {
      // you can now call gluedIn.login(), gluedIn.track(), etc
    }
  }, [gluedIn])

  // RCA Detected ================================================
  const { data: userSubmittedJokesData } = useGetUserSubmittedJokes()
  // RCA Detected END ================================================

  useGetUserGeolocation({
    enabled: true,
    params: 'userGeolocation'
  })
  const { mutate: mutateChangeChatLanguage } = useChangeChatLanguage()
  const { selectedLanguage } = useAppSelector(state => state.language)
  const pathName = usePathname()

  // Fetch notifications when user is authenticated - this will be called on page load
  const { data: notificationsData } = useGetNotifications({
    page_number: 1,
    page_size: 10
  })

  // Fetch notification count when user is authenticated - this will be called on page load
  const { data: notificationCountData } = useGetNotificationCount()


  // Setup notification refetching on route changes
  useNotificationRouteRefetch()

  useEffect(() => {
    if (pathName === '/') {
      triggerFloodLightEvents(FLOOD_LIGHT_EVENTS.Sprite_JIAB25_HomePage_Counter)
      triggerPixelEvents(FACEBOOK_PIXEL_EVENTS.SPRITE_HOMEPAGE)
    }
    triggerPixelEvents(FACEBOOK_PIXEL_EVENTS.PAGE_VIEW)
  }, [pathName])

  const {
    mutate: mutateRefreshToken,
    data: refreshTokenData,
    isPending: refreshTokenLoading
  } = useMutateRefreshToken()
  const {
    mutate: mutateSsoAuthenticate,
    data: ssoAuthenticateData
  } = useMutateSsoAuthenticate()
  const { mutate: sendCDPEvent } = useSendCDPEvent()

  const trigerConsentPush = (
    userId: string,
    phoneNumber: string,
    email: string
  ) => {
    if (
      userId &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      const payload: BaseCDPEventPayload =
        CDPEventPayloadBuilder.buildPushConsentPayload({
          phone_e164: phoneNumber,
          email: email
        })
      const getConsentPushEventTriggered = getSessionStorageItem(
        SESSION_STORAGE_KEYS.CONSENT_PUSH_EVENT_TRIGGERED
      )
      const getConsentPushEventTriggeredWA = getSessionStorageItem(
        SESSION_STORAGE_KEYS.CONSENT_PUSH_EVENT_TRIGGERED_WA
      )
      if (
        getConsentPushEventTriggered !== 'true' &&
        getConsentPushEventTriggeredWA !== 'true'
      ) {
        // trackClick(CDP_EVENT_SUB_TYPES.CONSENT_PUSH)
        setSessionStorageItem(
          SESSION_STORAGE_KEYS.CONSENT_PUSH_EVENT_TRIGGERED_WA,
          'true'
        )
        setSessionStorageItem(
          SESSION_STORAGE_KEYS.CONSENT_PUSH_EVENT_TRIGGERED,
          'true'
        )
      }
    }
  }

  useEffect(() => {
    try {
      const signupKeepAlive = getSessionStorageItem(
        SESSION_STORAGE_KEYS.SIGNUP_KEEP_ALIVE
      )
      if (signupKeepAlive && pathname === '/') {
        const { accessToken } = JSON.parse(signupKeepAlive)
        if (accessToken) {
          dispatch(updateOtpFilled({ otpFilled: true }))
          mainServiceInstance?.setAccessToken(accessToken)
          dispatch(updateToken({ token: accessToken }))
          setLocalStorageItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken)
          dispatch(updateIsFirstLogin({ isFirstLogin: true }))
          dispatch(updateOtpVerified({ otpVerified: true }))
          dispatch(updateIsAuthenticated({ isAuthenticated: true }))
        }
      }
    } catch (error) {
      console.error('[InitialDataLoader2] Error in signup keep alive', error)
    }
  }, [pathname, dispatch])

  useEffect(() => {
    try {
      if (langKey) {
        const langCode =
          LANGUAGE_IDS[langKey as unknown as keyof typeof LANGUAGE_IDS] ?? 1
        dispatch(setLanguage(langCode))
      }
    } catch (error) {
      console.error('[InitialDataLoader3] Error in lang key', error)
    }
  }, [langKey, dispatch])

  // Auto-login via SSO: a partner site redirects here with ?sso_token=...,
  // exchange it for real tokens before the normal refresh-token flow runs.
  useEffect(() => {
    try {
      if (
        getSessionStorageItem(SESSION_STORAGE_KEYS.LOGGED_IN_USING_SSO) ===
        'true'
      ) {
        return
      }
      if (ssoTokenFromParams) {
        mutateSsoAuthenticate({ sso_token: ssoTokenFromParams })
      }
    } catch (error) {
      console.error('[InitialDataLoader] Error in sso token', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssoTokenFromParams])

  useEffect(() => {
    try {
      if (ssoTokenFromParams) {
        // SSO auto-login is handled by its own effect below; skip the
        // refresh-token fallback so the two flows don't race each other.
        return
      }
      if (
        getSessionStorageItem(SESSION_STORAGE_KEYS.LOGEED_IN_USING_WHATSAPP) ===
        'true'
      ) {
        removeSessionStorageItem(SESSION_STORAGE_KEYS.LOGEED_IN_USING_WHATSAPP)
        return
      }
      const refreshToken =
        getLocalStorageItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN) ??
        refreshTokenFromParams
      if (refreshToken) {
        mutateRefreshToken({ refresh_token: refreshToken })
        const userDetails = getLocalStorageItem(LOCAL_STORAGE_KEYS.USER_DETAILS)
        const addressesDetails = getLocalStorageItem(
          LOCAL_STORAGE_KEYS.ADDRESSES
        )
        if (userDetails) {
          const { rank, current_balance, user } = JSON.parse(userDetails)
          dispatch(updateRank({ rank }))
          dispatch(updateBalance({ current_balance }))
          dispatch(updateUser({ user }))
        }
        if (addressesDetails) {
          const data = JSON.parse(addressesDetails)
          dispatch(updateAddresses({ addresses: data?.addresses }))
        }
      } else {
        if (
          getSessionStorageItem(SESSION_STORAGE_KEYS.SIGNUP_KEEP_ALIVE) &&
          pathname === '/'
        ) {
          dispatch(updateIsAuthenticated({ isAuthenticated: true }))
        } else {
          dispatch(updateIsAuthenticated({ isAuthenticated: false }))
        }
        dispatch(updateToken({ token: '' }))
        dispatch(
          updateRefreshTokenNotVerified({ refreshTokenNotVerified: true })
        )
      }
    } catch (error) {
      console.error('[InitialDataLoader4] Error in refresh token', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTokenFromParams])

  useEffect(() => {
    try {
      if (refreshTokenData?.ok) {
        const { data } = refreshTokenData ?? {}
        const { access_token, refresh_token } = data ?? {}
        dispatch(updateToken({ token: access_token }))
        mainServiceInstance?.setAccessToken(access_token)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, access_token)
        setTokenUpdated(true)
        dispatch(updateSurpriseMe({ surpriseMe: true }))
        if (refreshTokenFromParams) {
          if (pathName === '/refresh-rings') {
            setSessionStorageItem(SESSION_STORAGE_KEYS.WA_REFRESH_RINGS, 'true')
            dispatch(updateRefreshRing({ refreshRing: true }))
            setSessionStorageItem(
              SESSION_STORAGE_KEYS.REFRESH_RING_LANG_ID,
              `${langKey}`
            )
          }
          removeSessionStorageItem(
            SESSION_STORAGE_KEYS.HAS_SHOWN_SERIAL_CHILL_MODAL
          )
          setSessionStorageItem(
            SESSION_STORAGE_KEYS.LOGEED_IN_USING_WHATSAPP,
            'true'
          )
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname)
          }
        }
      } else if (refreshTokenData?.ok === false) {
        clearLocalStoragePreservingLanguage()
        dispatch(updateIsAuthenticated({ isAuthenticated: false }))
        if (refreshTokenFromParams) {
          dispatch(updateLoginModal({ loginModal: true }))
        }
        dispatch(updateToken({ token: '' }))
        clearAllModalSessions()
        removeSessionStorageItem(SESSION_STORAGE_KEYS.REFRESH_RING_LANG_ID)
        removeSessionStorageItem(SESSION_STORAGE_KEYS.WA_REFRESH_RINGS)
      }
    } catch (error) {
      console.error('[InitialDataLoader5] Error in refresh token', error)
    }
  }, [refreshTokenLoading, refreshTokenData, dispatch, refreshTokenFromParams])

  useEffect(() => {
    try {
      if (ssoAuthenticateData?.ok) {
        const { data } = ssoAuthenticateData ?? {}
        const { access_token, refresh_token, user_id } = data ?? {}
        dispatch(updateToken({ token: access_token }))
        mainServiceInstance?.setAccessToken(access_token)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, access_token)
        dispatch(updateIsFirstLogin({ isFirstLogin: false }))
        dispatch(updateOtpFilled({ otpFilled: true }))
        dispatch(updateOtpVerified({ otpVerified: true }))
        dispatch(updateIsAuthenticated({ isAuthenticated: true }))
        dispatch(updateSurpriseMe({ surpriseMe: true }))
        removeSessionStorageItem(SESSION_STORAGE_KEYS.HAS_SHOWN_SERIAL_CHILL_MODAL)
        setSessionStorageItem(SESSION_STORAGE_KEYS.LOGGED_IN_USING_SSO, 'true')
        triggerSSOLoginSuccessEvent(user_id ?? '', routesToName['/'])
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname)
        }
      } else if (ssoAuthenticateData?.ok === false) {
        setSessionStorageItem(SESSION_STORAGE_KEYS.LOGGED_IN_USING_SSO, 'true')
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname)
        }
      }
    } catch (error) {
      console.error('[InitialDataLoader] Error in sso authenticate', error)
    }
  }, [ssoAuthenticateData, dispatch])

  useEffect(() => {
    try {
      if (tokenUpdated) {
        setTimeout(() => {
          dispatch(updateIsAuthenticated({ isAuthenticated: true }))
          setTokenUpdated(false)
        }, 1000)
      }
    } catch (error) {
      console.error('[InitialDataLoader6] Error in token updated', error)
    }
  }, [tokenUpdated, dispatch])

  // Handle profile data changes
  useEffect(() => {
    try {
      if (userProfileData?.ok) {
        const geoLocationData = JSON.parse(
          getLocalStorageItem(LOCAL_STORAGE_KEYS.USER_GEOLOCATION) ?? '{}'
        ) as ILocalGeoData
        const { data } = userProfileData?.data ?? {}
        dispatch(updateRank({ rank: data?.rank }))
        dispatch(updateBalance({ current_balance: data?.current_balance }))
        dispatch(updateUser({ user: { ...data?.user } }))
        const localData = {
          rank: data?.rank,
          current_balance: data?.current_balance,
          user: { ...data?.user }
        }
        trigerConsentPush(
          data?.user?.id,
          data?.user?.phone_number,
          data?.user?.email
        )
        const waLandingPending = getSessionStorageItem(
          SESSION_STORAGE_KEYS.LANDING_PAGE_FROM_WA_PENDING
        )
        if (waLandingPending === 'true' || refreshTokenFromParams) {
          // trackPageView(CDP_EVENT_SUB_TYPES.LANDING_PAGE_LOAD_FROM_WA)
          removeSessionStorageItem(
            SESSION_STORAGE_KEYS.LANDING_PAGE_FROM_WA_PENDING
          )
        } else {
          const payload: LandingPageCDPEventPayload =
            CDPEventPayloadBuilder.buildLandingPagePayload({
              ...geoLocationData,
              phone_e164: data?.user?.phone_number ?? '',
              email: data?.user?.email ?? ''
            })
          const getLandEventTriggered = getSessionStorageItem(
            SESSION_STORAGE_KEYS.LANDING_PAGE_EVENT_TRIGGERED
          )
          if (getLandEventTriggered !== 'true') {
            // trackPageView(CDP_EVENT_SUB_TYPES.LANDING_PAGE_LOAD)

            setSessionStorageItem(
              SESSION_STORAGE_KEYS.LANDING_PAGE_EVENT_TRIGGERED,
              'true'
            )
          }
        }
        if (data?.user?.id) {
          const user_id = data.user.id
          mutateGludeinLogin({ user_id })
        }
        setLocalStorageItem(
          LOCAL_STORAGE_KEYS.USER_DETAILS,
          JSON.stringify(localData)
        )
      }
    } catch (error) {
      console.error('[InitialDataLoader7] Error in user profile data', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfileData, dispatch])

  useEffect(() => {
    try {
      if (userAddressesData?.ok) {
        const { data } = userAddressesData ?? {}
        dispatch(
          updateAddresses({
            type: REDUX_UPDATION_TYPES.MULTIPLE_ADDED,
            address: data
          })
        )
        const localData = {
          addresses: data
        }
        setLocalStorageItem(
          LOCAL_STORAGE_KEYS.ADDRESSES,
          JSON.stringify(localData)
        )
      }
    } catch (error) {
      console.error('[InitialDataLoader8] Error in user addresses data', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAddressesData, dispatch])

  useEffect(() => {
    try {
      if (referralData?.ok) {
        const { data } = referralData ?? {}
        dispatch(
          updateReferralData({
            referral_data: data?.referral_data ?? [],
            type: REDUX_UPDATION_TYPES.MULTIPLE_ADDED
          })
        )
      }
    } catch (error) {
      console.error('[InitialDataLoader9] Error in referral data', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralData, dispatch])

  useEffect(() => {
    try {
      if (avatarsData?.ok) {
        const modifiedData = avatarsData?.data?.map(
          (item: { id: number; name: string; image_url: string }) => ({
            id: item.id,
            name: item.name,
            image: item.image_url
          })
        )
        dispatch(updateAvatarsData({ avatarsData: modifiedData ?? [] }))
      }
    } catch (error) {
      console.error('[InitialDataLoader10] Error in avatars data', error)
    }
  }, [avatarsData, dispatch])

  useEffect(() => {
    try {
      if (gluedinLoginData?.ok) {
        dispatch(updateGludeinIsAuthenticated({ gludeinIsAuthenticated: true }))
      }
    } catch (error) {
      console.error('[InitialDataLoader11] Error in gluedin login data', error)
    }
  }, [gluedinLoginData, dispatch])

  useEffect(() => {
    try {
      if (genresData?.ok) {
        const { data } = genresData ?? {}
        dispatch(updateGenres({ genres: data?.data?.genres ?? [] }))
      }
    } catch (error) {
      console.error('[InitialDataLoader12] Error in genres data', error)
    }
  }, [genresData, dispatch])

  useEffect(() => {
    try {
      if (languagesData?.ok) {
        const { data } = languagesData ?? {}
        dispatch(updateLanguages({ languages: data?.languages ?? [] }))
      }
    } catch (error) {
      console.error('[InitialDataLoader13] Error in languages data', error)
    }
  }, [languagesData, dispatch])

  useEffect(() => {
    try {
      if (userSubmittedJokesData?.ok) {
        const { data } = userSubmittedJokesData ?? {}
        dispatch(updateUserSubmittedJokes({ userSubmittedJokes: data ?? [] }))
      }
    } catch (error) {
      console.error(
        '[InitialDataLoader14] Error in user submitted jokes data',
        error
      )
    }
  }, [userSubmittedJokesData, dispatch])

  useEffect(() => {
    try {
      if (jokesFormatsData?.ok) {
        const { data } = jokesFormatsData ?? {}
        dispatch(updateJokesFormats({ jokesFormats: data?.formats ?? [] }))
      }
    } catch (error) {
      console.error('[InitialDataLoader15] Error in jokes formats data', error)
    }
  }, [jokesFormatsData, dispatch])

  useEffect(() => {
    try {
      if (selectedLanguage && isAuthenticated) {
        const languageId =
          MNEMONICS_TO_ID[selectedLanguage as keyof typeof MNEMONICS_TO_ID]
        if (languageId) {
          mutateChangeChatLanguage(languageId.toString())
        }
      }
    } catch (error) {
      console.error('[InitialDataLoader16] Error in selected language', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, isAuthenticated])

  // Handle notifications data when loaded on page load
  useEffect(() => {
    try {
      if (notificationsData?.ok && isAuthenticated) {
        // Additional logic can be added here if needed
      }
    } catch (error) {
      console.error('[InitialDataLoader17] Error in notifications data', error)
    }
  }, [notificationsData, isAuthenticated])

  // Handle notification count data when loaded on page load
  useEffect(() => {
    try {
      if (notificationCountData?.ok && isAuthenticated) {
        // The notification badge will automatically update due to React Query's reactivity
      }
    } catch (error) {
      console.error(
        '[InitialDataLoader18] Error in notification count data',
        error
      )
    }
  }, [notificationCountData, isAuthenticated])

  useEffect(() => {
    try {
      if (!isAuthenticated) {
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.PREVIOUS_PATH)
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_PATH)
      }
    } catch (error) {
      console.error('[InitialDataLoader19] Error in pathname', error)
    }
  }, [pathname, isAuthenticated])

  return <>{children}</>
}

export default InitialDataLoader
