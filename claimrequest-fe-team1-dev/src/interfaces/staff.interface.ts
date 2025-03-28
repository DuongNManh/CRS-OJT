import { SystemRole } from "./auth.interface";

export interface GetStaffResponse {
  //id: string; // Assuming Guid can be represented as a string in TypeScript
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  salary: number;
}

export interface ICreateStaffRequest {
  name: string;
  email: string;
  password: string;
  role: SystemRole;
  department: string;
  salary: number;
}

export interface ICreateStaffResponse {
  id: string;
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  salary: number;
}

export interface IStaff extends ICreateStaffResponse {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IStaffDetails {
  id: string;
  name: string;
  email: string;
  systemRole: SystemRole;
  department: string;
  salary: number;
  isActive: boolean;
  avatarUrl: string;
}
