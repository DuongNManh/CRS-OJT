// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import axiosInstance from "@/apis/axiosInstance";
import {
  ApiResponse,
  PagingResponse,
} from "@/interfaces/apiresponse.interface";
import { GetStaffResponse, IStaffDetails } from "@/interfaces/staff.interface";

export const staffService = {
  staffsEndpoint: "/staffs",
  staffEndpoint: "/staff",
  staffsPagingEndpoint: "/staffs/paging",

  // Read - Get staff list with pagination
  async getStaffList(): Promise<ApiResponse<GetStaffResponse[]>> {
    try {
      const response = await axiosInstance.get<ApiResponse<GetStaffResponse[]>>(
        `${this.staffsEndpoint}`,
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = (error as any).response?.data as ApiResponse<any>;

      if (apiError) {
        throw new Error(apiError.reason || "Get staff list failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async getStaffListPaging(
    pageNumber: number,
    pageSize: number,
    role: string,
    department: string,
  ): Promise<PagingResponse<GetStaffResponse>> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PagingResponse<GetStaffResponse>>
      >(
        `${this.staffsPagingEndpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}&role=${role}&department=${department}`,
      );
      return response.data.data;
    } catch (error: unknown) {
      const apiError = (error as any).response?.data as ApiResponse<any>;

      if (apiError) {
        throw new Error(apiError.reason || "Get staff list failed");
      }
      throw new Error("Network error occurred");
    }
  },

  // Read - Get staff by ID
  async getStaffById(staffId: string): Promise<ApiResponse<GetStaffResponse>> {
    try {
      const response = await axiosInstance.get<ApiResponse<GetStaffResponse>>(
        `${this.staffEndpoint}/${staffId}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Get staff failed");
      }
      throw new Error("Network error occurred");
    }
  },

  // Create - Add new staff
  async createStaff(staffData: any): Promise<ApiResponse<any>> {
    try {
      console.log("staffData", staffData);
      const response = await axiosInstance.post<ApiResponse<any>>(
        `${this.staffEndpoint}/create`,
        staffData,
      );
      return response.data;
    } catch (error: any) {
      // Extract more detailed error information if available
      const apiError = error.response?.data;
      if (apiError && apiError.errors) {
        throw new Error(Object.values(apiError.errors).flat().join(", "));
      } else if (apiError && apiError.reason) {
        throw new Error(apiError.reason);
      }
      throw new Error("One or more validation errors occurred");
    }
  },

  // Update - Modify existing staff
  async updateStaff(
    staffId: string,
    staffData: Partial<GetStaffResponse>,
  ): Promise<ApiResponse<GetStaffResponse>> {
    try {
      const response = await axiosInstance.put<ApiResponse<GetStaffResponse>>(
        `${this.staffEndpoint}/update?id=${staffId}`,
        staffData,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Update staff failed");
      }
      throw new Error("Network error occurred");
    }
  },

  // Delete - Remove staff
  //
  async deleteStaff(staffId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.delete<ApiResponse<any>>(
        `${this.staffEndpoint}/delete?id=${staffId}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Delete staff failed");
      }
      throw new Error("Network error occurred");
    }
  },

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get<ApiResponse<GetStaffResponse[]>>(
        `${this.staffsEndpoint}`,
      );
      const staffList = response.data.data;
      return staffList.some(
        (staff) => staff.email.toLowerCase() === email.toLowerCase(),
      );
    } catch (error: unknown) {
      throw new Error("Failed to check email existence");
    }
  },

  async uploadImageAvatar(formData: FormData): Promise<IStaffDetails> {
    try {
      const response = await axiosInstance.post<IStaffDetails>(
        `${this.staffEndpoint}/upload-avatar`,
        formData,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Update avatar failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async profile(): Promise<ApiResponse<ProfileResponse>> {
    try {
        const response = await axiosInstance.get<ApiResponse<ProfileResponse>>(`${this.staffEndpoint}/profile`);
        return response.data;
    } catch (error: any) {
        const apiError = error.response?.data as ApiResponse<any>;
        if (apiError) {
            throw new Error(apiError.reason || 'Get profile failed');
        }
        throw new Error('Network error occurred');
    }
}
};
