import { SystemRole } from "@/interfaces/auth.interface";
import { useAppSelector } from "@/services/store/store";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const user = useAppSelector((state) => state.auth.user);

  const roleGroups = {
    [SystemRole.ADMIN]: [
      {
        name: t("footer.staff_information"),
        url: "/admin/staffs",
      },
      {
        name: t("footer.project_information"),
        url: "/admin/projects",
      },
      {
        name: t("footer.claim_information"),
        url: "/admin/claims",
      },
    ],
    [SystemRole.APPROVER]: [
      {
        name: t("footer.pending_approval"),
        url: "/approver/claims",
      },
    ],
    [SystemRole.FINANCE]: [
      {
        name: t("footer.pending_payment"),
        url: "/finance/claims",
      },
    ],
  };

  return (
    <footer className="bg-gray-200 text-gray-600 dark:bg-[#121212] dark:text-gray-50 dark:border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          <div>
            {(user?.systemRole === SystemRole.STAFF ||
              user?.systemRole === SystemRole.APPROVER) && (
              <div>
                <h3 className="font-semibold mb-4">{t("footer.claims")}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/create-claim" className="hover:text-blue-600">
                      {t("footer.create_claim")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/claims" className="hover:text-blue-600">
                      {t("footer.view_claims")}
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div>
            {user?.systemRole != SystemRole.STAFF && (
              <div>
                <h3 className="font-semibold mb-4">
                  {t("footer.role_action")}
                </h3>
                <ul>
                  {roleGroups[user?.systemRole as keyof typeof roleGroups]?.map(
                    (action) => (
                      <li key={action.url}>
                        <Link to={action.url} className="hover:text-blue-600">
                          {action.name}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
          <div className="flex flex-row justify-end">
            <div className="flex justify-center">
              <div>
                <h3 className="font-semibold mb-4">{t("footer.about_us")}</h3>
                <p className="text-gray-500 dark:text-gray-300">
                  {t("footer.about_us_description")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-400 mt-8 pt-8 text-center">
          <p>{t("footer.copyright", { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
