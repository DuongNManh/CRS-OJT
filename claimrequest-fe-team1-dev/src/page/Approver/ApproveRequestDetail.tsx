// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { statusColors } from "@/utils/statusColors";
import ClaimDetailLoading from "@/components/Loading/ClaimDetailLoading";
import { useTranslation } from "react-i18next";

const ApproveRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const date = new Date(claim?.createAt || "");
  const user = useAppSelector((state) => state.auth.user); // Import useAppSelect
  const [loading, setLoading] = useState<boolean>(true);
  const { withLoading } = useApi();
  const { t } = useTranslation();

  // Function to fetch claim details with caching
  const fetchClaimDetail = async () => {
    if (!id) return;

    // Check cache first
    const cacheKey = cacheService.generateClaimDetailCacheKey(id);
    const cachedData = cacheService.get<ClaimDetailResponse>(cacheKey);
    if (cachedData) {
      setClaim(cachedData);
      setLoading(false);
      return;
    }

    try {
      const response = await withLoading(
        claimService.getClaimById(id as string),
      );
      if (response && response.is_success && response.data) {
        setClaim(response.data);
        cacheService.set(cacheKey, response.data, [
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.APPROVER_MODE,
          `claim_${id}`,
        ]);
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchClaimDetail(); // Call the new fetch function
  }, [id]);

  if (loading) {
    return <ClaimDetailLoading />;
  }

  if (!claim) {
    return <NotFound />;
  }

  const handleApprove = async () => {
    try {
      if (!id) return;
      const confirmApprove = window.confirm(
        t("approve_request_detail.toast.confirm_approve"),
      );
      if (!confirmApprove) return;

      const response = await withLoading(claimService.approveClaim(id));
      if (response.is_success) {
        toast.success(t("approve_request_detail.toast.approve_success"));
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.APPROVER_MODE,
        ]);
        fetchClaimDetail();
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message ||
        t("approve_request_detail.toast.approve_error");
      toast.error(errorMessage);
    }
  };

  const handleReject = async () => {
    try {
      if (!id) return;
      const confirmReject = window.confirm(
        t("approve_request_detail.toast.confirm_reject"),
      );
      if (!confirmReject) return;

      const response = await withLoading(claimService.rejectClaim(id));
      if (response.is_success) {
        toast.success(t("approve_request_detail.toast.reject_success"));
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.APPROVER_MODE,
        ]);
        fetchClaimDetail();
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message ||
        t("approve_request_detail.toast.reject_error");
      toast.error(errorMessage);
    }
  };

  const handleReturn = async () => {
    try {
      if (!id) return;
      const remark = window.prompt(
        t("approve_request_detail.toast.return_reason_prompt"),
      );
      if (!remark) return;

      const response = await withLoading(claimService.returnClaim(id, remark));
      if (response.is_success) {
        toast.success(t("approve_request_detail.toast.return_success"));
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.APPROVER_MODE,
        ]);
        fetchClaimDetail();
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message ||
        t("approve_request_detail.toast.return_error");
      toast.error(errorMessage);
    }
  };

  return (
    <ApproverLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-[#0E1217] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section - Made more compact */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("approve_request_detail.title")}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t("approve_request_detail.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
            {/* Left Column - Made more compact */}
            <div className="grid grid-rows-[auto_1fr] gap-4">
              {/* Claimer Card - Reduced vertical padding */}
              <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                  <div className="shadow-md">
                    <img src="/bg-claim.png" alt="bg-claim" />
                  </div>
                  <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
                    {claim.claimer.avatarUrl ? (
                      <img
                        src={claim.claimer.avatarUrl}
                        alt={claim.claimer.name}
                        className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-fill"
                      />
                    ) : (
                      <img
                        src="/default-avatar.jpeg"
                        alt={claim.claimer.name}
                        className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-fill"
                      />
                    )}
                  </div>
                </div>
                <div className="pt-12 pb-4 px-4">
                  <div className="text-center pt-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                      {claim.claimer.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {claim.claimer.email}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {claim.claimer.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Information Card - More compact spacing */}
              <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  {t("approve_request_detail.project_details.title")}
                </h3>
                <div className="space-y-3">
                  {/* Project details content remains the same but with reduced padding */}
                  <div className="bg-gray-100 dark:bg-[#272B34] rounded-xl p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(
                            "approve_request_detail.project_details.project_name",
                          )}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {claim.project?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t("approve_request_detail.project_details.duration")}
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-200">
                          {formatDate(claim.project?.startDate)} -{" "}
                          {formatDate(claim.project?.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={
                            claim.project?.projectManager?.avatarUrl?.trim()
                              ? claim.project.projectManager.avatarUrl
                              : "/default-avatar.jpeg"
                          }
                          alt={t(
                            "approve_request_detail.project_details.project_manager",
                          )}
                          className="w-12 h-12 rounded-full border-2 border-white shadow"
                        />
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t(
                              "approve_request_detail.project_details.project_manager",
                            )}
                          </label>
                          <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                            {claim.project?.projectManager?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={
                            claim.project?.businessUnitLeader?.avatarUrl?.trim()
                              ? claim.project.businessUnitLeader.avatarUrl
                              : "/default-avatar.jpeg"
                          }
                          alt={t(
                            "approve_request_detail.project_details.business_unit_leader",
                          )}
                          className="w-12 h-12 rounded-full border-2 border-white shadow"
                        />
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t(
                              "approve_request_detail.project_details.business_unit_leader",
                            )}
                          </label>
                          <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                            {claim.project?.businessUnitLeader?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Reorganized for better visibility */}
            <div className="grid grid-rows-[auto_auto_1fr_auto] gap-4">
              {/* Claim Status Card */}
              <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {t("approve_request_detail.claim_info.approval_progress")}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[claim.status]}`}
                  >
                    {claim.status}
                  </span>
                </div>
                <ApprovalProgressBar claim={claim} />
              </div>

              {/* Claim Information Card */}
              <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                  {t("approve_request_detail.claim_info.title")}
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-100 dark:bg-[#272B34] rounded-xl p-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("approve_request_detail.claim_info.claim_name")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {claim.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 dark:bg-[#272B34] rounded-xl p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("approve_request_detail.claim_info.claim_type")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {claim.claimType}
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-[#272B34] rounded-xl p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("approve_request_detail.claim_info.created_at")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {date.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-[#272B34] rounded-xl p-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(
                          "approve_request_detail.claim_info.total_compensation",
                        )}
                      </p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {claim.amount} VND
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(
                          "approve_request_detail.claim_info.total_working_hours",
                        )}
                      </p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {claim.totalWorkingHours} hours
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-[#272B34] rounded-xl p-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t("approve_request_detail.claim_info.remark")}
                    </p>
                    <p className="text-gray-900 dark:text-gray-200">
                      {claim.remark}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change History Card - Fixed height */}
              <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {t("approve_request_detail.change_history")}
                </h3>
                <div className="h-[200px] overflow-y-auto pr-2">
                  <ClaimChangeLog claim={claim} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6">
                {claim.status === "Pending" &&
                  claim.claimApprovers.find(
                    (approver) => approver.approver.id === user?.id,
                  )?.approverStatus === "Pending" && (
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={handleApprove}
                        className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
                      >
                        {t("approve_request_detail.actions.approve")}
                      </button>
                      <button
                        onClick={handleReturn}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors"
                      >
                        {t("approve_request_detail.actions.return")}
                      </button>
                      <button
                        onClick={handleReject}
                        className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                      >
                        {t("approve_request_detail.actions.reject")}
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
