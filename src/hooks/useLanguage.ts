import { useCallback } from "react";
import useAppSelector from "./useSelector";
import useAppDispatch from "./useDispatch";
import { setLanguage } from "@/store/language/language.slice";
import { useQueryClient } from "@tanstack/react-query";
import {
  createAlloyPayLoad,
  routesToName,
  triggerAlloyEvents,
} from "@/utils/alloyEvents";
import { usePathname } from "next/navigation";

export const useLanguage = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { selectedLanguage } = useAppSelector((state) => state.language);
  const { user } = useAppSelector((state) => state.profile);
  const pathname = usePathname();

  const triggerLangChangeCDPEvent = useCallback(
    (lang: string) => {
      if (user?.id && lang) {
        const paylaod = createAlloyPayLoad({
          eventType: "Click",
          eventSubType: lang,
          hashedKocid: "",
          languageCode: lang,
          webPageName: routesToName[pathname as keyof typeof routesToName],
        });
        triggerAlloyEvents(paylaod);
      }
    },
    [user?.id]
  );

  const changeLanguage = useCallback(
    (languageCode: string) => {
      // Only change if the language is actually different
      if (languageCode !== selectedLanguage) {
        triggerLangChangeCDPEvent(languageCode);
        dispatch(setLanguage(languageCode));

        // Invalidate all React Query cache to ensure fresh data with new language
        queryClient.invalidateQueries();
      }
    },
    [dispatch, selectedLanguage, queryClient, triggerLangChangeCDPEvent]
  );

  const getApiLocale = useCallback(() => {
    return selectedLanguage;
  }, [selectedLanguage]);

  return {
    selectedLanguage,
    changeLanguage,
    getApiLocale,
  };
};
