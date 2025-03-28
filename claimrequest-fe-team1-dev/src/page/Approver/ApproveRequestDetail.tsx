import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApproverLayout from "@/layouts/ApproverLayout";
import { ClaimDetailResponse } from "@/interfaces/claim.interface";
import { claimService } from "@/services/features/claim.service";
import { toast } from "react-toastify";
import ApprovalProgressBar from "@/components/ApprovalProgressBar/ApprovalProgressBar";
import ClaimChangeLog from "@/components/ClaimChangeLog/ClaimChangeLog";
import { cacheService } from "@/services/features/cacheService"; // Import cacheService
import { useAppSelector } from "@/services/store/store";
import { formatDate } from "@/utils/dateFormatter";
import NotFound from "@/components/NotFound/NotFound";
import { CACHE_TAGS } from "@/services/features/cacheService";
import { useApi } from "@/hooks/useApi";

const ApproveRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const date = new Date(claim?.createAt || "");
  const user = useAppSelector((state) => state.auth.user); // Import useAppSelect
  const [loading, setLoading] = useState<boolean>(true);
  const {withLoading} = useApi();

  useEffect(() => {
    setLoading(true);
    const fetchClaimDetail = async () => {
      if (!id) return;

      // Check cache first
      const cacheKey = cacheService.generateClaimDetailCacheKey(id);
      const cachedData = cacheService.get<ClaimDetailResponse>(cacheKey);
      if (cachedData) {
        console.log("Using cached claim data for:", id);
        setClaim(cachedData);
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching claim detail:", id);
        const response = await withLoading(claimService.getClaimById(id as string));
        console.log("API detail:", response);
        if (response && response.is_success && response.data) {
          setClaim(response.data);
          // Store in cache for future use
          cacheService.set(cacheKey, response.data, [
            CACHE_TAGS.CLAIMS,
            CACHE_TAGS.APPROVER_MODE,
            `claim_${id}`
          ]);
        }
      } catch (error: unknown) {
        const errorMessage = (error as Error).message || "An error occurred";
        toast.error(errorMessage);
        console.error(error);
      } finally {
        setLoading(false); 
      }
    };

    fetchClaimDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading claim details...</div>
      </div>
    );
  }

  if (!claim) {
    return <NotFound />;
  }

  const handleApprove = async () => {
    try {
      if (!id) return;
      // Check if user wants to approve claim
      const confirmApprove = window.confirm("Are you sure you want to approve this claim?");
      if (!confirmApprove) return;
      await claimService.approveClaim(id);
      toast.success("Claim approved successfully");
      // Invalidate relevant caches
      cacheService.invalidateByTags([
        CACHE_TAGS.CLAIMS,
        CACHE_TAGS.CLAIM_LISTS,
        CACHE_TAGS.APPROVER_MODE
      ]);
      // Instead of reloading, fetch new data
      const updatedResponse = await claimService.getClaimById(id as string);
      if (updatedResponse.is_success && updatedResponse.data) {
        setClaim(updatedResponse.data);
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || "Failed to approve claim";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleReject = async () => {
    try {
      if (!id) return;
      
      // check if user wants to reject claim
      const confirmReject = window.confirm("Are you sure you want to reject this claim?");
      if (!confirmReject) return;

      await claimService.rejectClaim(id);
      toast.success("Claim rejected successfully");
      // Invalidate relevant caches
      cacheService.invalidateByTags([
        CACHE_TAGS.CLAIMS,
        CACHE_TAGS.CLAIM_LISTS,
        CACHE_TAGS.APPROVER_MODE
      ]);
      window.location.reload();
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "Failed to reject claim";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleReturn = async () => {
    try {
      if (!id) return;
      const remark = window.prompt("Please enter a reason for return:");
      if (!remark) return;
      await claimService.returnClaim(id, remark);
      toast.success("Claim returned successfully");
      navigate(-1);
    } catch (error) {
      const errorMessage = (error as Error).message || "Failed to return claim";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <ApproverLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section - Made more compact */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Claim Request Details</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and process claim request information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            {/* Left Column - Made more compact */}
            <div className="grid grid-rows-[auto_1fr] gap-4">
              {/* Claimer Card - Reduced vertical padding */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <img
                      src="/src/assets/default-avatar.jpeg"
                      alt={claim.claimer.name}
                      className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-fill"
                    />
                  </div>
                </div>
                <div className="pt-12 pb-4 px-4">
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-gray-900">{claim.claimer.name}</h2>
                    <p className="text-sm text-gray-500">{claim.claimer.email}</p>
                    <p className="text-sm font-medium text-blue-600">{claim.claimer.department}</p>
                  </div>
                </div>
              </div>

              {/* Project Information Card - More compact spacing */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  Project Details
                </h3>
                <div className="space-y-3">
                  {/* Project details content remains the same but with reduced padding */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Project Name</p>
                        <p className="font-medium text-gray-900">{claim.project?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(claim.project?.startDate)} - {formatDate(claim.project?.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Project Manager</p>
                        <p className="font-medium text-gray-900">{claim.project?.projectManager}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business Unit Leader</p>
                        <p className="font-medium text-gray-900">{claim.project?.businessUnitLeader}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Reorganized for better visibility */}
            <div className="grid grid-rows-[auto_auto_1fr_auto] gap-4">
              {/* Claim Status Card */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Claim Status</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                    {claim.status}
                  </span>
                </div>
                <ApprovalProgressBar claim={claim} />
              </div>

              {/* Claim Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Claim Information</h3>
                <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Claim Name</p>
                      <p className="font-medium text-gray-900">{claim.name}</p>
                    </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Claim Type</p>
                      <p className="font-medium text-gray-900">{claim.claimType}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium text-gray-900">{date.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500">Total Compensation</p>
                    <p className="text-xl font-bold text-green-600">{claim.amount} VND</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-500 mb-1">Remark</p>
                    <p className="text-gray-900">{claim.remark}</p>
                  </div>
                </div>
              </div>

              {/* Change History Card - Fixed height */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900">Change History</h3>
                <div className="h-[200px] overflow-y-auto pr-2">
                  <ClaimChangeLog claim={claim} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
              {claim.claimApprovers.find(approver => approver.approverId === user?.id)?.approverStatus === "Pending" && (
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={handleReturn}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Return
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
                )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </ApproverLayout>
  );
};

export default ApproveRequestDetail;

