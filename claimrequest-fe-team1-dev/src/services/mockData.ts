import { FinanceDetailData } from '@/interfaces/finance.interface';
import { ClaimRequest } from '@/interfaces/claim.interface';

export const financeDetail: Record<string, FinanceDetailData> = {
  // Your mock data here
};

export const updateClaimStatus = (id: string, status: string): void => {
  // Your update logic here
};

export const claimRequest: ClaimRequest[] = [
  // Your mock data here
]; 