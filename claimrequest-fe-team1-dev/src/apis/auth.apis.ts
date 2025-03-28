import { SystemRole } from "@/interfaces/auth.interface";
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "@/interfaces/apiresponse.interface";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  systemRole: SystemRole;
  department: string;
  avatarUrl: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
  expiration: string;
};

export type LogoutResponse = {
  message: string;
  statusCode: number;
  isSuccess: boolean;
};

export const doLogout = async (token: string): Promise<LogoutResponse> => {
  const response = await axiosInstance.post(
    `/api/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`, // Pass token in Authorization header
      },
    },
  );

  return response.data;
};

export const doExtractUserFromToken = async (
  token: string,
): Promise<ApiResponse<AuthUser>> => {
  const res = await axiosInstance.post("/auth/extract-token", {
    accessToken: token,
  });
  return res.data;
};
