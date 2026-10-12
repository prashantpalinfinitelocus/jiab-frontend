import {
  resetAuth,
  updateRefreshTokenNotVerified,
} from "@/store/auth/auth.slice";
import { secureId } from "@/utils/secure";
import useAppDispatch from "./useDispatch";
import { resetProfile } from "@/store/profile/profile.slice";
import { clearAllModalSessions } from "./useSessionModal";
import { useGetUserGeolocation } from "@/api/hooks/GeolocationHooks";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearLocalStoragePreservingLanguage,
  removeSessionStorageItem,
} from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { keys } from "@/api/utils";
import { SESSION_STORAGE_KEYS } from "@/constants";
import { LOCAL_STORAGE_KEYS } from "@/api/client/config";
import useAlloyEvents from "./useAlloyEvents";

const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { trackClick, CDP_EVENT_SUB_TYPES } = useAlloyEvents();
  const [uniqueId, setUniqueId] = useState<string>("");
  useGetUserGeolocation({
    enabled: true,
    params: uniqueId,
  });

  const logoutHandler = () => {
    trackClick(CDP_EVENT_SUB_TYPES.LOGOUT);
    dispatch(resetAuth());
    dispatch(resetProfile());

    // Clear localStorage while preserving language data
    clearLocalStoragePreservingLanguage();

    // Clear session storage and modal sessions
    clearAllModalSessions();
    sessionStorage.clear();

    // Clear comic coin response from React Query cache
    queryClient.removeQueries({
      queryKey: [...keys.joke.getComicCoins()],
    });

    // Clear all other user-specific queries
    queryClient.removeQueries({
      queryKey: [...keys.profile.userProfileDetails()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.profile.getUserBalanceAndRank()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.referral.getAllReferrals()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.joke.getUserSubmittedJokes()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.notifications.getNotifications()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.notifications.getNotificationCount()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.leaderboard.getLeaderboard()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.profile.getUserAddresses()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.profile.getUserQuestions()],
    });

    queryClient.removeQueries({
      queryKey: [...keys.profile.getVoucherInfo()],
    });

    localStorage.removeItem(LOCAL_STORAGE_KEYS.KOCID);
    setUniqueId(secureId(7));
    removeSessionStorageItem(SESSION_STORAGE_KEYS.HAS_SHOWN_LOCK_MODAL);
    // A saved shared link belongs to the visitor who followed it. Logging out
    // hands the device to whoever signs in next, and they should not be pulled
    // to a meme they never asked for.
    removeSessionStorageItem(SESSION_STORAGE_KEYS.INTENDED_ROUTE);
    dispatch(updateRefreshTokenNotVerified({ refreshTokenNotVerified: true }));
    // Use Next.js router to navigate to homepage instead of page refresh
    router.push("/");
  };

  return { logoutHandler };
};

export default useLogout;
