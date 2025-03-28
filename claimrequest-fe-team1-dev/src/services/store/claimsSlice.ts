import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ClaimStatusCountResponse,
  GetClaimResponse,
} from "@/interfaces/claim.interface";

interface ClaimsState {
  currentPageClaims: GetClaimResponse[];
  totalClaims: number;
  currentPage: number;
  pageSize: number;
  filterStatus: string | null;
  lastViewedPage: number;
  searchQuery: string;
  preserveState: boolean;
  statusCounts: ClaimStatusCountResponse & { total: number };
}

const initialState: ClaimsState = {
  currentPageClaims: [],
  totalClaims: 0,
  currentPage: 1,
  pageSize: 20,
  filterStatus: null,
  lastViewedPage: 1,
  searchQuery: "",
  preserveState: false,
  statusCounts: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
    paid: 0,
    cancelled: 0,
  },
};

const claimsSlice = createSlice({
  name: "claims",
  initialState,
  reducers: {
    setCurrentPageClaims(
      state,
      action: PayloadAction<{
        claims: GetClaimResponse[];
        total: number;
        statusCounts: ClaimStatusCountResponse & { total: number };
      }>,
    ) {
      state.currentPageClaims = action.payload.claims;
      state.totalClaims = action.payload.total;
      state.statusCounts = action.payload.statusCounts;
    },
  },
});

export const { setCurrentPageClaims } = claimsSlice.actions;
export default claimsSlice.reducer;
