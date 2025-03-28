export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  systemRole: SystemRole;
  department: string;
  avatarUrl: string;
}

export interface ILoginResponse {
  token: string;
  user: IAuthUser;
  expiration: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRequestOtpRequest {
  email: string;
}

export interface IVerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface IResetPasswordRequest {
  email: string;
  newPassword: string;
}

export enum SystemRole {
  ADMIN = "Admin",
  APPROVER = "Approver",
  STAFF = "Staff",
  FINANCE = "Finance",
}
