import React from "react";

const FinanceLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#121212]">
      <div className="flex flex-row">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default FinanceLayout;
