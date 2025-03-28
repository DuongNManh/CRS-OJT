export type TokenResponse = {
  token: string;
  tokenExpiration: string;
};

export type AuthLoginData = Pick<TokenResponse, "token" | "tokenExpiration">;
