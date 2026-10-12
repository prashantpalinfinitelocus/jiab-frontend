import apiClient from "../client";
import { ErrorResponse, SuccessResponse } from "../utils/responseConvertor";
import { API_ROUTES, LOCAL_STORAGE_KEYS } from "../client/config";
import { MainService } from "./MainService";
import { getLocalStorageItem } from "@/utils";
import { AUTHORIZATION_TYPES } from "../client/constant";
import {
  IGetMemeFeedParams,
  IMemeReaction,
  IMemeReactionResponse,
  IMemeVoteRequest,
  IMemeVoteResponse,
  IGetUserMemesParams,
  IGetTrendingTemplatesParams,
  IGetAutocompleteParams,
  ISearchTemplatesParams,
  ISubmitMemeRequest,
  ISubmitMemeResponse,
} from "../types/MemeTypes";
// duplicate import removed

export class MemeService extends MainService {
  private static instance: MemeService;

  public static getInstance(): MemeService {
    if (!MemeService.instance) {
      MemeService.instance = new MemeService();
    }
    return MemeService.instance;
  }

  private deriveFilenameFromBlob(blob: File | Blob, baseName: string): string {
    // Preserve original filename if provided via File
    if (typeof File !== "undefined" && blob instanceof File && blob.name) {
      return blob.name;
    }

    const mime = blob.type || "";
    let ext = ".bin";
    if (mime === "image/gif") ext = ".gif";
    else if (mime === "image/png") ext = ".png";
    else if (mime === "image/jpeg") ext = ".jpg";
    else if (mime === "image/webp") ext = ".webp";
    else if (mime === "image/svg+xml") ext = ".svg";
    else if (mime === "video/mp4") ext = ".mp4";
    return `${baseName}${ext}`;
  }

  private getAuthHeaders() {
    const token = getLocalStorageItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    return token
      ? {
          Authorization: `${AUTHORIZATION_TYPES.BEARER} ${token}`,
        }
      : {};
  }

  /**
   * Fetch paginated memes feed
   * Corresponds to GET /memes/feed
   */
  // Multipart uploads need more headroom than the global 10s timeout.
  private static readonly UPLOAD_TIMEOUT_MS = 60000;

  public async GetMemeFeed({
    language,
    q,
    limit = 6,
    cursor,
    trending,
  }: IGetMemeFeedParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (language) queryParams.append("language", language.toString());
      if (q) queryParams.append("q", q);
      if (limit) queryParams.append("limit", limit.toString());
      if (cursor) queryParams.append("cursor", cursor);
      if (typeof trending === "boolean") queryParams.append("trending", String(trending));

      const endpoint = `${API_ROUTES.MEMES.GET_FEED}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      const responseData = response.data;
      if (responseData?.success) {
        return SuccessResponse(responseData.data);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to fetch meme feed:", error);
      throw error;
    }
  }

  /**
   * Post reaction on a meme
   */
  public async PostMemeReaction(data: IMemeReaction) {
    try {
      const { memeId, reaction } = data;
      const endpoint =
        typeof API_ROUTES.MEMES.POST_REACTION === "function"
          ? API_ROUTES.MEMES.POST_REACTION(memeId)
          : `${API_ROUTES.MEMES.POST_REACTION}/${memeId}`;

      const response = await apiClient.post(
        endpoint,
        { reaction },
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        }
      );
      const responseData = response.data;
      if (responseData) {
        const normalized: IMemeReactionResponse = {
          message: responseData?.message ?? "",
          show_coin_animation: !!responseData?.data?.show_coin_animation,
        };
        return SuccessResponse(normalized);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to post meme reaction:", error);
      throw error;
    }
  }

  /**
   * Fetch user memes
   * GET /memes/user
   */
  public async GetUserMemes({
    status,
    limit = 15,
    cursor,
  }: IGetUserMemesParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (status) queryParams.append("status", status.toString());
      if (limit) queryParams.append("limit", limit.toString());
      if (cursor) queryParams.append("cursor", cursor);

      const endpoint = `${API_ROUTES.MEMES.GET_USER}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      const responseData = response.data;
      if (responseData?.success) {
        return SuccessResponse(responseData.data);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to fetch user memes:", error);
      throw error;
    }
  }

