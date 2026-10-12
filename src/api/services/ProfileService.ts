import apiClient from "../client";
import { ErrorResponse, SuccessResponse } from "../utils/responseConvertor";
import { API_ROUTES, LOCAL_STORAGE_KEYS } from "../client/config";
import {
  IAddress,
  TAddessId,
  TAddress,
  TEditProfile,
  TSubmitQuestions,
  TGetQuestionByTextRequest,
  TProfilingQuestionAnswer,
} from "../types/ProfileTypes";
import { MainService } from "./MainService";
import { AUTHORIZATION_TYPES } from "../client/constant";

export class ProfileService extends MainService {
  private static instance: ProfileService;

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    return token
      ? {
          Authorization: `${AUTHORIZATION_TYPES.BEARER} ${token}`,
        }
      : {};
  }

  public async getUserProfileDetails() {
    try {
      const response = await apiClient.get(API_ROUTES.USER.PROFILE.GET, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data);
      }
      return ErrorResponse(data?.message || "Invalid User Id");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getKOCID({ token }: { token?: string }) {
    try {
      const response = await apiClient.get(API_ROUTES.USER.PROFILE.GET_KOCID, {
        headers: token
          ? {
              Authorization: `${AUTHORIZATION_TYPES.BEARER} ${token}`,
            }
          : this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        const kocID = data?.data?.kocid;
        localStorage.setItem(LOCAL_STORAGE_KEYS.KOCID, kocID);
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Failed to fetch KOCID");
    } catch (error) {
      return ErrorResponse("Failed to fetch KOCID");
    }
  }

  public async editUserProfileDetails(userData: TEditProfile) {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      if (userData?.dob) {
        const [day, month, year] = userData?.dob?.split("/");
        const dob = `${month}/${day}/${year}`;
        formData.append("dob", dob);
      }
      if (userData?.gender) {
        formData.append("gender", userData.gender);
      }
      if (userData?.avatar_id) {
        formData.append("avatar_id", userData.avatar_id.toString());
      }
      if (userData?.email) {
        formData.append("email", userData.email);
      }

      if (userData?.avatar_id) {
        formData.append("is_avatar", "true");
      }

      const response = await apiClient.post(
        API_ROUTES.USER.PROFILE.EDIT,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data);
      }
      return ErrorResponse(data?.message || "Invalid User Id");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getUserAddresses() {
    try {
      const response = await apiClient.get(API_ROUTES.USER.ADDRESS.GET, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid User Id");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async addNewAddress(addressData: TAddress) {
    try {
      const response = await apiClient.post(
        API_ROUTES.USER.ADDRESS.ADD,
        { ...addressData },
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid Address Data");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async editAddress(addressData: IAddress) {
    try {
      const endpoint = `${API_ROUTES.USER.ADDRESS.EDIT}${addressData.address_id}`;
      const response = await apiClient.put(
        endpoint,
        { ...addressData },
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid Address Data");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async deleteAddress({ address_id }: TAddessId) {
    try {
      const endpoint = `${API_ROUTES.USER.ADDRESS.DELETE}${address_id}`;
      const response = await apiClient.delete(endpoint, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid Address Data");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getUserBalanceAndRank() {
    try {
      const response = await apiClient.get(API_ROUTES.USER.BALANCE.GET, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data);
      }
      return ErrorResponse(data?.message || "Invalid User Id");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getUserQuestions(language_id: string) {
    try {
      const endpoint = `${API_ROUTES.USER.QUESTIONS.GET}?language_id=${language_id}`;
      const response = await apiClient.get(endpoint, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid User Id");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async submitUserQuestions({ questions }: TSubmitQuestions) {
    try {
      const endpoint = `${API_ROUTES.USER.QUESTIONS.POST}`;

      const response = await apiClient.post(endpoint, questions, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid Questions Data");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getAvatarsData() {
    try {
      const response = await apiClient.get(API_ROUTES.USER.AVATAR, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data?.data ?? []);
      }
      return ErrorResponse(data?.message || "Invalid Avatars Data");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getPincodeData(pincode: string) {
    try {
      const response = await apiClient.get(
        API_ROUTES.USER.ADDRESS.PINCODE_AUTOFILL + pincode,
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid Pincode Data");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async changeChatLanguage(language_id: string) {
    try {
      const endpoint = `${API_ROUTES.USER.CHANGE_CHAT_LANG}?languageId=${language_id}`;
      const response = await apiClient.post(
        endpoint,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      } else {
        throw new Error(data?.message || "Invalid Language Id");
      }
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async getVoucherInfo(language_id: number) {
    try {
      const response = await apiClient.get(
        API_ROUTES.USER.MY_WALLET.GET_VOOCHER_INFO +
          `?language_id=${language_id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Invalid Voucher Info");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async updateComicCoinPopUp() {
    try {
      const response = await apiClient.patch(
        API_ROUTES.USER.COMIC_COIN_POP_UP,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data);
      }
      return ErrorResponse(
        data?.message || "Failed to update comic coin pop up"
      );
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // Get Question By Text
  public async getQuestionByText(request: TGetQuestionByTextRequest) {
    try {
      const response = await apiClient.post(
        API_ROUTES.USER.QUESTIONS.GET_BY_TEXT,
        request,
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Question not found");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // Check Profiling Question Modal
  public async checkProfilingQuestionModal(questionId: number, questionNumber?: number) {
    try {
      let endpoint = `${API_ROUTES.USER.PROFILING_QUESTIONS.CHECK_MODAL}${questionId}`;
      
      // Add question_number as query parameter if provided
      if (questionNumber !== undefined) {
        endpoint += `?question_number=${questionNumber}`;
      }
      
      const response = await apiClient.get(endpoint, {
        headers: this.getAuthHeaders(),
      });
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Failed to check modal status");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // Update Profiling Question Last Viewed
  public async updateProfilingQuestionLastViewed(questionId: number, questionNumber?: number) {
    try {
      let endpoint = `${API_ROUTES.USER.PROFILING_QUESTIONS.UPDATE_LAST_VIEWED}${questionId}`;
      
      // Add question_number to path if provided
      if (questionNumber !== undefined) {
        endpoint += `/${questionNumber}`;
      }
      
      const response = await apiClient.put(
        endpoint,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Failed to update last viewed");
    } catch (error) {
      throw new Error(error as string);
    }
  }

  // Submit Profiling Question Answer
  public async submitProfilingQuestionAnswers(
    answers: TProfilingQuestionAnswer[]
  ) {
    try {
      const response = await apiClient.post(
        API_ROUTES.USER.PROFILING_QUESTIONS.SUBMIT,
        answers,
        {
          headers: this.getAuthHeaders(),
        }
      );
      const data = response.data;
      if (data?.success) {
        return SuccessResponse(data?.data);
      }
      return ErrorResponse(data?.message || "Failed to submit answers");
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
