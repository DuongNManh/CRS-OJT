// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button } from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  MoneyCollectOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { ClaimStatusCountResponse } from "@/interfaces/claim.interface";
import { toast } from "react-toastify";
import { claimService } from "@/services/features/claim.service";
import { statusColors } from "@/utils/statusColors";
import { formatDateToYYYYMMDD } from "@/utils/dateFormatter";
import DatePicker from "@/components/DatePicker/DatePicker";
import { cn } from "@/lib/utils";
import { cacheService } from "@/services/features/cacheService";
import ClaimTable from "@/components/ClaimTable/ClaimTable";
import ClaimCard from "@/components/ClaimCard/ClaimCard";
import { CACHE_TAGS } from "@/services/features/cacheService";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";

const FinanceRequestList: React.FC = () => {
  const [statusCounts, setStatusCounts] = useState<ClaimStatusCountResponse>();
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Temporary states for filters
  const [tempClaimStatus, setTempClaimStatus] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  // Add state for selected rows
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const { t } = useTranslation();

  // Add viewMode state
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const handleStatusFilter = (status: string | null) => {
    setTempClaimStatus(status || "");
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setTempStartDate(start);
    setTempEndDate(end);
  };

  const fetchStatusCounts = async (startDate: string, endDate: string) => {
    try {
      const cacheKey = cacheService.generateClaimListCacheKey(
        "FinanceMode",
        "",
        startDate,
        endDate,
      );

      const cachedCounts = cacheService.get<ClaimStatusCountResponse>(cacheKey);

      if (cachedCounts) {
        setStatusCounts(cachedCounts);
      } else {
        const response = await claimService.getClaimStatusCount(
          "FinanceMode",
          startDate,
          endDate,
        );
        if (response) {
          setStatusCounts(response.data);
          cacheService.set(cacheKey, response.data, [
            CACHE_TAGS.CLAIMS,
            CACHE_TAGS.CLAIM_LISTS,
            CACHE_TAGS.FINANCE_MODE,
          ]);
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("claim_list.finance_toast.general_error");
      toast.error(errorMessage);
    }
  };

  const handleApplyFilters = () => {
    setClaimStatus(tempClaimStatus);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    fetchStatusCounts(
      tempStartDate ? formatDateToYYYYMMDD(tempStartDate) : "",
      tempEndDate ? formatDateToYYYYMMDD(tempEndDate) : "",
    );
  };

  // Initial fetch of status counts
  useEffect(() => {
    fetchStatusCounts("", "");
  }, []);

  // Update export handler to match the backend model
  const handleExport = async () => {
    if (selectedClaims.length === 0) {
      toast.warning(t("claim_list.finance_toast.select_claims"));
      return;
    }

    try {
      const blob = await claimService.getClaimExportByList({
        selectedClaimIds: selectedClaims,
      });

      saveAs(blob, "claims-export.xlsx");
      toast.success(t("claim_list.finance_toast.export_success"));
    } catch (error) {
      toast.error(
        (error as Error).message || t("claim_list.finance_toast.export_error"),
      );
    }
  };

  // Add this before the return statement
  const handleSelectionChange = (selectedRowKeys: string[]) => {
    setSelectedClaims(selectedRowKeys);
  };

  // Helper function to get card className based on selection state
  const getCardClassName = (status: string | null) => {
    const isSelected = tempClaimStatus === (status || "");
    return cn(
      "bg-white dark:bg-[#272B34] rounded-xl shadow cursor-pointer transition-all duration-200",
      isSelected ? "ring-2 ring-[#3185ca] ring-offset-2" : "hover:shadow-lg",
    );
  };

  const handleClearFilters = () => {
    setTempClaimStatus("");
    setTempStartDate(null);
    setTempEndDate(null);
    setClaimStatus("");
    setStartDate(null);
    setEndDate(null);
    fetchStatusCounts("", "");
  };

  const handleExportByRange = async () => {
    if (!startDate || !endDate) {
      toast.warning(t("claim_list.finance_toast.select_date_range"));
      return;
    }
    const start = formatDateToYYYYMMDD(startDate);
    const end = formatDateToYYYYMMDD(endDate);

    try {
      const blob = await claimService.getClaimExportByRange(start, end);

      // Create a safe filename by removing special characters
      saveAs(blob, "claims-export.xlsx");
      toast.success(t("claim_list.finance_toast.export_success"));
    } catch (error) {
      toast.error(
        (error as Error).message || t("claim_list.finance_toast.export_error"),
      );
    }
  };

  return (
    <div className="p-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          {t("claim_list.paid_list")}
        </h1>
        <Button
          icon={viewMode === "table" ? <AppstoreOutlined /> : <TableOutlined />}
          onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
          className="dark:bg-[#272B34] dark:text-gray-300"
        >
          {viewMode === "table"
            ? t("claim_list.card_view")
            : t("claim_list.table_view")}
        </Button>
      </div>

      {/* Status Cards */}
      <Row gutter={24} className="mb-6 flex justify-between">
        <Col xs={24} sm={12} md={8}>
          <Card
            onClick={() => handleStatusFilter(null)}
            className={getCardClassName(null)}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  "w-[65px] h-[65px] rounded-full flex items-center justify-center",
                  "bg-[#cee6fa] text-[#3185ca]",
                  tempClaimStatus === "" &&
                    "ring-2 ring-[#3185ca] dark:ring-4  dark:ring-[#3185ca]",
                )}
              >
                <UserOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Total Claim Request
                </span>
                <span className="text-[30px] font-bold text-[#666] dark:text-gray-300">
                  {statusCounts?.total || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            onClick={() => handleStatusFilter("Approved")}
            className={getCardClassName("Approved")}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  "w-[65px] h-[65px] rounded-full flex items-center justify-center",
                  statusColors.Approved,
                  tempClaimStatus === "Approved" &&
                    "ring-2 ring-[#3185ca] dark:ring-4  dark:ring-[#3185ca]",
                )}
              >
                <CheckCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Approved Claims
                </span>
                <span className="text-[30px] font-bold text-[#666] dark:text-gray-300">
                  {statusCounts?.approved || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            onClick={() => handleStatusFilter("Paid")}
            className={getCardClassName("Paid")}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  "w-[65px] h-[65px] rounded-full flex items-center justify-center",
                  statusColors.Paid,
                  tempClaimStatus === "Paid" &&
                    "ring-2 ring-[#3185ca] dark:ring-4  dark:ring-[#3185ca]",
                )}
              >
                <MoneyCollectOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Paid Claims
                </span>
                <span className="text-[30px] font-bold text-[#666] dark:text-gray-300">
                  {statusCounts?.paid || 0}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters and Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-grow">
          <DatePicker
            startDate={tempStartDate}
            endDate={tempEndDate}
            onDateChange={handleDateChange}
          />
        </div>
        <Button
          onClick={handleApplyFilters}
          type="primary"
          className="min-w-[100px]"
        >
          {t("common.apply_filters")}
        </Button>
        <Button
          onClick={handleClearFilters}
          type="default"
          className="min-w-[100px] dark:bg-[#272B34] dark:text-gray-300"
        >
          {t("common.reset_filters")}
        </Button>
        <Button
          onClick={handleExport}
          type="primary"
          className="min-w-[100px] bg-[#3185ca]"
          disabled={selectedClaims.length === 0}
        >
          {t("common.export_selected")}
        </Button>
        <Button
          onClick={handleExportByRange}
          type="primary"
          className="min-w-[100px] bg-[#28a772]"
        >
          {t("common.export_range")}
        </Button>
      </div>

      {/* Conditional Render Table/Card View */}
      {viewMode === "table" ? (
        <ClaimTable
          mode="FinanceMode"
          claimStatus={claimStatus}
          startDate={startDate ? formatDateToYYYYMMDD(startDate) : ""}
          endDate={endDate ? formatDateToYYYYMMDD(endDate) : ""}
          onStatusChange={handleStatusFilter}
          selectedRows={selectedClaims}
          onSelectionChange={handleSelectionChange}
          searchText=""
        />
      ) : (
        <ClaimCard
          mode="FinanceMode"
          claimStatus={claimStatus}
          startDate={startDate ? formatDateToYYYYMMDD(startDate) : ""}
          endDate={endDate ? formatDateToYYYYMMDD(endDate) : ""}
          onStatusChange={handleStatusFilter}
          searchText=""
        />
      )}
    </div>
  );
};

export default FinanceRequestList;
