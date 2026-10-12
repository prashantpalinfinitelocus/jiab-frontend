import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MemeService } from "../services/MemeService";
import { keys } from "../utils";
import useAppSelector from "@/hooks/useSelector";
import { IGetMemeFeedParams, IMemeReaction, IMemeVoteRequest, IGetUserMemesParams, IGetTrendingTemplatesParams, IGetAutocompleteParams, ISearchTemplatesParams, ISubmitMemeRequest } from "../types/MemeTypes";

const memeInstance = MemeService.getInstance();

/**
 * Hook to fetch memes feed with infinite scrolling
 */
export const useGetMemeFeed = (params: IGetMemeFeedParams = {}) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Convert language mnemonic to language ID if language is provided
  const modifiedParams = { ...params };
  if (params.language) {
    modifiedParams.language = params.language;
  }

  return useInfiniteQuery({
    queryKey: [...keys.meme.getMemeFeed(), modifiedParams],
    queryFn: async ({ pageParam }) => {
      const queryParams = {
        ...modifiedParams,
        cursor: pageParam,
      };
      return memeInstance.GetMemeFeed(queryParams);
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // Return the cursor for the next page, or undefined if no more pages
      return lastPage?.data?.cursor || undefined;
    },
    enabled: !!(isAuthenticated && token),
    staleTime: 0,
  });
};

/**
 * Hook to fetch memes feed using regular query (for non-infinite scroll use cases)
 */
export const useGetMemeFeedQuery = (params: IGetMemeFeedParams = {}) => {
  // Convert language mnemonic to language ID if language is provided
  const modifiedParams = { ...params };
  if (params.language) {
    modifiedParams.language = params.language;
  }

  return useMutation({
    mutationFn: (queryParams: IGetMemeFeedParams) => {
      const finalParams = { ...modifiedParams, ...queryParams };
      return memeInstance.GetMemeFeed(finalParams);
    },
  });
};

/**
 * Hook to post a reaction on a meme
 */
export const usePostMemeReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: IMemeReaction) => memeInstance.PostMemeReaction(data),
    onSuccess: () => {
      // Invalidate meme feed queries to refetch with updated reactions
      queryClient.invalidateQueries({
        queryKey: [...keys.meme.getMemeFeed()],
      });
    },
  });
};

/**
 * Hook to vote on a meme
 */
export const useVoteMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IMemeVoteRequest) => memeInstance.VoteMeme(payload),
    onSuccess: () => {
      // Invalidate meme feed queries to refresh hasVoted state and counts
      queryClient.invalidateQueries({
        queryKey: [...keys.meme.getMemeFeed()],
      });
    },
  });
};

/**
 * Hook to increment meme view count
 */
export const useIncrementMemeView = () => {
  return useMutation({
    mutationFn: (memeId: string) => memeInstance.IncrementMemeView(memeId),
  });
};

/**
 * Hook to delete one of the user's own memes
 */
export const useDeleteMeme = () => {
  return useMutation({
    mutationFn: (memeId: string) => memeInstance.DeleteMeme(memeId),
  });
};

/**
 * Hook to fetch user memes
 */
export const useGetUserMemesQuery = (params: IGetUserMemesParams = {}) => {
  return useMutation({
    mutationFn: (queryParams: IGetUserMemesParams = {}) => {
      const finalParams = { ...params, ...queryParams };
      return memeInstance.GetUserMemes(finalParams);
    },
  });
};

/**
 * Hook to fetch trending templates
 */
export const useGetTrendingTemplates = (params: IGetTrendingTemplatesParams = {}) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: [...keys.templates.getTrendingTemplates(), params],
    queryFn: () => memeInstance.GetTrendingTemplates(params),
    enabled: !!(isAuthenticated && token),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch template autocomplete suggestions
 */
export const useGetAutocomplete = (params: IGetAutocompleteParams) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: [...keys.templates.getAutocomplete(), params],
    queryFn: () => memeInstance.GetAutocomplete(params),
    enabled: !!(isAuthenticated && token && params.q && params.q.length > 0),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook to search templates
 */
export const useSearchTemplates = (params: ISearchTemplatesParams) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey: [...keys.templates.searchTemplates(), params],
    queryFn: () => memeInstance.SearchTemplates(params),
    enabled: !!(isAuthenticated && token && params.q && params.q.length > 0),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to submit a meme
 */
export const useSubmitMeme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ISubmitMemeRequest) => memeInstance.SubmitMeme(payload),
    onSuccess: () => {
      // Invalidate user memes queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: [...keys.meme.getMemeFeed()],
      });
    },
  });
};

/**
 * Hook to generate meme asset (binary blob)
 */
export const useGenerateMeme = () => {
  return useMutation({
    mutationFn: (payload: {
      meme?: File | Blob;
      memeUrl?: string;
      top_text?: string;
      bottom_text?: string;
    }) => memeInstance.GenerateMeme(payload),
  });
};

