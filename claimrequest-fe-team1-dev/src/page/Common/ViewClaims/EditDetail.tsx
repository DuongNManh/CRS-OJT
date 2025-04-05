// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { GetProjectResponse } from "@/interfaces/project.interface";
import { CACHE_TAGS, cacheService } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { projectService } from "@/services/features/project.service";
import { useAppSelector } from "@/services/store/store";
import { LoadingOutlined } from "@ant-design/icons";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface FormDataState {
  claimType: string;
  name: string;
  remark: string;
  amount: number;
  totalWorkingHours: number;
  startDate: string;
  endDate: string;
  projectId: string;
  status: string;
}

const EditDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [claimTypes, setClaimTypes] = useState<string[]>([]);
  const [projects, setProjects] = useState<GetProjectResponse[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    claimType: "",
    name: "",
    remark: "",
    amount: 0,
    totalWorkingHours: 0,
    startDate: "",
    endDate: "",
    projectId: "",
    status: "Draft",
  });
  const [validationErrors, setValidationErrors] = useState<
    Partial<FormDataState>
  >({});
  const { t } = useTranslation();

  // Fetch claim data và các data cần thiết khác
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch claim data
        if (id) {
          const claimResponse = await claimService.getClaimById(id);
          if (claimResponse.data) {
            const claim = claimResponse.data;
            setFormData({
              claimType: claim.claimType || "",
              name: claim.name || "",
              remark: claim.remark || "",
              amount: claim.amount || 0,
              totalWorkingHours: claim.totalWorkingHours || 0,
              startDate: claim.startDate
                ? new Date(claim.startDate).toISOString().split("T")[0]
                : "",
              endDate: claim.endDate
                ? new Date(claim.endDate).toISOString().split("T")[0]
                : "",
              projectId: claim.project?.id || "",
              status: claim.status || "Draft",
            });
          }
        }

        // Fetch claim types
        const claimTypesResponse = await claimService.getClaimTypes();
        if (claimTypesResponse.data) {
          setClaimTypes(claimTypesResponse.data);
        }

        // Fetch projects
        if (user?.id) {
          const projectsResponse = await projectService.getProjectByMemberId(
            user.id,
          );
          if (projectsResponse.data) {
            setProjects(projectsResponse.data);
          }
        }
      } catch (error: any) {
        toast.error(error.message || t("edit_detail.toast.fetch_error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "amount" || name === "totalWorkingHours"
          ? Number(value)
          : value,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormDataState> = {};

    if (!formData.claimType) errors.claimType = "Claim type is required.";
    if (!formData.name) errors.name = "Claim name is required.";
    if (!formData.remark) errors.remark = "Remark is required.";
    if (!formData.amount || formData.amount <= 0)
      errors.amount = "Amount must be greater than 0.";
    if (!formData.totalWorkingHours || formData.totalWorkingHours <= 0)
      errors.totalWorkingHours = "Working hours must be greater than 0.";
    if (!formData.startDate) errors.startDate = "Start date is required.";
    if (!formData.endDate) errors.endDate = "End date is required.";
    if (!formData.projectId)
      errors.projectId = "Project selection is required.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updateData = {
        ...formData,
        id: id,
        status: "Draft",
      };
      const response = await claimService.updateClaim(updateData);

      if (response.is_success) {
        toast.success(t("edit_detail.toast.draft_save_success"));
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          `claim_${id}`,
        ]);
        navigate("/claim-detail/" + id);
      } else {
        toast.error(
          response.message || t("edit_detail.toast.draft_save_error"),
        );
      }
    } catch (error: any) {
      toast.error(
        error.message || t("edit_detail.toast.draft_save_error_generic"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updateData = {
        ...formData,
        id: id,
        status: "Pending", // Change status to Pending when submitting
      };

      const response = await claimService.updateClaim(updateData);

      if (response.is_success) {
        toast.success(t("edit_detail.toast.submit_success"));
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          `claim_${id}`,
        ]);
        navigate("/claim-detail/" + id);
      } else {
        toast.error(response.message || t("edit_detail.toast.submit_error"));
      }
    } catch (error: any) {
      toast.error(error.message || t("edit_detail.toast.submit_error_generic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = (): void => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-[#0E1217]">
        <LoadingOutlined style={{ fontSize: 40 }} />
      </div>
    );
  }

  return (
    <div className="p-6 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-[#0E1217]">
      <form
        ref={formRef}
        className="max-w-[800px] w-full bg-white dark:bg-[#272B34] p-8 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-[20px] text-center text-gray-900 dark:text-white">
          {t("edit_detail.title")}
        </h2>

        {/* Claim Type */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="claimType"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.claim_type")}
          </label>
          <select
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="claimType"
            name="claimType"
            required
            value={formData.claimType}
            onChange={handleChange}
          >
            <option value="" disabled>
              {t("edit_detail.select_claim_type")}
            </option>
            {claimTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {validationErrors.claimType && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.claim_type_required")}
            </span>
          )}
        </div>

        {/* Claim Name */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="name"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.claim_name")}
          </label>
          <input
            type="text"
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="name"
            name="name"
            required
            value={formData.name}
            placeholder={t("edit_detail.enter_claim_name")}
            onChange={handleChange}
          />
          {validationErrors.name && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.name_required")}
            </span>
          )}
        </div>

        {/* Remark */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="remark"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.remark")}
          </label>
          <input
            type="text"
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="remark"
            name="remark"
            required
            value={formData.remark}
            placeholder={t("edit_detail.enter_remark")}
            onChange={handleChange}
          />
          {validationErrors.remark && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.remark_required")}
            </span>
          )}
        </div>

        {/* Amount */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="amount"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.amount")}
          </label>
          <input
            type="number"
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="amount"
            name="amount"
            required
            value={formData.amount}
            onChange={handleChange}
            min={0}
          />
          {validationErrors.amount && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.amount_required")}
            </span>
          )}
        </div>

        {/* Working Hours */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="totalWorkingHours"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.working_hours")}
          </label>
          <input
            type="number"
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="totalWorkingHours"
            name="totalWorkingHours"
            required
            value={formData.totalWorkingHours}
            onChange={handleChange}
            min={0}
          />
          {validationErrors.totalWorkingHours && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.working_hours_required")}
            </span>
          )}
        </div>

        {/* Start Date */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="startDate"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.start_date")}
          </label>
          <input
            type="date"
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="startDate"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleChange}
          />
          {validationErrors.startDate && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.start_date_required")}
            </span>
          )}
        </div>

        {/* End Date */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="endDate"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.end_date")}
          </label>
          <input
            type="date"
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="endDate"
            name="endDate"
            required
            value={formData.endDate}
            onChange={handleChange}
          />
          {validationErrors.endDate && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.end_date_required")}
            </span>
          )}
        </div>

        {/* Project */}
        <div className="mb-[15px] w-full flex flex-col">
          <label
            htmlFor="projectId"
            className="block mb-1 text-[18px] text-gray-900 dark:text-white"
          >
            {t("edit_detail.project")}
          </label>
          <select
            className="box-border border p-2 rounded-[5px] border-solid border-[#ccc] dark:border-gray-600 dark:bg-[#272B34] dark:text-white"
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
          >
            <option value="">{t("edit_detail.no_project_selected")}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {validationErrors.projectId && (
            <span className="text-red-500 text-sm">
              {t("edit_detail.validation.project_required")}
            </span>
          )}
        </div>

        <div className="container flex justify-center mt-5 gap-4">
          <button
            type="button"
            className="bg-blue-500 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-blue-700 flex items-center gap-2"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {t("edit_detail.save_draft")}
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleReturn}
            disabled={isLoading}
          >
            {t("edit_detail.return")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDetail;
