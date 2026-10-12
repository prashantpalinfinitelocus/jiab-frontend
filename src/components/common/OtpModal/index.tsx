import LoginSignupWrapper, {
  AuthHeading,
} from "@/components/LoginSignupWrapper";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Input from "@/components/Input";
import GreenCTA from "@/components/GreenCTA";
import useAppSelector from "@/hooks/useSelector";
import useAppDispatch from "@/hooks/useDispatch";
import { useCMSData } from "@/data";
import {
  updateIsAuthenticated,
  updateIsFirstLogin,
  updateLoginModal,
  updateOtpFilled,
  updateOtpStatus,
  updateOtpVerified,
  updateSurpriseMe,
  updateToken,
  updateOtpVerificationState,
} from "@/store/auth/auth.slice";
import {
  useMutateRequestOTP,
  useMutateVerifyOTP,
} from "@/api/hooks/LoginHooks";
import {
  useGetNotifications,
  useGetNotificationCount,
} from "@/api/hooks/NotificationHooks";
import SvgIcons from "../SvgIcons";
import {
  FACEBOOK_PIXEL_EVENTS,
  FLOOD_LIGHT_EVENTS,
  GA_EVENTS,
  ICONS_NAMES,
  SESSION_STORAGE_KEYS,
  TOKEN_TYPE,
} from "@/constants";
import { MainService } from "@/api/services/MainService";
import { LOCAL_STORAGE_KEYS } from "@/api/client/config";
import {
  // getLocalStorageItem,
  getSessionStorageItem,
  removeSessionStorageItem,
  setLocalStorageItem,
  setSessionStorageItem
} from '@/utils'

import {
  triggerFloodLightEvents,
  triggerGAEvent,
  triggerPixelEvents
} from '@/utils/gTagEvents'
import { useGlobalLoader } from '@/hooks/useGlobalLoader'

interface VerifyOTPSuccessData {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  email?: string;
}

interface VerifyOTPResponse {
  status: number;
  ok: boolean;
  data: VerifyOTPSuccessData | [];
  message?: string;
}

