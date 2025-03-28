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


const FinanceRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<ClaimDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const date = new Date(claim?.createAt || "");
  const { withLoading } = useApi();

  useEffect(() => {
    setLoading(true);
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
        const response = await withLoading(claimService.getClaimById(id as string));
        if (response && response.is_success && response.data) {
          setClaim(response.data);
          // Store in cache for future use
          cacheService.set(cacheKey, response.data, [
            CACHE_TAGS.CLAIMS,
            CACHE_TAGS.FINANCE_MODE,
            `claim_${id}`
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading claim details...</div>
      </div>
    );
  }

  if (!claim) {
    return <NotFound />;
  }
  
    const handleExport = async () => {
      if (id === undefined) return;
      try {
        const blob = await claimService.getClaimExportByList({
          selectedClaimIds: [id],
        });
  
        saveAs(blob, "claims-export.xlsx");
        toast.success("Claims exported successfully");
      } catch (error) {
        toast.error((error as Error).message || "Failed to export claims");
      }
    };

  const handlePay = async () => {
    try {
      const response = await claimService.payClaim(id as string);
      if (response.success) {
        toast.success("Payment processed successfully");
        // Invalidate relevant caches
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.FINANCE_MODE
        ]);
        // Instead of reloading, fetch new data
        const updatedResponse = await claimService.getClaimById(id as string);
        if (updatedResponse.is_success && updatedResponse.data) {
          setClaim(updatedResponse.data);
        }
      }
    } catch (error) {
      toast.error("Failed to process payment");
      
    }
  };

  const statusContent: Record<string, JSX.Element> = {
    Approved: (
      <div className="flex justify-end gap-6 mt-5 pt-4 border-t border-gray-200">
        <button 
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          onClick={handlePay}
        >
          Pay
        </button>
      </div>
    ),
    Paid: (
      <div className="text-center pt-5 mt-5 border-t border-gray-200">
        <div className="text-green-600 text-lg font-semibold mb-4">
          This claim has been paid successfully!
        </div>
        <div className="text-base mb-5">
          Total Amount:{" "}
          <span className="text-green-500 font-bold text-lg">{claim.amount}</span>
        </div>
        <div className="flex justify-center gap-3">
          <button 
            className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            onClick={handleDownload}
          >
            Download Claim
          </button>
        </div>
      </div>
    ),
  };

  return (
    <FinanceLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Claim Request Details</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review and manage claim request information
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
            {/* Staff Information Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img
                      src='/src/assets/default-avatar.jpeg'
                      alt={claim.claimer.name}
                      className="w-[200px] h-[200px] rounded-full object-fill border-4 border-white shadow-lg"
                    />
                    <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${
                      claim.status === 'Approved' ? 'bg-green-500' : 
                      claim.status === 'Paid' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-1">
                    {claim.claimer.name}
                  </h1>
                  <p className="text-sm text-gray-500 mb-6">{claim.claimer.email}</p>

                  {/* Status Section with enhanced styling */}
                  <div className="w-full bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusColors[claim.status]}`}>
                        {claim.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Approved By</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {claim.claimApprovers.map((approver) => approver.name).join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Contact Information with enhanced styling */}
                  <div className="w-full">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Email</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.claimer.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Department</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.claimer.department}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project and Claim Details Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-8">
                <div className="space-y-8">
                  {/* Project Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Project Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Project Name</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.project ? claim.project.name : 'NA'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Duration</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.project ? `${formatDate(claim.project.startDate)} to ${formatDate(claim.project.endDate)}` : 'NA'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Project Manager</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.project ? claim.project.projectManager : 'NA'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Business Unit Leader</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.project ? claim.project.businessUnitLeader : 'NA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Claim Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Claim Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Claim Type</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.claimType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Work Hours</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {claim.totalWorkingHours}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">Created at</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {date.toLocaleString()}
                        </span>
                      </div>
                      {claim.status === "approved" && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-500">Total Compensation</span>
                          <span className="text-lg font-bold text-green-500">
                            {claim.amount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reason Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Reason
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {claim.remark}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
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