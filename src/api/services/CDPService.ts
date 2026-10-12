import { AxiosError } from "axios";
import { CDP_API_URL } from "@/config";
import {
  BaseCDPEventPayload,
  LandingPageCDPEventPayload,
  RegistrationCDPEventPayload,
  LoginCDPEventPayload,
  LanguageCDPEventPayload,
  SocialMediaCDPEventPayload,
  ReactionCDPEventPayload,
  UGCSubmissionCDPEventPayload,
  JokeCategoryCDPEventPayload,
  UGCFilterCDPEventPayload,
  ReferralCompletedCDPEventPayload,
  AddressCDPEventPayload,
  ProfileCDPEventPayload,
  QuestionCDPPayload,
  TransactionCodeCDPEventPayload,
  ProgressiveProfilingCDPEventPayload,
  BuyNowCDPEventPayload,
} from "../utils/cdpEvents";
import apiClient from "../client";
import { API_ROUTES, LOCAL_STORAGE_KEYS } from "../client/config";
import { AUTHORIZATION_TYPES } from "../client/constant";

export class CDPService {
  private static instance: CDPService;

  public static getInstance(): CDPService {
    if (!CDPService.instance) {
      CDPService.instance = new CDPService();
    }
    return CDPService.instance;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    return token
      ? {
          Authorization: `${AUTHORIZATION_TYPES.BEARER} ${token}`,
        }
      : {};
  }

  public async sendCDPEvent(
    payload:
      | BaseCDPEventPayload
      | LandingPageCDPEventPayload
      | RegistrationCDPEventPayload
      | LoginCDPEventPayload
      | LanguageCDPEventPayload
      | SocialMediaCDPEventPayload
      | ReactionCDPEventPayload
      | UGCSubmissionCDPEventPayload
      | JokeCategoryCDPEventPayload
      | UGCFilterCDPEventPayload
      | ReferralCompletedCDPEventPayload
      | AddressCDPEventPayload
      | ProfileCDPEventPayload
      | QuestionCDPPayload
      | TransactionCodeCDPEventPayload
      | ProgressiveProfilingCDPEventPayload
      | BuyNowCDPEventPayload
  ) {
    try {
      const { email, ...rest } = payload;
      const newPayload = {
        ...rest,
        ...(email ? { email } : {}),
      };
      const response = await apiClient.post(API_ROUTES.CDP.EVENT, newPayload, {
        headers: this.getAuthHeaders(),
      });
      if (!response?.data?.success) {
        throw new Error(response?.data?.message);
      }
    } catch (error) {}
  }
}
