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

const CreateClaim: React.FC = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const today = new Date().toISOString().split("T")[0];
  const [claimTypes, setClaimTypes] = useState<string[]>([]);
  const [projects, setProjects] = useState<GetProjectResponse[]>([]);
  const [formData, setFormData] = useState({
    claimTypes: "",
    name: "",
    remark: "",
    amount: 0,
    totalWorkingHours: 0,
    startDate: "",
    endDate: "",
    projectId: "",
    claimerId: "",
  });

  useEffect(() => {
    const fetchClaimTypes = async () => {
      try {
        const resp = await claimService.getClaimTypes();
        setClaimTypes(resp.data ?? []);
      } catch (error) {
        toast.error("Failed to fetch claim types");
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
        toast.error("Failed to fetch projects");
      }
    };

    fetchClaimTypes();
    fetchProjects();
  }, [user, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await claimService.submitClaimV2({ ...formData });
      if (response.is_success) {
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.CLAIMER_MODE,
        ]);
        toast.success("Claim submitted successfully!");
        navigate("/claims");
      } else {
        toast.error(response.message || "Failed to submit claim");
      }
    } catch (error) {
      toast.error("Failed to submit claim. Please try again.");
    }
  };

  const handleSave = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const response = await claimService.createClaim({
        ...formData,
        status: "DRAFT",
        userId: user?.id,
      });

      if (response.is_success) {
        cacheService.invalidateByTags([
          CACHE_TAGS.CLAIMS,
          CACHE_TAGS.CLAIM_LISTS,
          CACHE_TAGS.CLAIMER_MODE,
        ]);
        toast.success("Draft saved successfully!");
        navigate("/claims");
      } else {
        toast.error(response.message || "Failed to save draft");
      }
    } catch (error) {
      toast.error("Failed to save draft. Please try again.");
    }
  };

  const handleReturn = (): void => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1C1F26] p-6 flex items-center justify-center">
      <form
        ref={formRef}
        className="max-w-[800px] w-full bg-white dark:bg-[#272B34] p-8 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Create New Claim
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center">
            <label htmlFor="claimType" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Claim Type:
            </label>
            <select
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="claimType"
              name="claimType"
              required
              onChange={handleChange}
            >
              <option value="" disabled selected>
                Please select a claim type
              </option>
              {claimTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <label htmlFor="name" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Claim Name:
            </label>
            <input
              type="text"
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="name"
              name="name"
              required
              placeholder="Please enter your claim name"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="remark" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Remark:
            </label>
            <input
              type="text"
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="remark"
              name="remark"
              required
              placeholder="Please enter your remark"
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="amount" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Amount:
            </label>
            <input
              type="number"
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="amount"
              name="amount"
              required
              onChange={handleChange}
              defaultValue={0}
              min={0}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="totalWorkingHours" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Working Hours:
            </label>
            <input
              type="number"
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="totalWorkingHours"
              name="totalWorkingHours"
              required
              onChange={handleChange}
              defaultValue={0}
              min={0}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="startDate" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Start Date:
            </label>
            <input
              type="date"
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              id="startDate"
              name="startDate"
              min={today}
              required
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="endDate" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              End Date:
            </label>
            <input
              type="date"
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              id="endDate"
              name="endDate"
              min={formData.startDate || today}
              required
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center">
            <label htmlFor="projectId" className="block w-1/3 text-lg text-gray-700 dark:text-gray-300">
              Project:
            </label>
            <select
              className="w-2/3 border p-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-[#272B34] dark:text-gray-300"
              id="projectId"
              name="projectId"
              onChange={handleChange}
            >
              <option value="" selected>
                No project selected
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-5 gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white cursor-pointer px-5 py-2.5 rounded-md border-none hover:bg-blue-700 flex items-center gap-2"
          >
            Submit <MailOutlined />
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white cursor-pointer px-5 py-2.5 rounded-md border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleSave}
          >
            Save Draft <SaveOutlined />
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white cursor-pointer px-5 py-2.5 rounded-md border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleReturn}
          >
            Return <RollbackOutlined />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClaim;
