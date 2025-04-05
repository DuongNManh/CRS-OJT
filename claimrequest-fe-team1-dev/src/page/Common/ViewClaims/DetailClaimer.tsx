// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import ApprovalProgressBar from "@/components/ApprovalProgressBar/ApprovalProgressBar";
import ClaimChangeLog from "@/components/ClaimChangeLog/ClaimChangeLog";
import ClaimDetailLoading from "@/components/Loading/ClaimDetailLoading";
import NotFound from "@/components/NotFound/NotFound";
import { useApi } from "@/hooks/useApi";
import { ClaimDetailResponse } from "@/interfaces/claim.interface";
import { cacheService } from "@/services/features/cacheService";
import { CACHE_TAGS } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { formatDate } from "@/utils/dateFormatter";
import { statusColors } from "@/utils/statusColors";
import { Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const DetailClaimer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cancelRemark, setCancelRemark] = useState<string>("");
  const date = new Date(claim?.createAt || "");
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
      if (response.is_success && response.data) {
        setClaim(response.data);
        // Store in cache for future use
        cacheService.set(cacheKey, response.data, [
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIMER_MODE,
          `claim_${id}`,
        ]);
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || t("detail_claimer.toast.error_general");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetail(); // Call the new fetch function
  }, [id]);

  if (loading) {
    return <ClaimDetailLoading />;
  }

  if (!claim) {
    return <NotFound />;
  }

  const handleBack = () => {
    navigate("/claims");
  };

  const handleCancel = async () => {
    setIsModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      if (!cancelRemark.trim()) {
        toast.error(t("detail_claimer.toast.error_cancel_reason_required"));
        return;
      }

      const response = await withLoading(
        claimService.cancelClaim(id as string, cancelRemark),
      );

      if (response.is_success && response.data) {
        toast.success(t("detail_claimer.toast.cancel_success"));
        setIsModalOpen(false);
        setCancelRemark(""); // Reset the remark input
        // Invalidate cache
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          `claim_${id}`,
        ]);
        fetchClaimDetail(); // Fetch updated claim details after cancellation
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || t("detail_claimer.toast.error_general");
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async () => {
    try {
      const confirm = window.confirm(t("detail_claimer.toast.confirm_submit"));
      if (!confirm) return;
      const response = await withLoading(
        claimService.submitClaim(id as string),
      );
      if (response.is_success) {
        toast.success(t("detail_claimer.toast.submit_success"));
        // Invalidate caches after submission
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
        ]);
        fetchClaimDetail(); // Fetch updated claim details after submission
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("detail_claimer.toast.submit_error");
      toast.error(errorMessage);
    }
  };

  const handleEdit = () => {
    if (claim?.id) {
      navigate(`/claim-update/${claim.id}`, {
        state: { claim },
      });
    } else {
      toast.error(t("detail_claimer.toast.edit_error"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0E1217] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("detail_claimer.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("detail_claimer.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-8">
          {/* Left Column - Claim Info */}
          <div className="space-y-6">
            {/* Claim Information Card */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  {t("detail_claimer.claim_information")}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("detail_claimer.claim_name")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {claim.name}
                      </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t("detail_claimer.claim_type")}
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-200">
                        {claim.claimType}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("detail_claimer.created_at")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {date.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("detail_claimer.total_hours")}
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-200">
                      {claim.totalWorkingHours}h
                    </p>
                  </div>

                  <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("detail_claimer.total_compensation")}
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {claim.amount} VND
                    </p>
                  </div>

                  <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {t("detail_claimer.remark")}
                    </p>
                    <p className="text-gray-900 dark:text-gray-200">
                      {claim.remark}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Progress Card */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t("detail_claimer.current_status")}
                </h3>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    statusColors[claim.status]
                  }`}
                >
                  {claim.status}
                </span>
              </div>
              <div className="mt-4">
                <h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t("detail_claimer.approval_progress")}
                </h4>
                <ApprovalProgressBar claim={claim} />
              </div>
            </div>
          </div>

          {/* Right Column - Project Info & History */}
          <div className="space-y-6">
            {/* Project Information Card */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6 xl:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {t("detail_claimer.project_details")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("detail_claimer.project_name")}
                    </label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {claim.project?.name || "N/A"}
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-[#272B34] rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("detail_claimer.project_duration")}
                    </label>
                    <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                      {claim.project
                        ? `${formatDate(claim.project.startDate)} - ${formatDate(claim.project.endDate)}`
                        : "N/A"}
                    </p>
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
                        alt={t("detail_claimer.business_unit_leader")}
                        className="w-12 h-12 rounded-full border-2 border-white shadow"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("detail_claimer.project_manager")}
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
                        alt={t("detail_claimer.business_unit_leader")}
                        className="w-12 h-12 rounded-full border-2 border-white shadow"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("detail_claimer.business_unit_leader")}
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

            {/* Change History Card */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {t("detail_claimer.change_history")}
              </h3>
              <div className="h-[250px] overflow-y-auto pr-2">
                <ClaimChangeLog claim={claim} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-end gap-4">
                <button
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  onClick={handleBack}
                >
                  {t("detail_claimer.back")}
                </button>
                {claim.status === "Draft" && (
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    onClick={handleSubmit}
                  >
                    {t("detail_claimer.submit")}
                  </button>
                )}
                {claim.status === "Draft" && (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleEdit}
                  >
                    {t("detail_claimer.update")}
                  </button>
                )}
                {claim.status === "Draft" && (
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    onClick={handleCancel}
                  >
                    {t("detail_claimer.cancel")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={t("detail_claimer.cancel_claim")}
        open={isModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => {
          setIsModalOpen(false);
          setCancelRemark("");
        }}
        okText={t("detail_claimer.cancel_claim_button")}
        cancelText={t("detail_claimer.close_button")}
      >
        <p>{t("detail_claimer.cancel_reason_prompt")}</p>
        <TextArea
          value={cancelRemark}
          onChange={(e) => setCancelRemark(e.target.value)}
          placeholder={t("detail_claimer.cancel_reason_placeholder")}
          rows={4}
          className="mt-2"
        />
      </Modal>
    </div>
  );
};

export default DetailClaimer;
