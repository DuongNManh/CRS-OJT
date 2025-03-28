import { ApiResponse } from '@/interfaces/apiresponse.interface';
import axiosInstance from '../constant/axiosInstance';
import { ILoginResponse, ILoginRequest, IRequestOtpRequest, IResetPasswordRequest } from '@/interfaces/auth.interface';
import { cacheService } from './cacheService';

export const authService = {

  authEndpoint: '/auth',
  otpVerified: false,
  passwordReset: false,

  async login(credentials: ILoginRequest): Promise<ApiResponse<ILoginResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<ILoginResponse>>(this.authEndpoint+'/login', credentials);
      console.log(response.data);
      this.otpVerified = false; // Reset the flag on login
      this.passwordReset = false; // Reset the password reset flag on login
      return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      console.log(apiError);
      if (apiError) {
        throw new Error(apiError.reason || 'Login failed');
      }
      throw new Error("Network Error occured!");
    }
  },

  async requestOtp(request: IRequestOtpRequest): Promise<void> {
    if (this.otpVerified) {
      throw new Error('OTP has already been verified. Cannot request a new OTP.');
    }
    try {
      await axiosInstance.post('/auth/requestrevcode', request);
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      console.log(apiError);
      if (apiError) {
        throw new Error(apiError.reason || 'Failed to request OTP');
      }
      throw new Error('Network error occurred');
    }
  },

  async resetPassword(request: IResetPasswordRequest & { otpCode: string }): Promise<void> {
    try {
      await axiosInstance.post('/auth/changepassword', request);
      this.otpVerified = false; // Reset the flag after password reset
      this.passwordReset = true; // Set the password reset flag
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      console.log(apiError);
      if (apiError) {
        throw new Error(apiError.reason || 'Failed to reset password');
      }
      throw new Error('Network error occurred');
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('token');
      this.otpVerified = false;
      this.passwordReset = false;
      // Clear all cache data on logout
      cacheService.clear();
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('token');
      this.otpVerified = false;
      this.passwordReset = false;
      // Clear all cache data even if logout fails
      cacheService.clear();
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    localStorage.setItem('token', token);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};
