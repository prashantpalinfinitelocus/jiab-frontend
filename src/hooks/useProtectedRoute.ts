import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PROTECTED_ROUTES } from "@/constants";
import { LOCAL_STORAGE_KEYS } from "@/api/client/config";
import {
  consumeIntendedRoute,
  getLocalStorageItem,
  rememberIntendedRoute,
} from "@/utils";
import useAppSelector from "@/hooks/useSelector";
import useAppDispatch from "@/hooks/useDispatch";
import { updateLoginModal } from "@/store/auth/auth.slice";

export const useProtectedRoute = () => {
  const { isAuthenticated, isFirstLogin } = useAppSelector(
    (state) => state.auth
  );
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = getLocalStorageItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (!accessToken && isProtectedRoute) {
      // Open login modal when trying to access protected route without authentication
      // Only the links people actually share are worth returning to: a shared
      // meme, and the meme creator. Landing on the home page instead loses
      // what the visitor was sent to do. Every other protected route keeps the
      // existing behaviour of simply opening login on the home page.
      const query = searchParams.toString();
      const isSharedMemeLink =
        pathname.startsWith("/meme-burst") &&
        !!searchParams.get("selected_meme");
      const isCreateMemeLink = pathname.startsWith("/create-memes");
      if (isSharedMemeLink || isCreateMemeLink) {
        rememberIntendedRoute(query ? `${pathname}?${query}` : pathname);
      }
      dispatch(updateLoginModal({ loginModal: true }));
      router.push("/");
    }
  }, [isAuthenticated, pathname, searchParams, router, dispatch]);

  // The return trip. This lives beside the redirect that loses the route on
  // purpose: every way of becoming logged in ends up here, so a visitor who
  // arrived on a shared link always finishes on that link rather than on
  // whichever screen the login happened to close on.
  useEffect(() => {
    const accessToken = getLocalStorageItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    // A first-time user holds a temporary token while the signup form is still
    // open - moving them now would cut the form short.
    if (!accessToken || isFirstLogin) return;

    const intendedRoute = consumeIntendedRoute();
    if (!intendedRoute) return;

    const query = searchParams.toString();
    const current = query ? `${pathname}?${query}` : pathname;
    if (intendedRoute !== current) {
      router.replace(intendedRoute);
    }
  }, [isAuthenticated, isFirstLogin, pathname, searchParams, router]);

  const isCurrentRouteProtected = () => {
    return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  };

  return {
    isCurrentRouteProtected,
  };
};
