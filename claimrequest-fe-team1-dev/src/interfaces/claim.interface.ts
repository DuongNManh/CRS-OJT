import { GetProjectResponse } from "./project.interface";
import { GetStaffResponse } from "./staff.interface";

export interface GetClaimResponse {
  id: string; // Assuming Guid can be represented as a string in TypeScript
  name: string;
  project?: GetProjectResponse;
  claimer: GetStaffResponse;
  status: string;
  totalWorkingHours: number;
  amount: number;
  createAt: string; // The date is represented as a string in the format "MM/DD/YYYY HH:mm:ss A"
  claimApprover: ClaimApproverResponse;
}

export interface CreateClaimRequest {
  projectName: string;
  roleInProject: string;
  projectStartDate: string;
  projectEndDate: string;
  totalWorking: string;
  claimDate: string;
  staffReason: string;
  status: string;
  userId?: string;
}

export interface CreateClaimResponse {
  is_success: boolean;
  message?: string;
  data?: any;
}

export interface ClaimRequest {
  key: string;
  name: string;
  projectName: string;
  claimDate: string;
  totalWorking: string;
  status: 'Approved' | 'Paid';
}

export interface ClaimDetailResponse {
  id: string,
  name: string,
  amount: 0,
  remark: string,
  createAt: string,
  totalWorkingHours: number,
  startDate: string,
  endDate: string,
  claimType: string
  status: string,
  claimApprovers: ClaimApproverResponse[],
  project: GetProjectResponse,
  changeHistory: ClaimChangeLogResponse[],
  finance: GetStaffResponse,
  claimer: GetStaffResponse
}

export interface ClaimChangeLogResponse {
  message: string,
  changedAt: string,
  changedBy: string
}

export interface ClaimApproverResponse {
  approverId : string,
  name: string,
  approverStatus: string,
  decisionAt: string
}

export interface ReturnClaimResponse {
  claimId: string;  // Guid maps to string in TypeScript
  status: string;   // ClaimStatus enum will be represented as string
  remark: string;
  updatedAt: string; // DateTime will be represented as string
}

export interface ClaimStatusCountResponse {
  total : number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  paid: number;
  cancelled: number;
}

export interface ClaimExportRequest {
  selectedClaimIds: string[];
}

export interface ClaimExportResponse {
    fileName: string;
    fileContent: Uint8Array;
    fileContentType: string;
}

