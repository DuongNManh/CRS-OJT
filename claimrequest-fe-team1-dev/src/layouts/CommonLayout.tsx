import React, { memo } from "react";

interface Props {
  children?: React.ReactNode;
}

const CommonLayoutInner: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">{children}</main>
    </div>
  );
};

const CommonLayout = memo(CommonLayoutInner);

export default CommonLayout;
