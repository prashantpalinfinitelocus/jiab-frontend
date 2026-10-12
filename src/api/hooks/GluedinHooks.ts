import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GLUEDIN_LOGIN_SECRET_KEY } from "@/config";
import { encryptData } from "@/utils";
import { GluedinService } from "../services/GluedinService";
import {
  TGludeinFeedList,
  TGludeinHallOfLame,
  TGludeinHomePageJokeList,
  TGludeinJokes,
  TGludeinLogin,
  TGludeinReport,
  TGludeinUserReaction,
  TGludeinUserVote,
} from "../types/GluedinTypes";
import { keys } from "../utils";
import useAppSelector from "@/hooks/useSelector";
import { useComicCoinRevalidation } from "@/hooks/useComicCoinRevalidation";
import { useGluedin } from "@/hooks/useGluedin";

const gluedinInstance = GluedinService.getInstance();

const useMutateGludeinLogin = () => {
  const [accessToken, setAccessToken] = useState<string>("");
  const gluedin = useGluedin();

  const setData = async () => {
    const data = await encryptData("", GLUEDIN_LOGIN_SECRET_KEY || "");
    setAccessToken(data);
  };

  useEffect(() => {
    setData();
  }, []);

  return useMutation({
    mutationFn: (data: TGludeinLogin) =>
      gluedinInstance.GludeinLogin({
        user_id: data.user_id,
        accessToken: accessToken,
        gluedin,
      }),
    retry: 3,
  });
};

const useGetGluedinFeedList = (params: TGludeinFeedList) => {
  const gluedin = useGluedin();
  const { isAuthenticated, token, gludeinIsAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  return useQuery({
    queryKey: [...keys.gluedin.getGluedinFeedList(), { ...params }],
    queryFn: () => gluedinInstance.getGluedinFeedList(params, gluedin),
    enabled: isAuthenticated && token && gludeinIsAuthenticated ? true : false,
    staleTime: 0,
  });
};

const useGetHomePageJokeList = (params: TGludeinHomePageJokeList) => {
  const gluedin = useGluedin();
  const { isAuthenticated, token, gludeinIsAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  return useQuery({
    queryKey: [...keys.gluedin.getGluedinFeedList(), { ...params }],
    queryFn: () => gluedinInstance.getHomePageJokeList(params, gluedin),
    enabled: isAuthenticated && token && gludeinIsAuthenticated ? true : false,
    staleTime: 0,
  });
};
// const useGetGluedinUserVoteList = (params: any) => {
//   const { isAuthenticated, token, gludeinIsAuthenticated } = useAppSelector(
//     (state) => state.auth
//   );

//   return useQuery({
//     queryKey: [...keys.gluedin.getGluedinUserVoteList(), { ...params }],
//     queryFn: () => gluedinInstance.getGluedinUserVoteList(),
//     enabled: isAuthenticated && token && gludeinIsAuthenticated ? true : false,
//     staleTime: 0,
//   });
// };

const useSendGluedinUserReaction = () => {
  const { revalidateWithSync } = useComicCoinRevalidation();
  const gluedin = useGluedin();
  return useMutation({
    mutationFn: (data: TGludeinUserReaction) =>
      gluedinInstance.sendGluedinUserReaction(data, gluedin),
    onSuccess: () => {
      // Revalidate comic coins when reaction is successful (reactions give coins)
      // Add delay to allow backend to process the coin increment
      revalidateWithSync(500);
    },
  });
};

const useSendVoteToGluedinAssets = () => {
  const { revalidateWithSync } = useComicCoinRevalidation();
  const gluedin = useGluedin();
  return useMutation({
    mutationFn: (data: TGludeinUserVote) =>
      gluedinInstance.sendVoteToGluedinAssets(data, gluedin),
    onSuccess: () => {
      // Revalidate comic coins when vote is successful (votes give coins)
      // Add delay to allow backend to process the coin increment
      revalidateWithSync(500);
    },
  });
};

const useGetGluedinCategoryList = () => {
  const gluedin = useGluedin();
  return useQuery({
    queryKey: [...keys.gluedin.getGluedinCategoryList()],
    queryFn: () => gluedinInstance.getGluedinCategoryList(gluedin),
    staleTime: 0,
  });
};

const useGetGluedinAssetById = (assetIds: string) => {
  const { isAuthenticated, token, gludeinIsAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const gluedin = useGluedin();
  return useQuery({
    queryKey: [...keys.gluedin.getGluedinAssetById(), { assetIds }],
    queryFn: () => gluedinInstance.getGluedinAssetById(assetIds, gluedin),
    enabled: isAuthenticated && token && gludeinIsAuthenticated ? true : false,
    staleTime: 0,
  });
};

const useViewGludeinJokes = () => {
  const gluedin = useGluedin();
  return useMutation({
    mutationFn: (data: TGludeinJokes) =>
      gluedinInstance.viewGludeinJokes(data, gluedin),
  });
};

const useGetHallOfLames = (data: TGludeinHallOfLame) => {
  const { isAuthenticated, token, gludeinIsAuthenticated } = useAppSelector(
    (state) => state.auth
  );
  const gluedin = useGluedin();
  return useQuery({
    queryKey: [...keys.gluedin.getHallOfLame(), { ...data }],
    queryFn: () => gluedinInstance.getHallOfLame(data, gluedin),
    enabled: isAuthenticated && token && gludeinIsAuthenticated ? true : false,
    staleTime: 0,
  });
};

const useSendReportToGluedin = () => {
  const gluedin = useGluedin();
  return useMutation({
    mutationFn: (data: TGludeinReport) =>
      gluedinInstance.sendReportToGluedin(data, gluedin),
  });
};

export {
  useMutateGludeinLogin,
  useGetGluedinFeedList,
  // useGetGluedinUserVoteList,
  useSendGluedinUserReaction,
  useSendVoteToGluedinAssets,
  useGetGluedinCategoryList,
  useGetGluedinAssetById,
  useViewGludeinJokes,
  useGetHallOfLames,
  useSendReportToGluedin,
  useGetHomePageJokeList,
};
