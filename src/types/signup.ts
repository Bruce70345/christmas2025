export type SignupPayload = {
  name: string;
  address: string;
  postcardTheme: string;
  contact?: string;
  songSuggestion?: string;
};

export type SignupRequestPayload = SignupPayload & {
  turnstileToken?: string;
};

export type SignupEntry = SignupPayload & {
  timestamp: string;
};
