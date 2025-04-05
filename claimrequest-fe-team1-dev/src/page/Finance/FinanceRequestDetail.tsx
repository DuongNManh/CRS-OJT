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
import FinanceLayout from "@/layouts/FinanceLayout";
import { CACHE_TAGS } from "@/services/features/cacheService";
import { useApi } from "@/hooks/useApi";
import { saveAs } from "file-saver";
import ClaimDetailLoading from "@/components/Loading/ClaimDetailLoading";
import { useTranslation } from "react-i18next";
import { DEPARTMENT_COLOR } from "@/interfaces/project.interface";
import { Tag } from "antd";
import { addSpaceBeforeCapitalLetters } from "@/utils/stringFormatter";

const FinanceRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const date = new Date(claim?.createAt || "");
  const { withLoading } = useApi();

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
          CACHE_TAGS.FINANCE_MODE,
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
    fetchClaimDetail();
  }, [id]);

  if (loading) {
    return <ClaimDetailLoading />;
  }

  if (!claim) {
    return <NotFound />;
  }

  const handleExport = async () => {
    if (!claim) return;
    try {
      const blob = await claimService.getClaimExportByList({
        selectedClaimIds: [claim.id],
      });

      saveAs(blob, "claims-export.xlsx");
      toast.success(t("finance_request_detail.export_success"));
    } catch (error) {
      toast.error(
        (error as Error).message || t("finance_request_detail.export_fail"),
      );
    }
  };

  const handlePay = async () => {
    try {
      const response = await claimService.payClaim(id as string);
      if (response.success) {
        toast.success(t("finance_request_detail.payment_success"));
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.FINANCE_MODE,
        ]);
        fetchClaimDetail();
      }
    } catch (error) {
      const errorMessage =
        (error as Error).message || t("finance_request_detail.payment_fail");
      toast.error(errorMessage);
    }
  };

  const handleReject = async () => {
    try {
      if (!id) return;

      const confirmReject = window.confirm(
        t("finance_request_detail.confirm_reject"),
      );
      if (!confirmReject) return;

      await claimService.rejectClaim(id);
      toast.success(t("finance_request_detail.reject_success"));
      cacheService.invalidateByTags([
        CACHE_TAGS.CLAIMS,
        CACHE_TAGS.CLAIM_LISTS,
        CACHE_TAGS.APPROVER_MODE,
      ]);
      fetchClaimDetail();
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("finance_request_detail.reject_fail");
      toast.error(errorMessage);
    }
  };

  const statusContent: Record<string, JSX.Element> = {
    Approved: (
      <div className="flex justify-end gap-6 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          onClick={handlePay}
        >
          {t("finance_request_detail.pay")}
        </button>
        <button
          className="px-6 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          onClick={handleReject}
        >
          {t("finance_request_detail.reject")}
        </button>
      </div>
    ),
    Paid: (
      <div className="text-center pt-5 mt-5 border-t border-gray-200 dark:border-gray-700">
        <div className="text-green-600 text-lg font-semibold mb-4">
          {t("finance_request_detail.paid_successfully")}
        </div>
        <div className="text-base mb-5">
          {t("finance_request_detail.total_amount")}:{" "}
          <span className="text-green-500 font-bold text-lg">
            {claim.amount}
          </span>
        </div>
        <div className="flex justify-center gap-3">
          <button
            className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            onClick={handleExport}
          >
            {t("finance_request_detail.download_claim")}
          </button>
        </div>
      </div>
    ),
  };

  return (
    <FinanceLayout>
      <div className="min-h-screen bg-gray-100 dark:bg-[#0E1217] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("finance_request_detail.title")}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {t("finance_request_detail.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    {claim.claimer?.avatarUrl ? (
                      <img
                        src={claim.claimer.avatarUrl}
                        alt={claim.claimer.name}
                        className="w-[200px] h-[200px] rounded-full object-fill border-4 border-white shadow-lg"
                      />
                    ) : (
                      <img
                        src="/default-avatar.jpeg"
                        alt={claim.claimer.name}
                        className="w-[200px] h-[200px] rounded-full object-fill border-4 border-white shadow-lg"
                      />
                    )}
                    <div
                      className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${
                        claim.status === "Approved"
                          ? "bg-green-500"
                          : claim.status === "Paid"
                            ? "bg-blue-500"
                            : "bg-gray-1000"
                      }`}
                    ></div>
                  </div>

                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-1">
                    {claim.claimer.name}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {claim.claimer.email}
                  </p>

                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4  bg-gray-100 dark:bg-[#272B34]  rounded-xl p-4">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("finance_request_detail.status")}
                      </span>
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[claim.status]}`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="flex justify-between  bg-gray-100 dark:bg-[#272B34]  rounded-xl p-4 mb-6">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {t("finance_request_detail.approved_by")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                        {claim.claimApprovers && claim.claimApprovers.length > 0
                          ? claim.claimApprovers
                              .map((approver) => approver.approver.name)
                              .join(", ")
                          : t("claim_card.na")}
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t("finance_request_detail.contact_information")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.email")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {claim.claimer.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.department")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          <Tag
                            color={
                              DEPARTMENT_COLOR[claim.claimer.department].text
                            }
                          >
                            {addSpaceBeforeCapitalLetters(
                              claim.claimer.department,
                            )}
                          </Tag>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t("finance_request_detail.project_information")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.project_name")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {claim.project
                            ? claim.project.name
                            : t("claim_card.na")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.duration")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {claim.project
                            ? `${formatDate(claim.project.startDate)} to ${formatDate(claim.project.endDate)}`
                            : t("claim_card.na")}
                        </span>
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
                                "finance_request_detail.business_unit_leader",
                              )}
                              className="w-12 h-12 rounded-full border-2 border-white shadow"
                            />
                            <div>
                              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {t("finance_request_detail.project_manager")}
                              </label>
                              <p className="mt-1 text-base font-medium text-gray-900 dark:text-white">
                                {claim.project?.projectManager?.name ||
                                  t("claim_card.na")}
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
                                {claim.project?.businessUnitLeader?.name ||
                                  t("claim_card.na")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t("finance_request_detail.claim_details")}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.claim_type")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {claim.claimType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.work_hours")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {claim.totalWorkingHours}h
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t("finance_request_detail.created_at")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                          {date.toLocaleString()}
                        </span>
                      </div>
                      {claim.status === "approved" && (
                        <div className="flex justify-between items-center p-3 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t("finance_request_detail.total_compensation")}
                          </span>
                          <span className="text-lg font-bold text-green-500 dark:text-green-400">
                            {claim.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {t("finance_request_detail.reason")}
                    </h3>
                    <div className="p-4 bg-gray-100 dark:bg-[#272B34] rounded-xl">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {claim.remark}
                      </p>
                    </div>
                  </div>

                  {statusContent[claim.status]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FinanceLayout>
  );
};

export default FinanceRequestDetail;
