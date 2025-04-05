import React from "react";
import { useTranslation } from "react-i18next";

const ClaimDetailLoading: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center dark:text-white dark:bg-[#272B34]">
      <div className="text-lg">{t("claim_detail_loading.loading_message")}</div>
    </div>
  );
};

export default ClaimDetailLoading;
