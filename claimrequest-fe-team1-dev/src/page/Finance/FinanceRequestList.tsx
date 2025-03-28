// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import ClaimTable from "@/components/ClaimTable/ClaimTable";
import DatePicker from "@/components/DatePicker/DatePicker";
import { ClaimStatusCountResponse } from "@/interfaces/claim.interface";
import { cn } from "@/lib/utils";
import { cacheService } from "@/services/features/cacheService";
import { CACHE_TAGS } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { formatDateToYYYYMMDD } from "@/utils/dateFormatter";
import { statusColors } from "@/utils/statusColors";
import {
  UserOutlined,
  CheckCircleOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import { Card, Row, Col, Input, Button } from "antd";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const FinanceRequestList: React.FC = () => {
  const [statusCounts, setStatusCounts] = useState<ClaimStatusCountResponse>();
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Temporary states for filters
  const [tempClaimStatus, setTempClaimStatus] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  // Add state for selected rows
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  const st = startDate ? formatDateToYYYYMMDD(startDate) : "";
  const en = endDate ? formatDateToYYYYMMDD(endDate) : "";

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
        endDate
      );

      const cachedCounts = cacheService.get<ClaimStatusCountResponse>(cacheKey);

      if (cachedCounts) {
        setStatusCounts(cachedCounts);
      } else {
        const response = await claimService.getClaimStatusCount(
          "FinanceMode",
          startDate,
          endDate
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
      tempEndDate ? formatDateToYYYYMMDD(tempEndDate) : ""
    );
  };

  // Initial fetch of status counts
  useEffect(() => {
    fetchStatusCounts("", "");
  }, []);

  // Update export handler to match the backend model
  const handleExport = async () => {
    if (selectedClaims.length === 0) {
      toast.warning("Please select claims to export");
      return;
    }

    try {
      const blob = await claimService.getClaimExportByList({
        selectedClaimIds: selectedClaims,
      });

      saveAs(blob, "claims-export.xlsx");
      toast.success("Claims exported successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to export claims");
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
      "bg-white rounded-xl shadow cursor-pointer transition-all duration-200",
      isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-lg"
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
      toast.warning("Please select start and end date");
      return;
    }
    const start = formatDateToYYYYMMDD(startDate);
    const end = formatDateToYYYYMMDD(endDate);

    try {
      const blob = await claimService.getClaimExportByRange(start, end);

      // Create a safe filename by removing special characters
      saveAs(blob, "claims-export.xlsx");
      toast.success("Claims exported successfully");
    } catch (error) {
      toast.error((error as Error).message || "Failed to export claims");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          Finance Request List
        </h1>
        <Input
          type="search"
          placeholder="Search"
          className="w-full sm:w-[200px]"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

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
                  tempClaimStatus === "" && "ring-2 ring-[#3185ca]"
                )}
              >
                <UserOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Total Claim Request</span>
                <span className="text-[30px] font-bold text-[#333]">
                  {statusCounts?.total}
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
                  tempClaimStatus === "Approved" && "ring-2 ring-[#3185ca]"
                )}
              >
                <CheckCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Approved Claims</span>
                <span className="text-[30px] font-bold text-[#333]">
                  {statusCounts?.approved}
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
                  tempClaimStatus === "Paid" && "ring-2 ring-[#3185ca]"
                )}
              >
                <MoneyCollectOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Paid Claims</span>
                <span className="text-[30px] font-bold text-[#333]">
                  {statusCounts?.paid}
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

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
          Apply Filters
        </Button>
        <Button
          onClick={handleClearFilters}
          type="default"
          className="w-full sm:w-auto"
          disabled={!tempStartDate && !tempEndDate && !tempClaimStatus}
        >
          Clear Filters
        </Button>
        {/* Add Export button */}
        {selectedClaims.length > 0 && (
          <Button
            onClick={handleExport}
            type="primary"
            className="w-full sm:w-auto"
          >
            Export Selected ({selectedClaims.length})
          </Button>
        )}
        <Button
          onClick={handleExportByRange}
          type="primary"
          className="w-full sm:w-auto"
        >
          Export By Range
        </Button>
      </div>

      <ClaimTable
        mode="FinanceMode"
        claimStatus={claimStatus}
        startDate={st}
        endDate={en}
        onStatusChange={handleStatusFilter}
        selectedRows={selectedClaims}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
};

export default FinanceRequestList;
