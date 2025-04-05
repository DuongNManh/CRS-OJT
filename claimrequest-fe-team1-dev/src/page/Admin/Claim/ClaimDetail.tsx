// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { claimService } from "@/services/features/claim.service";
import { toast } from "react-toastify";
import { ClaimDetailResponse } from "@/interfaces/claim.interface";
import { formatDate } from "@/utils/dateFormatter";
import { cacheService } from "@/services/features/cacheService";
import NotFound from "@/components/NotFound/NotFound";
import { statusColors } from "@/utils/statusColors";
import { CACHE_TAGS } from "@/services/features/cacheService";
import { useApi } from "@/hooks/useApi";
import ClaimDetailLoading from "@/components/Loading/ClaimDetailLoading";
import AdminLayout from "@/layouts/AdminLayout";
import ApprovalProgressBar from "@/components/ApprovalProgressBar/ApprovalProgressBar";

const ClaimDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { withLoading } = useApi();

  useEffect(() => {
    setLoading(true);
    const fetchClaimDetail = async () => {
      if (!id) return;

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
            CACHE_TAGS.ADMIN_MODE,
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

    fetchClaimDetail();
  }, [id]);

  if (loading) {
    return <ClaimDetailLoading />;
  }

  if (!claim) {
    return <NotFound />;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0E1217] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Claim Request Details
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  ID: {claim.id}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[claim.status]}`}
                >
                  {claim.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Claimer Information */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Claimer Information
              </h2>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={claim.claimer?.avatarUrl || "/default-avatar.jpeg"}
                    alt={claim.claimer.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${
                      claim.status === "Approved"
                        ? "bg-green-500"
                        : claim.status === "Paid"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                    }`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {claim.claimer.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {claim.claimer.department}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {claim.claimer.email}
                </p>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Project Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Project Name
                    </label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {claim.project?.name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Project Duration
                    </label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {claim.project
                        ? `${formatDate(claim.project.startDate)} - ${formatDate(claim.project.endDate)}`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      {claim.project?.projectManager?.avatarUrl && (
                        <img
                          src={claim.project.projectManager.avatarUrl}
                          alt="Project Manager"
                          className="w-12 h-12 rounded-full border-2 border-white shadow"
                        />
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Project Manager
                        </label>
                        <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                          {claim.project?.projectManager?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      {claim.project?.businessUnitLeader?.avatarUrl && (
                        <img
                          src={claim.project.businessUnitLeader.avatarUrl}
                          alt="Business Unit Leader"
                          className="w-12 h-12 rounded-full border-2 border-white shadow"
                        />
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Business Unit Leader
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

            {/* Claim Information */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Claim Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Claim Type
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {claim.claimType}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Working Hours
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {claim.totalWorkingHours}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </label>
                  <p className="mt-1 text-2xl font-bold text-green-500 dark:text-green-400">
                    ${claim.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-8">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Reason
                </label>
                <div className="mt-2 p-6 bg-gray-50 dark:bg-[#272B34] rounded-lg">
                  <p className="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {claim.remark}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-4">
                  Approvers
                </label>
                <div className="bg-gray-50 dark:bg-[#272B34] rounded-lg p-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    {claim.claimApprovers.map((approver) => (
                      <div
                        key={approver.approverId}
                        className={`inline-flex items-center px-4 py-2 rounded-full ${
                          statusColors[approver.approverStatus] ||
                          "text-gray-800 bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {approver.approver.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <ApprovalProgressBar claim={claim} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClaimDetail;
