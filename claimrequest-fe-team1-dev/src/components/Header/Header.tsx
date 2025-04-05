// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useTheme } from "@/hooks/use-theme";
import { SystemRole } from "@/interfaces/auth.interface";
import { authService } from "@/services/features/auth.service";
import { clearUser } from "@/services/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import {
  MenuOutlined,
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { Menu, Dropdown, Button, Avatar } from "antd";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Header.css";
import LanguageSelector from "../common/LanguageSelector";
import { useTranslation } from "react-i18next";

// Import custom CSS

interface HeaderProps {
  sticky?: boolean; // Prop to control sticky behavior
}

const Header: React.FC<HeaderProps> = ({ sticky }) => {
  const headerStyle = sticky
    ? { position: "sticky", top: 0, zIndex: 1000 }
    : {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClaimActionsOpen, setIsClaimActionsOpen] = useState(false);
  const [isRoleActionsOpen, setIsRoleActionsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(clearUser());
      toast.success(t("logout_success"));
      navigate("/login");
    } catch (error) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  const roleGroups = {
    [SystemRole.ADMIN]: [
      {
        name: t("header.staff_information"),
        url: "/admin/staffs",
      },
      {
        name: t("header.project_information"),
        url: "/admin/projects",
      },
      {
        name: t("header.claim_information"),
        url: "/admin/claims",
      },
    ],
    [SystemRole.APPROVER]: [
      {
        name: t("header.pending_approval"),
        url: "/approver/claims",
      },
    ],
    [SystemRole.FINANCE]: [
      {
        name: t("header.pending_payment"),
        url: "/finance/claims",
      },
    ],
  };

  const claimActionsMenu = (
    <Menu>
      <Menu.Item key="1">
        <Link
          to="/create-claim"
          style={{ color: theme === "light" ? "gray" : "white" }}
        >
          {t("header.create_claim")}
        </Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link
          to="/claims"
          style={{ color: theme === "light" ? "gray" : "white" }}
        >
          {t("header.view_claims")}
        </Link>
      </Menu.Item>
    </Menu>
  );

  const roleActionsMenu = (
    <Menu>
      {roleGroups[user?.systemRole]?.map((action) => (
        <Menu.Item key={action.url}>
          <Link
            to={action.url}
            style={{ color: theme === "light" ? "gray" : "white" }}
          >
            {action.name}
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );

  const profileMenu = (
    <Menu>
      <Menu.Item key="1">
        <Link
          to="/profile"
          style={{ color: theme === "light" ? "gray" : "white" }}
        >
          <UserOutlined /> {t("header.my_profile")}
        </Link>
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={handleLogout}
        style={{ color: theme === "light" ? "gray" : "white" }}
      >
        <LogoutOutlined /> {t("header.log_out")}
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      className={`flex flex-col md:flex-row justify-between items-center p-3 ${
        theme === "light"
          ? "bg-gray-200 text-gray-900"
          : "bg-[#121212] text-gray-50"
      } z-50 dark:border-b dark:border-gray-800 ${sticky ? "sticky top-0 z-50" : ""}`}
      style={headerStyle}
    >
      {/* Logo Section with Sidebar Toggle */}
      <div className="flex gap-4 w-full md:w-auto justify-between items-center">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-xl font-bold flex items-center"
            style={{ color: theme === "light" ? "gray" : "white" }}
          >
            <img
              src="/icon.png"
              alt="Claim Request System"
              className="h-12 w-20 mr-1"
            />
            <p className="italic text-xl text-[#1169B0] pt-0">C</p>
            <p className="italic text-xl text-[#F27227] pt-0">R</p>
            <p className="italic text-xl text-[#16B14B] pt-0">S</p>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="text"
          icon={isMenuOpen ? <MenuOutlined /> : <MenuOutlined />}
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ color: theme === "light" ? "gray" : "white" }}
        />
      </div>

      {/* Navigation Menu */}
      <div
        className={`${
          isMenuOpen ? "flex" : "hidden"
        } md:flex w-full md:w-auto flex-col md:flex-row mt-4 md:mt-0 gap-2`}
      >
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <Button
            type="text"
            icon={
              theme === "light" ? (
                <MoonOutlined style={{ fontSize: "24px" }} />
              ) : (
                <SunOutlined
                  className="text-yellow-500"
                  style={{ fontSize: "24px" }}
                />
              )
            }
            onClick={toggleTheme}
            className="mr-2"
            style={{
              color: theme === "light" ? "gray" : "white",
              fontSize: "24px",
            }}
          />
          {/* Language Selector */}
          <LanguageSelector isDarkMode={theme === "dark"} />
          {/* Claim Actions Dropdown */}
          {user?.systemRole !== "Finance" && user?.systemRole !== "Admin" && (
            <Dropdown
              overlay={claimActionsMenu}
              trigger={["click"]}
              overlayClassName={
                theme === "light" ? "dropdown-light" : "dropdown-dark"
              }
              onVisibleChange={(visible) => setIsClaimActionsOpen(visible)}
            >
              <Button
                type="text"
                className="flex items-center gap-2"
                style={{ color: theme === "light" ? "gray" : "white" }}
              >
                {t("header.claim_actions")}{" "}
                <DownOutlined
                  className={`arrow ${isClaimActionsOpen ? "flipped" : ""}`}
                />
              </Button>
            </Dropdown>
          )}

          {/* Role Actions Dropdown */}
          {user?.systemRole != "Staff" && (
            <Dropdown
              overlay={roleActionsMenu}
              trigger={["click"]}
              overlayClassName={
                theme === "light" ? "dropdown-light" : "dropdown-dark"
              }
              onVisibleChange={(visible) => setIsRoleActionsOpen(visible)}
            >
              <Button
                type="text"
                className="flex items-center gap-2"
                style={{ color: theme === "light" ? "gray" : "white" }}
              >
                {t("header.role_actions")}
                <DownOutlined
                  className={`arrow ${isRoleActionsOpen ? "flipped" : ""}`}
                />
              </Button>
            </Dropdown>
          )}
        </div>

        {/* Profile Menu */}
        <Dropdown
          overlay={profileMenu}
          trigger={["click"]}
          overlayClassName={
            theme === "light" ? "dropdown-light" : "dropdown-dark"
          }
          onVisibleChange={(visible) => setIsProfileMenuOpen(visible)}
        >
          <Button
            type="text"
            className="flex items-center gap-2"
            style={{ color: theme === "light" ? "gray" : "white" }}
          >
            {user?.avatarUrl ? (
              <Avatar src={user.avatarUrl} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            <span className="font-medium hidden md:block">{user?.name}</span>
            <DownOutlined
              className={`arrow ${isProfileMenuOpen ? "flipped" : ""}`}
            />
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
