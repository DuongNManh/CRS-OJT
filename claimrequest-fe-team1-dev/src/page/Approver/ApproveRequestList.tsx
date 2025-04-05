// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import ClaimTable from "@/components/ClaimTable/ClaimTable";
import DatePicker from "@/components/DatePicker/DatePicker";
import { ClaimStatusCountResponse } from "@/interfaces/claim.interface";
import { cn } from "@/lib/utils";
import { CACHE_TAGS, cacheService } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { formatDateToYYYYMMDD } from "@/utils/dateFormatter";
import { statusColors } from "@/utils/statusColors";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  AppstoreOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import ClaimCard from "@/components/ClaimCard/ClaimCard";

const ApproveRequestList: React.FC = () => {
  const [statusCounts, setStatusCounts] = useState<ClaimStatusCountResponse>();
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Add temporary states for filters
  const [tempClaimStatus, setTempClaimStatus] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const st = startDate ? formatDateToYYYYMMDD(startDate) : "";
  const en = endDate ? formatDateToYYYYMMDD(endDate) : "";

  const { t } = useTranslation();

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
        "ApproverMode",
        "",
        startDate,
        endDate,
      );

      const cachedCounts = cacheService.get<ClaimStatusCountResponse>(cacheKey);

      if (cachedCounts) {
        setStatusCounts(cachedCounts);
      } else {
        const response = await claimService.getClaimStatusCount(
          "ApproverMode",
          startDate,
          endDate,
        );
        if (response) {
          setStatusCounts(response.data);
          // Cache with appropriate tags
          cacheService.set(cacheKey, response.data, [
            CACHE_TAGS.CLAIMS,
            CACHE_TAGS.CLAIM_LISTS,
            CACHE_TAGS.APPROVER_MODE,
          ]);
        }
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
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

  return (
    <div className="p-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("claim_list.approval_list")}
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

      {/* Status Cards Row */}
      <Row gutter={24} className="mb-6 flex justify-between">
        <Col xs={24} sm={12} md={6}>
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
                  {statusCounts?.total}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            onClick={() => handleStatusFilter("Pending")}
            className={getCardClassName("Pending")}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  "w-[65px] h-[65px] rounded-full flex items-center justify-center",
                  statusColors.Pending,
                  tempClaimStatus === "Pending" &&
                    "ring-2 ring-[#3185ca] dark:ring-4  dark:ring-[#3185ca]",
                )}
              >
                <ClockCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Pending
                </span>
                <span className="text-[30px] font-bold text-[#666] dark:text-gray-300">
                  {statusCounts?.pending}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
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
                  Approved
                </span>
                <span className="text-[30px] font-bold text-[#666] dark:text-gray-300">
                  {statusCounts?.approved}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            onClick={() => handleStatusFilter("Rejected")}
            className={getCardClassName("Rejected")}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  "w-[65px] h-[65px] rounded-full flex items-center justify-center",
                  statusColors.Rejected,
                  tempClaimStatus === "Rejected" &&
                    "ring-2 ring-[#3185ca] dark:ring-4  dark:ring-[#3185ca]",
                )}
              >
                <CloseCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Rejected
                </span>
                <span className="text-[30px] font-bold text-[#666] dark:text-gray-300">
                  {statusCounts?.rejected}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
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
          className="w-full sm:w-auto"
        >
          {t("common.apply_filters")}
        </Button>
        <Button
          onClick={handleClearFilters}
          type="default"
          className="w-full sm:w-auto dark:bg-[#272B34] dark:text-gray-300"
          disabled={!tempStartDate && !tempEndDate && !claimStatus}
        >
          {t("common.reset_filters")}
        </Button>
      </div>

      {/* Conditional Rendering of Table/Card View */}
      {viewMode === "table" ? (
        <ClaimTable
          mode="ApproverMode"
          claimStatus={claimStatus}
          startDate={st}
          endDate={en}
          onStatusChange={handleStatusFilter}
        />
      ) : (
        <ClaimCard
          mode="ApproverMode"
          claimStatus={claimStatus}
          startDate={st}
          endDate={en}
          onStatusChange={handleStatusFilter}
        />
      )}
    </div>
  );
};

export default ApproveRequestList;
