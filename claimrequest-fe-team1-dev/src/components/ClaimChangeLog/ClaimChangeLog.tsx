import React from "react";
import { ClaimDetailResponse } from "@/interfaces/claim.interface";

// Define the props interface
interface ClaimChangeLogProps {
  claim: ClaimDetailResponse; // Use the ClaimDetailResponse type for the claim prop
}

const ClaimChangeLog: React.FC<ClaimChangeLogProps> = ({ claim }) => {
  return (
    <div>
      <div className="flex flex-col my-4">
        {claim.changeHistory.length > 0 ? (
          claim.changeHistory.map((change, index) => (
            <div
              key={index}
              className={`flex justify-between ${
                index % 2 === 0 ? "bg-slate-100" : "bg-white"
              } items-center p-2 border-b border-gray-300`}
            >
              <span className="text-gray-700">{change.message}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No change history available.</p>
        )}
      </div>
    </div>
  );
};

export default ClaimChangeLog;
