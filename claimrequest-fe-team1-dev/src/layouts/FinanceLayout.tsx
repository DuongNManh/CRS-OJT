import React, { memo } from "react";

interface Props {
  children?: React.ReactNode;
}

const FinanceLayoutInner: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#121212]">
      <div className="flex flex-row">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

const FinanceLayout = memo(FinanceLayoutInner);

export default FinanceLayout;
