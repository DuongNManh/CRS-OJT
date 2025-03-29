import { ApiResponse } from "@/interfaces/apiresponse.interface";
import axiosInstance from "./axiosInstance";
import { AuthUser, LogoutResponse } from "@/types/auth.types";

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
