import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-[#1C1F26]">
      <div className="text-center space-y-6 p-8 bg-white dark:bg-[#272B34] rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* 404 Text with Gradient */}
        <div className="relative">
          <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-2">
            {t("not_found.title")}
          </h2>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-600 to-transparent" />

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {t("not_found.description")}
        </p>

        {/* Button */}
        <Button
          type="primary"
          size="large"
          icon={<HomeOutlined />}
          onClick={() => navigate("/")}
          className="bg-gradient-to-r from-blue-500 to-teal-400 border-none hover:from-blue-600 hover:to-teal-500 h-12"
        >
          {t("not_found.go_home")}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
