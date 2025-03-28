// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import axiosInstance from "@/apis/axiosInstance";
import {
  ApiResponse,
  PagingResponse,
} from "@/interfaces/apiresponse.interface";
import {
  ClaimDetailResponse,
  ClaimExportRequest,
  ClaimStatusCountResponse,
  GetClaimResponse,
  ReturnClaimResponse,
} from "@/interfaces/claim.interface";

export const claimService = {
  claimsEndpoint: "/claims",
  claimEndpoint: "/claim",
  claimExportEndpoint: "/claim-export",

  async getClaimTypes(): Promise<ApiResponse<string[]>> {
    try {
        const response = await axiosInstance.get<ApiResponse<string[]>>(`${this.claimsEndpoint}/types`);
        return response.data;
    } catch (error: unknown) {
        const apiError = (error as any).response?.data as ApiResponse<any>; // Specify a type instead of 'any'
        
        if (apiError) {
            throw new Error(apiError.reason || 'Get claims failed');
        }
        throw new Error('Network error occurred');
    }
},

  async createClaim(claim: any): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        `${this.claimsEndpoint}`,
        claim,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Create claim failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async submitClaim(claimId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        `${this.claimEndpoint}/submit?id=${claimId}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Submit claim failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async getClaims(
    claimStatus: string,
    pageNumber: number,
    pageSize: number,
    viewMode: string,
    startDate: string,
    endDate: string,
  ): Promise<PagingResponse<GetClaimResponse>> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<PagingResponse<GetClaimResponse>>
      >(
        `${this.claimsEndpoint}?viewMode=${viewMode}&claimStatus=${claimStatus}&pageNumber=${pageNumber}&pageSize=${pageSize}&startDate=${startDate}&endDate=${endDate}`,
      );

      // Ensure we return a valid PagingResponse structure
      return {
        items: response.data.data.items || [], // Default to an empty array if undefined
        meta: response.data.data.meta || {
          totalPages: 0,
          currentPage: 0,
          pageSize: 0,
          totalItems: 0,
        }, // Default meta if undefined
      };
    } catch (error: unknown) {
      const apiError = (error as any).response?.data as ApiResponse<any>; // Specify a type instead of 'any'
      if (apiError) {
        throw new Error(apiError.reason || "Get claims failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async getClaimById(
    claimId: string,
  ): Promise<ApiResponse<ClaimDetailResponse>> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<ClaimDetailResponse>
      >(`${this.claimEndpoint}/${claimId}`);
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Get claim failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async approveClaim(claimId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosInstance.put<ApiResponse<boolean>>(
        `${this.claimEndpoint}/approve?claimId=${claimId}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Approve claim failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async updateClaim(claim: any): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.put<ApiResponse<any>>(
        `${this.claimEndpoint}/update?id=${claim.id}`,
        claim,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Update claim failed");
      }
      throw new Error("Network error occurred");
    }
  },

  // async deleteClaim(claimId: string): Promise<ApiResponse<any>> {
  //     try {
  //         const response = await axiosInstance.delete<ApiResponse<any>>(`${this.claimEndpoint}/${claimId}`);
  //         return response.data;
  //     } catch (error: any) {
  //         const apiError = error.response?.data as ApiResponse<any>;
  //         if (apiError) {
  //             throw new Error(apiError.reason || 'Delete claim failed');
  //         }
  //         throw new Error('Network error occurred');
  //     }
  // },

  async getClaimStatusCount(
    viewMode: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<ClaimStatusCountResponse>> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<ClaimStatusCountResponse>
      >(
        `${this.claimsEndpoint}/status-count?viewMode=${viewMode}&startDate=${startDate}&endDate=${endDate}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Get claim statuses failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async returnClaim(
    claimId: string,
    remark: string,
  ): Promise<ApiResponse<ReturnClaimResponse>> {
    try {
      const response = await axiosInstance.post<
        ApiResponse<ReturnClaimResponse>
      >(`${this.claimEndpoint}/return`, {
        claimId,
        remark,
      });
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Return claim failed");
      }
      throw new Error("Network error occurred");
    }
  },

  async rejectClaim(claimId: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosInstance.put<ApiResponse<boolean>>(
        `${this.claimEndpoint}/reject?claimId=${claimId}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Reject claim failed");
      }
      throw new Error("Network error occurred");
    }
  },
  async cancelClaim(id: string, remark: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await axiosInstance.put<ApiResponse<boolean>>(
        `${this.claimEndpoint}/cancel?id=${id}&remark=${remark}`,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Cancel claim failed");
      }
      throw new Error("Network error occurred");
    }
  },
  async payClaim(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await axiosInstance.put(`claim/paid?id=${id}`);
      return { success: true, message: "Claim cancelled successfully!" };
    } catch (error) {
      throw error;
    }
  },
  async getClaimExportByList(request: ClaimExportRequest): Promise<Blob> {
    try {
      const response = await axiosInstance.post(
        `${this.claimExportEndpoint}/export`,
        request,
        {
          responseType: "blob",
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error("Failed to export claims");
    }
  },

  async getClaimExportByRange(
    startDate: string,
    endDate: string,
  ): Promise<Blob> {
    try {
      const response = await axiosInstance.post(
        `${this.claimExportEndpoint}/export-range?startDate=${startDate}&endDate=${endDate}`,
        {}, // Empty body object
        {
          responseType: "blob", // Move responseType to the config object (third parameter)
        },
      );
      return response.data;
    } catch (error: any) {
      throw new Error("Failed to export claims");
    }
  },

  async submitClaimV2(claim: any): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.post<ApiResponse<any>>(
        `${this.claimsEndpoint}/submit-v2`,
        claim,
      );
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Create claim failed");
      }
      throw new Error("Network error occurred");
    }
  },
};
