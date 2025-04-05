// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import DatePicker from "@/components/DatePicker/DatePicker";
import ClaimTable from "@/components/ClaimTable/ClaimTable";
import ClaimCard from "@/components/ClaimCard/ClaimCard";
import { ClaimStatusCountResponse } from "@/interfaces/claim.interface";
import { cacheService } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { formatDateToYYYYMMDD } from "@/utils/dateFormatter";
import { statusColors } from "@/utils/statusColors";
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PaperClipOutlined,
  FileExcelOutlined,
  MoneyCollectOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Button } from "antd";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ClaimList: React.FC = () => {
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [statusCounts, setStatusCounts] = useState<ClaimStatusCountResponse>();
  const [searchText, setSearchText] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tempClaimStatus, setTempClaimStatus] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const { t } = useTranslation();
  const st = startDate ? formatDateToYYYYMMDD(startDate) : "";
  const en = endDate ? formatDateToYYYYMMDD(endDate) : "";

  const handleStatusFilter = (status: string | null) => {
    setTempClaimStatus(status || "");
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setTempStartDate(start);
    setTempEndDate(end);
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

  const handleClearFilters = () => {
    setTempClaimStatus("");
    setTempStartDate(null);
    setTempEndDate(null);
    setClaimStatus("");
    setStartDate(null);
    setEndDate(null);
    fetchStatusCounts("", "");
  };

  const fetchStatusCounts = async (startDate: string, endDate: string) => {
    try {
      const cacheKey = `status_counts_admin_mode_${startDate}_${endDate}`;
      const cachedCounts = cacheService.get<ClaimStatusCountResponse>(cacheKey);

      if (cachedCounts) {
        setStatusCounts(cachedCounts);
      } else {
        const response = await claimService.getClaimStatusCount(
          "AdminMode",
          startDate,
          endDate,
        );
        if (response) {
          setStatusCounts(response.data);
          cacheService.set(cacheKey, response.data, [
            "claims",
            "status-counts",
            "admin-mode",
          ]);
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message ||
        t("approve_request_detail.toast.error_general");
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchStatusCounts("", "");
  }, []);

  const getCardClassName = (status: string | null) => {
    const isSelected = tempClaimStatus === (status || "");
    return cn(
      "bg-white dark:bg-[#272B34] rounded-xl shadow cursor-pointer transition-all duration-200",
      isSelected ? "ring-2 ring-[#3185ca] ring-offset-2" : "hover:shadow-lg",
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-[#1C1F26]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="m-0 text-2xl font-semibold text-gray-900 dark:text-white">
          {t("claim_list.title")}
        </h1>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder={t("claim_list.search_placeholder")}
            className="w-full sm:w-[200px] dark:bg-[#272B34] dark:text-gray-300"
            value={searchText}
            disabled={true}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button
            icon={
              viewMode === "table" ? <AppstoreOutlined /> : <TableOutlined />
            }
            onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
            className="dark:bg-[#272B34] dark:text-gray-300"
          >
            {viewMode === "table"
              ? t("claim_list.card_view")
              : t("claim_list.table_view")}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <Row gutter={28} className="mb-6 flex justify-between">
        <Col xs={28} sm={14} md={3}>
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
                  Total
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.total}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card
            onClick={() => handleStatusFilter("Draft")}
            className={getCardClassName("Draft")}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  `w-[65px] h-[65px] rounded-full flex items-center justify-center`,
                  statusColors.Draft,
                  tempClaimStatus === "Draft" &&
                    "ring-2 ring-[#3185ca] dark:ring-4 dark:ring-[#3185ca]",
                )}
              >
                <PaperClipOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Draft
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.draft}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
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
                    "ring-2 ring-[#3185ca] dark:ring-4 dark:ring-[#3185ca]",
                )}
              >
                <ClockCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Pending
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.pending}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
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
                    "ring-2 ring-[#3185ca] dark:ring-4 dark:ring-[#3185ca]",
                )}
              >
                <CheckCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Approved
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.approved}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
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
                    "ring-2 ring-[#3185ca] dark:ring-4 dark:ring-[#3185ca]",
                )}
              >
                <CloseCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Rejected
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.rejected}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
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
                    "ring-2 ring-[#3185ca] dark:ring-4 dark:ring-[#3185ca]",
                )}
              >
                <MoneyCollectOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Paid
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.paid}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={3}>
          <Card
            onClick={() => handleStatusFilter("Cancelled")}
            className={getCardClassName("Cancelled")}
            bordered={false}
          >
            <div className="flex items-center gap-4 p-1">
              <div
                className={cn(
                  "w-[65px] h-[65px] rounded-full flex items-center justify-center",
                  statusColors.Cancelled,
                  tempClaimStatus === "Cancelled" &&
                    "ring-2 ring-[#3185ca] dark:ring-4 dark:ring-[#3185ca]",
                )}
              >
                <FileExcelOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] dark:text-gray-300 text-xs">
                  Cancelled
                </span>
                <span className="text-[30px] font-bold text-gray-900 dark:text-gray-300">
                  {statusCounts?.cancelled}
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

      {/* Claims View */}
      {viewMode === "table" ? (
        <ClaimTable
          mode="AdminMode"
          claimStatus={claimStatus}
          startDate={st}
          endDate={en}
          onStatusChange={handleStatusFilter}
          searchText={searchText}
        />
      ) : (
        <ClaimCard
          mode="AdminMode"
          claimStatus={claimStatus}
          startDate={st}
          endDate={en}
          onStatusChange={handleStatusFilter}
          searchText={searchText}
        />
      )}
    </div>
  );
};

export default ClaimList;