  /**
   * Vote on a meme
   * POST /memes/vote
   */
  public async VoteMeme(payload: IMemeVoteRequest) {
    try {
      const response = await apiClient.post(API_ROUTES.MEMES.VOTE, payload, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      const responseData = response.data;
      if (responseData) {
        const normalized: IMemeVoteResponse = {
          message: responseData?.message ?? "",
          show_coin_animation: !!responseData?.data?.show_coin_animation,
        };
        return SuccessResponse(normalized);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to vote on meme:", error);
      throw error;
    }
  }

  /**
   * Increment meme view count
   * POST /memes/{meme_id}/view
   */
  public async IncrementMemeView(memeId: string) {
    try {
      const endpoint =
        typeof API_ROUTES.MEMES.VIEW === "function"
          ? API_ROUTES.MEMES.VIEW(memeId)
          : `${API_ROUTES.MEMES.VIEW}/${memeId}`;

      const response = await apiClient.post(
        endpoint,
        {},
        {
          headers: {
            ...this.getAuthHeaders(),
          },
        }
      );

      const responseData = response.data;
      if (responseData?.memeId) {
        return SuccessResponse({
          memeId: responseData.memeId,
          viewCount: responseData.viewCount ?? 0,
        });
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to increment meme view:", error);
      throw error;
    }
  }

  /**
   * Get trending templates
   * GET /templates/trending
   */
  public async GetTrendingTemplates({
    limit = 25,
    offset = 0,
    rating,
    bundle,
    type = "gifs",
  }: IGetTrendingTemplatesParams = {}) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());
      if (rating) queryParams.append("rating", rating);
      if (bundle) queryParams.append("bundle", bundle);
      queryParams.append("type", type);

      const endpoint = `${
        API_ROUTES.TEMPLATES.GET_TRENDING
      }?${queryParams.toString()}`;

      const response = await apiClient.get(endpoint, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      const responseData = response.data;
      if (responseData?.success) {
        return SuccessResponse(responseData.data);
      }
      // If response doesn't have success flag but has data, assume it's successful
      if (Array.isArray(responseData)) {
        return SuccessResponse(responseData);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to fetch trending templates:", error);
      throw error;
    }
  }

  /**
   * Get template autocomplete suggestions
   * GET /templates/autocomplete
   */
  public async GetAutocomplete({
    q,
    limit = 25,
    offset = 0,
    type = "gifs",
  }: IGetAutocompleteParams) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", q);
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());
      queryParams.append("type", type);

      const endpoint = `${
        API_ROUTES.TEMPLATES.AUTOCOMPLETE
      }?${queryParams.toString()}`;

      const response = await apiClient.get(endpoint, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      const responseData = response.data;
      if (responseData?.success) {
        return SuccessResponse(responseData.data);
      }
      // If response doesn't have success flag but has data, assume it's successful
      if (Array.isArray(responseData)) {
        return SuccessResponse(responseData);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to fetch autocomplete suggestions:", error);
      throw error;
    }
  }

  /**
   * Search templates
   * GET /templates/search
   */
  public async SearchTemplates({
    q,
    limit = 25,
    offset = 0,
    rating,
    lang,
    bundle,
    type = "gifs",
  }: ISearchTemplatesParams) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("q", q);
      queryParams.append("limit", limit.toString());
      queryParams.append("offset", offset.toString());
      if (rating) queryParams.append("rating", rating);
      if (lang) queryParams.append("lang", lang);
      if (bundle) queryParams.append("bundle", bundle);
      queryParams.append("type", type);

      const endpoint = `${
        API_ROUTES.TEMPLATES.SEARCH
      }?${queryParams.toString()}`;

      const response = await apiClient.get(endpoint, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      const responseData = response.data;
      if (responseData?.success) {
        return SuccessResponse(responseData.data);
      }
      // If response doesn't have success flag but has data, assume it's successful
      if (Array.isArray(responseData)) {
        return SuccessResponse(responseData);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to search templates:", error);
      throw error;
    }
  }

  /**
   * Submit a meme
   * POST /memes
   */
  public async SubmitMeme(payload: ISubmitMemeRequest) {
    try {
      const formData = new FormData();
      formData.append("language_id", payload.language_id.toString());
      formData.append("template_id", payload.template_id);
      if (payload.text1) {
        formData.append("text1", payload.text1);
      }
      if (payload.text2) {
        formData.append("text2", payload.text2);
      }
      // Ensure filename reflects actual mime (e.g., .gif when sending GIFs)
      formData.append(
        "asset",
        payload.asset,
        this.deriveFilenameFromBlob(payload.asset, "meme")
      );

      const response = await apiClient.post(
        API_ROUTES.MEMES.SUBMIT,
        formData,
        {
          timeout: MemeService.UPLOAD_TIMEOUT_MS,
          headers: {
            ...this.getAuthHeaders(),
            // Let the browser set the Content-Type with the correct boundary
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const responseData = response.data;
      if (responseData?.memeId || responseData?.success) {
        const normalized: ISubmitMemeResponse = {
          memeId: responseData?.memeId ?? "",
          status: responseData?.status ?? "PENDING",
        };
        return SuccessResponse(normalized);
      }
      return ErrorResponse(responseData?.message ?? "Something went wrong");
    } catch (error) {
      console.error("Failed to submit meme:", error);
      throw error;
    }
  }

  /**
   * Generate a meme asset from either an already-uploaded blob or, preferably,
   * a template URL the backend can fetch itself (memeUrl). Returns binary (Blob).
   * POST /main/api/v1/meme-generator/generate-stream
   */
  public async GenerateMeme({
    meme,
    memeUrl,
    top_text,
    bottom_text,
  }: {
    meme?: File | Blob;
    memeUrl?: string;
    top_text?: string;
    bottom_text?: string;
  }): Promise<Blob> {
    try {
      if (!meme && !memeUrl) {
        throw new Error("GenerateMeme requires either meme or memeUrl");
      }

      const formData = new FormData();
      if (memeUrl) {
        // Backend fetches the template server-side - the browser never
        // downloads it just to re-upload the same bytes back to us.
        formData.append("meme_url", memeUrl);
      } else if (meme) {
        formData.append("meme", meme, this.deriveFilenameFromBlob(meme, "template"));
      }
      if (top_text) formData.append("top_text", top_text);
      if (bottom_text) formData.append("bottom_text", bottom_text);

      const response = await apiClient.post(API_ROUTES.MEMES.GENERATE_STREAM, formData, {
        timeout: MemeService.UPLOAD_TIMEOUT_MS,
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "multipart/form-data",
          // generate-stream returns the composed image/gif or image/png bytes
          // directly, so we never fetch the asset back from GCS (that bucket
          // sends no CORS headers) and animated GIFs survive.
          Accept: "image/gif, image/png, image/*",
        },
        responseType: "blob",
      });

      // Axios with responseType blob returns Blob in data
      const blob = response?.data as Blob;
      if (!blob) {
        throw new Error("Empty binary response");
      }
      return blob;
    } catch (error) {
      console.error("Failed to generate meme:", error);
      throw error;
    }
  }
}
