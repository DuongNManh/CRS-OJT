import React from "react";
import { ClaimDetailResponse } from "@/interfaces/claim.interface";

// Define the props interface
interface ApprovalProgressBarProps {
  claim: ClaimDetailResponse; // Use the ClaimDetailResponse type for the claim prop
}

const ApprovalProgressBar: React.FC<ApprovalProgressBarProps> = ({ claim }) => {
  const statusColors: Record<string, string> = {
    Approved: "bg-green-500",
    Pending: "bg-yellow-500",
    Rejected: "bg-red-500",
  };

  return (
    <div>
      {/* Check if there are no claim approvers */}
      {claim.claimApprovers.length === 0 && claim.status != "Draft" ? (
        <div className="flex flex-col my-4">
          <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full bg-green-500`}></div>
          </div>
          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Approved</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col my-4">
          <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              {claim.claimApprovers.map((approver, index) => {
                // Calculate the width for each segment
                const widthPercentage = 100 / claim.claimApprovers.length;
                return (
                  <div
                    key={index}
                    className={`h-full ${
                      statusColors[approver.approverStatus]
                    } group relative`}
                    style={{
                      width: `${widthPercentage}%`,
                      borderRight:
                        index < claim.claimApprovers.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.5)"
                          : "none",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="invisible z-10 group-hover:visible bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {approver.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status summary */}
          <div className="mt-4 flex gap-4 text-sm items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>
                Approved:{" "}
                {
                  claim.claimApprovers.filter(
                    (a) => a.approverStatus === "Approved",
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>
                Pending:{" "}
                {
                  claim.claimApprovers.filter(
                    (a) => a.approverStatus === "Pending",
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>
                Rejected:{" "}
                {
                  claim.claimApprovers.filter(
                    (a) => a.approverStatus === "Rejected",
                  ).length
                }
              </span>
            </div>
            <div className="text-gray-600">
              Total: {claim.claimApprovers.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalProgressBar;