const OtpModal = () => {
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const errorRef = useRef(false);

  const cmsData = useCMSData(mounted);
  const mainServiceInstance = MainService.getInstance();
  const { phoneNumber, disableOtpVerification, otpExceedErrorMessage } =
    useAppSelector((state) => state.auth);

  const { mutate: requestOTP } = useMutateRequestOTP();
  const {
    mutate: verifyOTP,
    isPending,
    data: verifyOTPData,
  } = useMutateVerifyOTP();
  const { showLoader, hideLoader } = useGlobalLoader();

  const { otpSent } = useAppSelector((state) => state.auth);

  const [counter, setCounter] = useState<string>('59')
  const [counterEnd, setCounterEnd] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch notifications after successful login
  const { refetch: refetchNotifications } = useGetNotifications({
    page_number: 1,
    page_size: 10
  })

  // Fetch notification count after successful login
  const { refetch: refetchNotificationCount } = useGetNotificationCount();

  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (otpSent) {
      setOpen(true);
    }
  }, [otpSent]);

  // Add effect to show error message
  useEffect(() => {
    if (disableOtpVerification) {
      setError(otpExceedErrorMessage);
    }
  }, [disableOtpVerification, otpExceedErrorMessage])

  // Timer logic for resend OTP countdown
  useEffect(() => {
    if (otpSent && !counterEnd) {
      timerRef.current = setInterval(() => {
        setCounter(prevCounter => {
          const currentCount = parseInt(prevCounter, 10)
          if (currentCount <= 1) {
            setCounterEnd(true)
            return '00'
          }
          return (currentCount - 1).toString().padStart(2, '0')
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [otpSent, counterEnd])

  const resendOTP = () => {
    showLoader();
    // Reset timer when resending OTP
    setCounter("59");
    setCounterEnd(false);
    requestOTP({ mobile_number: phoneNumber });
  };

  const handlerSubmitOtp = () => {
    triggerGAEvent(GA_EVENTS.SPRITE_J24_OTP_SUBMIT)
    triggerFloodLightEvents(FLOOD_LIGHT_EVENTS.Sprite_JIAB25_VerifyOTP_Counter)
    triggerPixelEvents(FACEBOOK_PIXEL_EVENTS.SPRITE_OTP_SUBMIT)
    if (otp.length === 0) {
      setError(cmsData.validation.otpVerificationRequired);
      return;
    }
    if (otp.length !== 6) {
      setError(cmsData.validation.otpVerificationRequired);
      return;
    }
    showLoader();
    verifyOTP({ otp, mobile_number: phoneNumber });
  };

  useEffect(() => {
    if (!isPending) {
      hideLoader();
    }
  }, [isPending, hideLoader]);



  useEffect(() => {
    const response = verifyOTPData as VerifyOTPResponse;
    if (response?.ok) {
      const verifyTokenData = response.data as VerifyOTPSuccessData;
      const token = verifyTokenData?.access_token ?? "";
      const tokenType = verifyTokenData?.token_type ?? "";
      dispatch(updateToken({ token }));
      dispatch(updateOtpVerified({ otpVerified: true }));

      if (tokenType === TOKEN_TYPE.TEMPORARY) {
        dispatch(updateIsFirstLogin({ isFirstLogin: true }))
        // Ensure KOCID is generated/fetched for first-time users (poll until non-null)
      } else if (tokenType === TOKEN_TYPE.BEARER) {
        const refreshToken = verifyTokenData?.refresh_token ?? "";
        dispatch(updateIsFirstLogin({ isFirstLogin: false }));
        setLocalStorageItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        removeSessionStorageItem(
          SESSION_STORAGE_KEYS.HAS_SHOWN_SERIAL_CHILL_MODAL
        )
        dispatch(updateSurpriseMe({ surpriseMe: true }))
      }
      mainServiceInstance.setAccessToken(token);
      dispatch(updateOtpFilled({ otpFilled: true }));
      dispatch(updateOtpVerified({ otpVerified: true }));
      dispatch(updateIsAuthenticated({ isAuthenticated: true }));
      setOpen(false);

      refetchNotifications();
      refetchNotificationCount();
    } else if (response?.ok === false) {
      if (
        response?.message?.includes("Too many verification attempts") ||
        response?.status === 429
      ) {
        dispatch(
          updateOtpVerificationState({
            disableOtpVerification: true,
            otpExceedErrorMessage: cmsData.validation.otpModalExceed,
          })
        );
        setError(cmsData.validation.otpModalExceed);
      } else {
        setError(cmsData.validation.otpVerificationRequired);
      }
    }
  }, [
    verifyOTPData,
    dispatch,
    mainServiceInstance,
    cmsData,
    refetchNotifications,
    refetchNotificationCount,
  ]);

  return (
    <LoginSignupWrapper open={open} setOpen={setOpen} logo={true}>
      <div
        className={`absolute top-[-42%] left-1/2 transform -translate-x-1/2`}
      >
        <Image
          src="/assets/images/bottle-sprite-t.gif"
          alt="sprite"
          className="h-[200px] w-[166px]  mt-2"
          width={166}
          height={200}
        />
      </div>
      <div className="w-full absolute top-[4px] right-[4px] flex justify-end box-border pt-[10px] pr-[10px]">
        <button
          className="flex justify-center items-center outline-none border-none"
          onClick={() => {
            setOpen(false);
            dispatch(updateIsAuthenticated({ isAuthenticated: false }));
            dispatch(updateIsFirstLogin({ isFirstLogin: false }));
            dispatch(updateOtpVerified({ otpVerified: false }));
            dispatch(updateOtpFilled({ otpFilled: false }));
            dispatch(updateLoginModal({ loginModal: false }));
            dispatch(updateOtpStatus({ otpSent: false }));
          }}
        >
          <SvgIcons name={ICONS_NAMES.CROSS} className="w-[20px] h-[20px]" />
        </button>
      </div>
      <div className={`flex flex-col gap-[12px] pt-[50px]`}>
        <div className="flex flex-col justify-center items-center md:gap-[12px] gap-[4px]">
          <AuthHeading title={cmsData.otp.otpVerification} />
          <p className="text-center text-[#000] font-400 text-[12px]">
            {cmsData.otp.pleaseOtpEnter}
          </p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
          className="flex flex-col gap-[12px]"
        >
          <div className="flex flex-col gap-[10px]">
            <Input
              name="otp"
              value={otp}
              placeholder="OTP*"
              onChange={(key, value) => {
                const numericValue = value?.replace(/[^0-9]/g, "");
                const valueString = numericValue?.slice(0, 6);
                if (
                  valueString?.length < 6 &&
                  errorRef.current &&
                  !disableOtpVerification
                ) {
                  setError(cmsData.validation.otpVerificationRequired);
                } else {
                  setError("");
                }
                if (disableOtpVerification) {
                  setError(otpExceedErrorMessage);
                  return;
                }
                setOtp(valueString);
              }}
              type="text"
              onBlur={() => {
                if (otp?.length < 6) {
                  errorRef.current = true;
                  setError(cmsData.validation.otpVerificationRequired);
                }
                if (disableOtpVerification) {
                  setError(otpExceedErrorMessage);
                }
              }}
            />
            {!counterEnd && !disableOtpVerification && (
              <span
                className={`text-center text-[#606060] font-400 text-[12px]`}
              >
                {cmsData.otp.tryAgainIn} 00:{counter}
              </span>
            )}
            {counterEnd && !disableOtpVerification && (
              <button
                onClick={() => {
                  triggerGAEvent(GA_EVENTS.SPRITE_J24_RESEND_OTP)
                  resendOTP()
                }}
                className={`text-[#606060] self-center border-b-[#606060] border-b-[1px]  font-[500] text-[13px] md:text-[16px] outline-none`}
              >
                {cmsData.otp.resend}
              </button>
            )}
            {error && (
              <span
                className={`text-center text-red font-400 text-[12px] mt-[4px]`}
              >
                {error}
              </span>
            )}
          </div>

          <GreenCTA
            paddingClass="px-[24px] py-[16px]"
            borderRadius="rounded-[112px]"
            fontSize="text-[14px] md:text-[16.5px]"
            disabled={isPending || disableOtpVerification}
            onClick={() => {
              handlerSubmitOtp();
            }}
            text={cmsData.otp.submit}
          />
        </form>
      </div>
    </LoginSignupWrapper>
  );
};

export default OtpModal;
