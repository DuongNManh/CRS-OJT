import { SystemRole } from "@/interfaces/auth.interface";

export type TokenResponse = {
  token: string;
  tokenExpiration: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  expiration: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  systemRole: SystemRole;
  department: string;
  avatarUrl: string;
};

export type LogoutResponse = {
  message: string;
  statusCode: number;
  isSuccess: boolean;
};

export type AuthLoginData = LoginResponse;
