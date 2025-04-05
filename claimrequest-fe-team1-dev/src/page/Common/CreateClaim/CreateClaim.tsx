// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { GetProjectResponse } from "@/interfaces/project.interface";
import { claimService } from "@/services/features/claim.service";
import { projectService } from "@/services/features/project.service";
import { useAppSelector } from "@/services/store/store";
import {
  MailOutlined,
  RollbackOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cacheService, CACHE_TAGS } from "@/services/features/cacheService";
import { useTranslation } from "react-i18next";
import { useApi } from "@/hooks/useApi";

const CreateClaim: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const today = new Date().toISOString().split("T")[0];
  const [claimTypes, setClaimTypes] = useState<string[]>([]);
  const [projects, setProjects] = useState<GetProjectResponse[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    remark: "",
    amount: 0,
    totalWorkingHours: 0,
    startDate: "",
    endDate: "",
    projectId: "",
    claimType: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();
  const { withLoading } = useApi();

  useEffect(() => {
    const fetchClaimTypes = async () => {
      try {
        const resp = await claimService.getClaimTypes();
        setClaimTypes(resp.data ?? []);
      } catch (error) {
        toast.error(t("create_claim.error_fetch_claim_types"));
      }
    };

    const fetchProjects = async () => {
      try {
        if (user == null) navigate("/login");
        else {
          const resp = await projectService.getProjectByMemberId(user.id);
          setProjects(resp.data || []);
        }
      } catch (error) {
        toast.error(t("create_claim.error_fetch_projects"));
      }
    };

    fetchClaimTypes();
    fetchProjects();
  }, [user, navigate, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "", // Clear error when the user starts typing
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.claimType)
      newErrors.claimType = t("create_claim.error_claim_type_required");
    if (!formData.name) newErrors.name = t("create_claim.error_name_required");
    if (!formData.remark)
      newErrors.remark = t("create_claim.error_remark_required");
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = t("create_claim.error_amount_required");
    if (!formData.totalWorkingHours || formData.totalWorkingHours <= 0)
      newErrors.totalWorkingHours = t(
        "create_claim.error_working_hours_required",
      );
    if (!formData.startDate)
      newErrors.startDate = t("create_claim.error_start_date_required");
    if (!formData.endDate)
      newErrors.endDate = t("create_claim.error_end_date_required");
    if (!formData.projectId)
      newErrors.projectId = t("create_claim.error_project_required");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await withLoading(
        claimService.submitClaimV2({ ...formData }),
      );
      if (response.is_success) {
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.CLAIMER_MODE,
        ]);
        toast.success(t("create_claim.success_submit"));
        navigate("/claims");
      } else {
        toast.error(response.message || t("create_claim.error_submit"));
      }
    } catch (error) {
      toast.error(t("create_claim.error_submit"));
    }
  };

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await withLoading(
        claimService.createClaim({
          ...formData,
          status: "DRAFT",
          userId: user?.id,
        }),
      );

      if (response.is_success) {
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.CLAIMER_MODE,
        ]);
        toast.success(t("create_claim.success_save_draft"));
        navigate("/claims");
      } else {
        toast.error(response.message || t("create_claim.error_save_draft"));
      }
    } catch (error) {
      toast.error(t("create_claim.error_save_draft"));
    }
  };

  const handleReturn = (): void => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#1C1F26] p-6 flex items-center justify-center">
      <form
        ref={formRef}
        className="max-w-[800px] w-full bg-white dark:bg-[#272B34] p-8 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {t("create_claim.title")}
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col">
            <label
              htmlFor="claimType"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.claim_type")}:
            </label>
            <select
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="claimType"
              name="claimType"
              onChange={handleChange}
              value={formData.claimType}
            >
              <option value="" disabled>
                {t("create_claim.select_claim_type")}
              </option>
              {claimTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.claimType && (
              <span className="text-red-500 text-sm">{errors.claimType}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.claim_name")}:
            </label>
            <input
              type="text"
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="name"
              name="name"
              placeholder={t("create_claim.enter_claim_name")}
              onChange={handleChange}
              value={formData.name}
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="remark"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.remark")}:
            </label>
            <input
              type="text"
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="remark"
              name="remark"
              placeholder={t("create_claim.enter_remark")}
              onChange={handleChange}
              value={formData.remark}
            />
            {errors.remark && (
              <span className="text-red-500 text-sm">{errors.remark}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.amount")}:
            </label>
            <input
              type="number"
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="amount"
              name="amount"
              placeholder={t("create_claim.amount")}
              onChange={handleChange}
              value={formData.amount}
              min={0}
            />
            {errors.amount && (
              <span className="text-red-500 text-sm">{errors.amount}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="totalWorkingHours"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.working_hours")}:
            </label>
            <input
              type="number"
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="totalWorkingHours"
              name="totalWorkingHours"
              placeholder={t("create_claim.working_hours")}
              onChange={handleChange}
              value={formData.totalWorkingHours}
              min={0}
            />
            {errors.totalWorkingHours && (
              <span className="text-red-500 text-sm">
                {errors.totalWorkingHours}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="startDate"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.start_date")}:
            </label>
            <input
              type="date"
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              id="startDate"
              name="startDate"
              min={today}
              onChange={handleChange}
              value={formData.startDate}
            />
            {errors.startDate && (
              <span className="text-red-500 text-sm">{errors.startDate}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="endDate"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.end_date")}:
            </label>
            <input
              type="date"
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              id="endDate"
              name="endDate"
              min={formData.startDate || today}
              onChange={handleChange}
              value={formData.endDate}
            />
            {errors.endDate && (
              <span className="text-red-500 text-sm">{errors.endDate}</span>
            )}
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="projectId"
              className="text-lg text-gray-700 dark:text-gray-300"
            >
              {t("create_claim.project")}:
            </label>
            <select
              className="border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="projectId"
              name="projectId"
              onChange={handleChange}
              value={formData.projectId}
            >
              <option value="" disabled>
                {t("create_claim.select_project")}
              </option>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  {t("create_claim.no_projects_available")}
                </option>
              )}
            </select>
            {errors.projectId && (
              <span className="text-red-500 text-sm">{errors.projectId}</span>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-5 gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white cursor-pointer px-5 py-2.5 rounded-md border-none hover:bg-blue-700 flex items-center gap-2"
          >
            {t("create_claim.submit")} <MailOutlined />
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white cursor-pointer px-5 py-2.5 rounded-md border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleSave}
          >
            {t("create_claim.save_draft")} <SaveOutlined />
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white cursor-pointer px-5 py-2.5 rounded-md border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleReturn}
          >
            {t("create_claim.return")} <RollbackOutlined />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClaim;
