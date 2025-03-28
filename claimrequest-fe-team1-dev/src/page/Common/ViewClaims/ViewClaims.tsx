// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import ClaimTable from "@/components/ClaimTable/ClaimTable";
import DatePicker from "@/components/DatePicker/DatePicker";
import { Input } from "@/components/ui/input";
import { ClaimStatusCountResponse } from "@/interfaces/claim.interface";
import { cn } from "@/lib/utils";
// Import ClaimTable
import { cacheService } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { useAppSelector } from "@/services/store/store";
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
} from "@ant-design/icons";
import { Card, Row, Col, Button, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ViewClaims: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [claimStatus, setClaimStatus] = useState<string>("");
  const [statusCounts, setStatusCounts] = useState<ClaimStatusCountResponse>();
  const [searchText, setSearchText] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cancelRemark, setCancelRemark] = useState<string>("");
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");
  // These are temporary states for filters
  const [tempClaimStatus, setTempClaimStatus] = useState<string>("");
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  // Thêm state để trigger refresh
  const [refreshKey, setRefreshKey] = useState<number>(0);

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
    // Fetch status counts immediately when filters are applied
    fetchStatusCounts(
      tempStartDate ? formatDateToYYYYMMDD(tempStartDate) : "",
      tempEndDate ? formatDateToYYYYMMDD(tempEndDate) : ""
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

  // Move fetchStatusCounts outside useEffect so it can be reused
  const fetchStatusCounts = async (startDate: string, endDate: string) => {
    try {
      const cacheKey = `status_counts_claimer_mode_${startDate}_${endDate}`;
      const cachedCounts = cacheService.get<ClaimStatusCountResponse>(cacheKey);

      if (cachedCounts) {
        setStatusCounts(cachedCounts);
      } else {
        const response = await claimService.getClaimStatusCount(
          "ClaimerMode",
          startDate,
          endDate
        );
        if (response) {
          setStatusCounts(response.data);
          cacheService.set(cacheKey, response.data, [
            "claims",
            "status-counts",
            "claimer-mode",
          ]);
        }
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  // Initial fetch of status counts
  useEffect(() => {
    fetchStatusCounts("", "");
  }, []);

  // Helper function to get card className based on selection state
  const getCardClassName = (status: string | null) => {
    const isSelected = tempClaimStatus === (status || "");
    return cn(
      "bg-white rounded-xl shadow cursor-pointer transition-all duration-200",
      isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:shadow-lg"
    );
  };

  // Add these handlers after the handleApplyFilters function
  const handleCancelClaim = async () => {
    try {
      if (!cancelRemark.trim()) {
        toast.error("Please enter a reason for cancellation");
        return;
      }

      await claimService.cancelClaim(selectedClaimId, cancelRemark);
      toast.success("Claim cancelled successfully!");

      // Clear modal state
      setIsModalOpen(false);
      setCancelRemark("");
      setSelectedClaimId("");

      // Refresh status counts and table data
      fetchStatusCounts(
        startDate ? formatDateToYYYYMMDD(startDate) : "",
        endDate ? formatDateToYYYYMMDD(endDate) : ""
      );

      // Trigger table refresh
      setRefreshKey((prev) => prev + 1);

      // Invalidate cache nếu bạn đang sử dụng
      cacheService.invalidateByTags([
        "claims",
        "status-counts",
        "claimer-mode",
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel claim";
      toast.error(errorMessage);
    }
  };

  const showCancelModal = (claimId: string) => {
    setSelectedClaimId(claimId);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="m-0 text-2xl font-semibold">
          Hello, {user?.name || "User"}!
        </h1>
        <Input
          type="search"
          placeholder="Search"
          className="w-full sm:w-[200px]"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
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
                  tempClaimStatus === "" && "ring-2 ring-[#3185ca]"
                )}
              >
                <UserOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Total</span>
                <span className="text-[30px] font-bold text-[#333]">
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
                  tempClaimStatus === "Draft" && "ring-2 ring-[#3185ca]"
                )}
              >
                <PaperClipOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Draft</span>
                <span className="text-[30px] font-bold text-[#333]">
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
                  tempClaimStatus === "Pending" && "ring-2 ring-[#3185ca]"
                )}
              >
                <ClockCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Pending</span>
                <span className="text-[30px] font-bold text-[#333]">
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
                  tempClaimStatus === "Approved" && "ring-2 ring-[#3185ca]"
                )}
              >
                <CheckCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Approved</span>
                <span className="text-[30px] font-bold text-[#333]">
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
                  tempClaimStatus === "Rejected" && "ring-2 ring-[#3185ca]"
                )}
              >
                <CloseCircleOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Rejected</span>
                <span className="text-[30px] font-bold text-[#333]">
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
                  tempClaimStatus === "Paid" && "ring-2 ring-[#3185ca]"
                )}
              >
                <MoneyCollectOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Paid</span>
                <span className="text-[30px] font-bold text-[#333]">
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
                  tempClaimStatus === "Cancelled" && "ring-2 ring-[#3185ca]"
                )}
              >
                <FileExcelOutlined className="text-[35px]" />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#666] text-xs">Cancelled</span>
                <span className="text-[30px] font-bold text-[#333]">
                  {statusCounts?.cancelled}
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
          disabled={!tempStartDate && !tempEndDate && !claimStatus} // Disable button if both dates are not set
        >
          Clear Filters
        </Button>
      </div>

      <ClaimTable
        mode="ClaimerMode"
        claimStatus={claimStatus}
        startDate={st}
        endDate={en}
        onStatusChange={handleStatusFilter}
        onCancelClaim={showCancelModal}
        refreshKey={refreshKey}
      />

      <Modal
        title="Cancel Claim"
        open={isModalOpen}
        onOk={handleCancelClaim}
        onCancel={() => {
          setIsModalOpen(false);
          setCancelRemark("");
          setSelectedClaimId("");
        }}
        okText="Cancel Claim"
        cancelText="Close"
      >
        <p>Please provide a reason for cancelling this claim:</p>
        <TextArea
          value={cancelRemark}
          onChange={(e) => setCancelRemark(e.target.value)}
          placeholder="Enter cancellation reason"
          rows={4}
          className="mt-2"
        />
      </Modal>
    </div>
  );
};

export default ViewClaims;
