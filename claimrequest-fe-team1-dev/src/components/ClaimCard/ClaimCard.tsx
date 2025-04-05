// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useApi } from "@/hooks/useApi";
import { GetClaimResponse } from "@/interfaces/claim.interface";
import { cacheService } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { statusColors } from "@/utils/statusColors";
import { Pagination, Tag, Tooltip } from "antd";
import { useTheme } from "@/hooks/use-theme";
import {
  BankOutlined,
  CheckSquareOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

interface ClaimCardProps {
  mode: "ApproverMode" | "ClaimerMode" | "FinanceMode" | "AdminMode";
  claimStatus: string;
  startDate: string;
  endDate: string;
  onStatusChange: (status: string | null) => void;
  onCancelClaim?: (claimId: string) => void;
  onSubmitClaim?: (claimId: string) => void;
  refreshKey?: number;
  searchText?: string;
}

const ClaimCard: React.FC<ClaimCardProps> = ({
  mode,
  claimStatus,
  startDate,
  endDate,
  onCancelClaim,
  onSubmitClaim,
  refreshKey,
  searchText,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [claims, setClaims] = useState<GetClaimResponse[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalItems, setTotalItems] = useState<number>(0);
  const { withLoading } = useApi();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheKey = `claims_${mode}_${claimStatus}_${pageNumber}_${pageSize}_${startDate}_${endDate}_${searchText || ""}`;
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
          setClaims(cachedData.claims);
          setTotalItems(cachedData.totalItems);
        } else {
          const claimsResponse = await withLoading(
            claimService.getClaims(
              claimStatus,
              pageNumber,
              pageSize,
              mode,
              startDate,
              endDate,
              searchText,
            ),
          );

          if (claimsResponse) {
            setClaims(claimsResponse.items);
            setTotalItems(claimsResponse.meta.total_items);
            cacheService.set(
              cacheKey,
              {
                claims: claimsResponse.items,
                totalItems: claimsResponse.meta.total_items,
              },
              ["claims", `${mode}-claims`],
            );
          }
        }
      } catch (error) {
        toast.error((error as Error).message || t("claim_card.error_message"));
      }
    };

    fetchData();
  }, [
    pageNumber,
    pageSize,
    claimStatus,
    mode,
    startDate,
    endDate,
    refreshKey,
    searchText,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="relative p-6 rounded-2xl shadow-lg cursor-pointer transition-transform transform hover:scale-105"
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(to bottom right, #1a237e, #1388A8FF)"
                  : "linear-gradient(to bottom right, #76b852, #134E5E  )",
            }}
            onClick={() => {
              let navigationPath = "";
              switch (mode) {
                case "ApproverMode":
                  navigationPath = `/approver/claim-detail/${claim.id}`;
                  break;
                case "FinanceMode":
                  navigationPath = `/finance/claim-detail/${claim.id}`;
                  break;
                case "ClaimerMode":
                  navigationPath = `/claim-detail/${claim.id}`;
                  break;
                default:
                  navigationPath = `/claim-detail/${claim.id}`;
              }
              navigate(navigationPath, { state: claim });
            }}
          >
            {/* Top Row: Icon and Status */}
            <div className="flex justify-between items-center">
              <div>
                <CreditCardOutlined />
              </div>
              <Tag
                className={`border-none px-3 py-1 rounded-xl w-[77px] text-center ${statusColors[claim.status]} font-bold`}
              >
                {claim.status}
              </Tag>
            </div>

            {/* Claim Name */}
            <h3 className="mt-4 text-2xl font-bold text-white">
              {claim.name.length > 25
                ? `${claim.name.substring(0, 25)}...`
                : claim.name}
            </h3>

            {/* Project Name */}
            <div className="mt-2 border-b border-white/30 pb-2">
              <div className="flex items-center">
                <BankOutlined />
                <span className="ml-2 text-white/70 text-sm">
                  {claim.project?.name || t("claim_card.na")}
                </span>
              </div>
            </div>

            {/* Working Hours and Amount */}
            <div className="mt-4 flex justify-between">
              <div>
                <p className="text-xs text-white/70">
                  {t("claim_card.working_hours")}
                </p>
                <p className="text-lg font-bold text-white">
                  {claim.totalWorkingHours}h
                </p>
              </div>
              <div>
                <p className="text-xs text-white/70">
                  {t("claim_card.amount")}
                </p>
                <p className="text-lg font-bold text-white dark:text-green-500 ">
                  {claim.amount.toLocaleString()} VND
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              {/* Dates */}
              <div>
                <p className="text-xs text-white/70">
                  {t("claim_card.created")}
                </p>
                <p className="text-sm font-bold text-white">
                  {new Date(claim.createAt).toLocaleDateString()}
                </p>
              </div>
              {/* Actions */}
              {mode === "ClaimerMode" && claim.status === "Draft" && (
                <div className="mt-4 flex justify-between gap-4">
                  <Tooltip title={t("claim_card.submit_claim")}>
                    <CheckSquareOutlined
                      className="text-blue-500 dark:text-blue-400 text-xl cursor-pointer hover:text-blue-600 transition-colors dark:hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubmitClaim?.(claim.id);
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t("claim_card.edit_claim")}>
                    <EditOutlined
                      className="text-green-500 dark:text-green-600 text-xl cursor-pointer hover:text-green-600 transition-colors dark:hover:text-green-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/claim-update/${claim.id}`, { state: claim });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={t("claim_card.cancel_claim")}>
                    <CloseCircleOutlined
                      className="text-red-500 text-xl cursor-pointer hover:text-red-600 transition-colors dark:text-red-600 dark:hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelClaim?.(claim.id);
                      }}
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        <Pagination
          current={pageNumber}
          pageSize={pageSize}
          total={totalItems}
          onChange={(page, size) => {
            setPageNumber(page);
            setPageSize(size);
          }}
          showSizeChanger
          showTotal={(total, range) =>
            `${range[0]}-${range[1]} ${t("claim_card.of")} ${total} ${t(
              "claim_card.items",
            )}`
          }
          pageSizeOptions={["12", "16", "32", "64"]}
          className="dark:text-white"
        />
      </div>
    </div>
  );
};

export default ClaimCard;
