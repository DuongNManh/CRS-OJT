// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { SystemRole } from "@/interfaces/auth.interface";
import {
  Building2,
  ClipboardList,
  UserCog,
  FileCheck,
  Receipt,
  WalletCards,
  ChevronLeft,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface AppSidebarProps {
  userRole: SystemRole;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ userRole }) => {
  const location = useLocation();
  const { open } = useSidebar();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Grouping functions based on roles
  const roleGroups = {
    [SystemRole.ADMIN]: [
      {
        name: "Staff Information",
        url: "/admin/staffs",
        icon: UserCog,
      },
      {
        name: "Project Information",
        url: "/admin/projects",
        icon: Building2,
      },
    ],
    [SystemRole.APPROVER]: [
      {
        name: "For My Vetting",
        url: "/approval/vetting",
        icon: ClipboardList,
      },
      {
        name: "Approved or Paid",
        url: "/approval/approved",
        icon: FileCheck,
      },
    ],
    [SystemRole.FINANCE]: [
      {
        name: "Approved Claims",
        url: "/finance/approved",
        icon: Receipt,
      },
      {
        name: "Paid Claims",
        url: "/finance/paid",
        icon: WalletCards,
      },
    ],
  };

  return (
    <Sidebar
      className={`fixed left-0 top-0 h-screen pt-16 transition-all bg-gray-100 border-r border-gray-200 z-10 shadow-xl dark:bg-[#121212] dark:border-gray-800
      ${open ? "w-64" : "w-20"}`}
    >
      <SidebarContent className="px-2">
        <SidebarTrigger className="absolute right-0 top-0 p-2 rounded-full hover:bg-gray-100 dark:text-white dark:hover:bg-[#2D323B] transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </SidebarTrigger>
        {Object.keys(roleGroups).map((role) => {
          if (role === userRole) {
            return (
              <SidebarGroup key={role}>
                <SidebarGroupLabel>
                  {role === SystemRole.ADMIN
                    ? "Admin"
                    : role === SystemRole.APPROVER
                    ? "Approver"
                    : "Finance"}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {roleGroups[role].map((func) => (
                      <SidebarMenuItem key={func.name}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={func.url}
                            className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                              isActive(func.url)
                                ? "bg-gray-700 text-white font-semibold shadow-lg hover:bg-gray-800 dark:bg-[#2D323B] dark:hover:bg-[#2D323B]"
                                : "hover:bg-gray-200 text-gray-800 hover:scale-105 dark:hover:bg-[#2D323B] dark:text-gray-200"
                            }`}
                          >
                            <func.icon
                              className={`w-8 h-8 transition-colors duration-200 ${
                                isActive(func.url)
                                  ? "text-white"
                                  : "text-blue-600"
                              }`}
                            />
                            <span className="font-medium text-lg">
                              {func.name}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
          return null;
        })}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          {open && "© 2025 FPT CRS"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
