// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { SystemRole } from "@/interfaces/auth.interface";
import { useAppSelector } from "@/services/store/store";
import {
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, Menu } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

// Import custom CSS

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClaimActionsOpen, setIsClaimActionsOpen] = useState(false);
  const [isRoleActionsOpen, setIsRoleActionsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  const { authLogout } = useAuth();

  const handleLogout = async () => {
    await authLogout();
  };

  const roleGroups = {
    [SystemRole.ADMIN]: [
      {
        name: "Staff Information",
        url: "/admin/staffs",
      },
      {
        name: "Project Information",
        url: "/admin/projects",
      },
    ],
    [SystemRole.APPROVER]: [
      {
        name: "For My Vetting",
        url: "/approver/claims",
      },
    ],
    [SystemRole.FINANCE]: [
      {
        name: "Approved Claims",
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
          Create Claim
        </Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link
          to="/claims"
          style={{ color: theme === "light" ? "gray" : "white" }}
        >
          View Claims
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
          <UserOutlined /> My Profile
        </Link>
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={handleLogout}
        style={{ color: theme === "light" ? "gray" : "white" }}
      >
        <LogoutOutlined /> Log Out
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      className={`flex flex-col md:flex-row justify-between items-center p-4 ${
        theme === "light"
          ? "bg-gray-100 text-gray-900"
          : "bg-[#121212] text-gray-50"
      } z-50 dark:border-b dark:border-gray-800`}
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
              className="h-14 w-30 mr-1"
            />
            <p className="italic text-3xl text-[#1169B0] pt-0">C</p>
            <p className="italic text-3xl text-[#F27227] pt-0">R</p>
            <p className="italic text-3xl text-[#16B14B] pt-0">S</p>
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
                <MoonOutlined />
              ) : (
                <SunOutlined className="text-yellow-500" />
              )
            }
            onClick={toggleTheme}
            className="mr-2"
            style={{ color: theme === "light" ? "gray" : "white" }}
          />
          {/* Claim Actions Dropdown */}
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
              Claim Actions{" "}
              <DownOutlined
                className={`arrow ${isClaimActionsOpen ? "flipped" : ""}`}
              />
            </Button>
          </Dropdown>

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
                Role Actions{" "}
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
            <Avatar icon={<UserOutlined />} />
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
