import React, { memo } from "react";

interface Props {
  children: React.ReactNode;
}

const AdminLayoutInner: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex flex-row">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

const AdminLayout = memo(AdminLayoutInner);

export default AdminLayout;
