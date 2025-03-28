// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import ApprovalProgressBar from "@/components/ApprovalProgressBar/ApprovalProgressBar";
import ClaimChangeLog from "@/components/ClaimChangeLog/ClaimChangeLog";
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

const DetailClaimer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [cancelRemark, setCancelRemark] = useState<string>("");
  const date = new Date(claim?.createAt || "");
  const { withLoading } = useApi();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      if (!id) return;

      // Check cache first
      const cacheKey = cacheService.generateClaimDetailCacheKey(id);
      const cachedData = cacheService.get<ClaimDetailResponse>(cacheKey);

      if (cachedData) {
        console.log("Using cached claim data for:", cacheKey);
        if (isMounted) {
          setClaim(cachedData);
          setLoading(false);
        }
        return;
      }

      console.log("Fetching claim detail:", id);
      try {
        const response = await withLoading(
          claimService.getClaimById(id as string)
        );
        console.log("API detail:", response);

        if (isMounted && response.is_success && response.data) {
          setClaim(response.data);
          cacheService.set(cacheKey, response.data, [
            CACHE_TAGS.CLAIMS,
            CACHE_TAGS.CLAIMER_MODE,
            `claim_${id}`,
          ]);
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage = (error as Error).message || "An error occurred";
          toast.error(errorMessage);
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading claim details...</div>
      </div>
    );
  }

  if (!claim) {
    return <NotFound />;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleCancel = async () => {
    setIsModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    try {
      if (!cancelRemark.trim()) {
        toast.error("Please enter a reason for cancellation");
        return;
      }

      await claimService.cancelClaim(id as string, cancelRemark);
      toast.success("Claim cancelled successfully!");

      // Clear modal state
      setIsModalOpen(false);
      setCancelRemark("");

      // Fetch updated claim data
      const updatedResponse = await claimService.getClaimById(id as string);
      if (updatedResponse.is_success && updatedResponse.data) {
        setClaim(updatedResponse.data);
      }

      // Invalidate cache
      cacheService.invalidateByTags([
        CACHE_TAGS.CLAIMS,
        CACHE_TAGS.CLAIM_LISTS,
        `claim_${id}`,
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel claim";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = async () => {
    try {
      // check user confirmation
      const confirm = window.confirm(
        "Are you sure you want to submit this claim?"
      );
      if (!confirm) return;
      const response = await claimService.submitClaim(id as string);
      if (response.is_success) {
        toast.success("Claim submitted successfully!");
        // Invalidate caches after submission
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
        ]);
        // Instead of reloading, fetch new data
        const updatedResponse = await claimService.getClaimById(id as string);
        if (updatedResponse.is_success && updatedResponse.data) {
          setClaim(updatedResponse.data);
        }
      }
    } catch (error) {
      console.error("Submit claim error:", error);
      toast.error("Failed to submit claim. Please try again.");
    }
  };

  const handleEdit = () => {
    if (claim?.id) {
      navigate(`/claim-update/${claim.id}`, {
        state: { claim }, // Optionally pass the claim data through navigation state
      });
    } else {
      toast.error("Cannot edit: Claim ID not found");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Claim Details</h1>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your claim request information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* Left Column - Claim Info */}
          <div className="space-y-6">
            {/* Claim Information Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Claim Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Claim Name</p>
                      <p className="font-medium text-gray-900">{claim.name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Claim Type</p>
                      <p className="font-medium text-gray-900">
                        {claim.claimType}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="font-medium text-gray-900">
                      {date.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Compensation</p>
                    <p className="text-2xl font-bold text-green-600">
                      {claim.amount} VND
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Remark</p>
                    <p className="text-gray-900">{claim.remark}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Progress Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Current Status
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
                <h4 className="text-base font-medium text-gray-700 mb-4">
                  Approval Progress
                </h4>
                <ApprovalProgressBar claim={claim} />
              </div>
            </div>
          </div>

          {/* Right Column - Project Info & History */}
          <div className="space-y-6">
            {/* Project Information Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Project Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Project Name</p>
                    <p className="font-medium text-gray-900">
                      {claim.project ? claim.project.name : "NA"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium text-gray-900">
                      {claim.project
                        ? `${formatDate(
                            claim.project.startDate
                          )} to ${formatDate(claim.project.endDate)}`
                        : "NA"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Project Manager</p>
                    <p className="font-medium text-gray-900">
                      {claim.project ? claim.project.projectManager : "NA"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      Business Unit Leader
                    </p>
                    <p className="font-medium text-gray-900">
                      {claim.project ? claim.project.businessUnitLeader : "NA"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Change History Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change History
              </h3>
              <div className="h-[250px] overflow-y-auto pr-2">
                <ClaimChangeLog claim={claim} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-end gap-4">
                <button
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  onClick={handleBack}
                >
                  Back
                </button>
                {claim.status === "Draft" && (
                  <button
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                )}
                {claim.status === "Draft" && (
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleEdit}
                  >
                    Update
                  </button>
                )}
                {claim.status === "Draft" && (
                  <button
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Cancel Claim"
        open={isModalOpen}
        onOk={handleCancelConfirm}
        onCancel={() => {
          setIsModalOpen(false);
          setCancelRemark("");
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

export default DetailClaimer;
