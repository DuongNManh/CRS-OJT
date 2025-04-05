import React, { memo } from "react";

interface Props {
  children: React.ReactNode;
}

const ApproverLayoutInner: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#121212]">
      <div className="flex flex-row">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

const ApproverLayout = memo(ApproverLayoutInner);

export default ApproverLayout;
