import React from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-row">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
