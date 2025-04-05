import React from "react";
import FPTGlobalGeo from "@/components/GlobalGeo/FPTGlobalGeo";
import { useTranslation } from "react-i18next";

const FPTGlobalInfo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center animate__animated animate__fadeIn animate__faster bg-circle dark:bg-circle">
      <div className="text-center z-10">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[#1169B0] via-[#F27227] to-[#16B14B] text-transparent bg-clip-text">
          {t("global_page.header.title")}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          {t("global_page.header.slogan")}
        </p>
      </div>
      <div className="flex flex-row">
        <div className="w-60 flex flex-col justify-evenly">
          <div className="p-2 rounded-xl bg-white/10 dark:bg-transparent backdrop-blur-sm flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-[#F27227]">1,1K+</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("global_page.sider.global_clients")}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-white/10 dark:bg-transparent backdrop-blur-sm flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-[#1169B0]">40+</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("global_page.sider.global_offices")}
            </p>
          </div>
        </div>
        <div className="relative max-w-[600px] h-[600px]">
          <div className="flex-1 absolute inset-0 rounded-full animate-pulse dark:bg-gradient-to-b dark:from-transparent dark:via-blue-700/5 bg-gradient-to-b from-transparent via-gray-500/5 to-transparent" />
          <FPTGlobalGeo />
        </div>
        <div className="w-60 flex flex-col justify-evenly">
          <div className="p-2 rounded-xl bg-white/10 dark:bg-transparent backdrop-blur-sm flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-[#16B14B]">33K+</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("global_page.sider.employees_worldwide")}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-white/10 dark:bg-transparent backdrop-blur-sm flex flex-col items-center justify-center">
            <h3 className="text-3xl font-bold text-[#1169B0]">26+</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("global_page.sider.countries_territories")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FPTGlobalInfo;
