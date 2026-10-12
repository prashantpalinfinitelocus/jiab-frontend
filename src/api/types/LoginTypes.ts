export type TRequestOTP = {
  mobile_number: string;
};

export type TVerifyOTP = {
  otp: string;
  mobile_number: string;
};

export type TSignUp = {
  avatar: string;
  email: string;
  full_name: string;
  mobile_number: string;
  referral_code: string;
  device_token?: string;
};

export type TRefreshToken = {
  refresh_token: string;
};

export type TSsoAuthenticate = {
  sso_token: string;
};

export type TSsoAuthenticateSuccessData = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user_id: string;
  phone_number: string;
  name: string;
  is_new_user: boolean;
};
