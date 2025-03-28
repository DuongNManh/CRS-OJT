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
  }, []);

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
    <div className=" p-4">
      <form
        ref={formRef}
        className="max-w-[800px] mx-auto bg-white p-[20px] rounded-[10px] shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-[20px] text-center">
          Create New Claim
        </h2>
        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="claimType"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            Claim Type:
          </label>
          <select
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
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
        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="name" className="block mr-2.5 w-[150px] text-[18px]">
            Claim Name:
          </label>
          <input
            type="text"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="name"
            name="name"
            required
            placeholder="Please enter your claim name"
            onChange={handleChange}
          />
        </div>
        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="remark"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            Remark:
          </label>
          <input
            type="text"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="remark"
            name="remark"
            required
            placeholder="Please enter your remark"
            onChange={handleChange}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="amount"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            Amount:
          </label>
          <input
            type="number"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="amount"
            name="amount"
            required
            onChange={handleChange}
            defaultValue={0}
            min={0}
          />
        </div>
        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="totalWorkingHours"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            Working Hours:
          </label>
          <input
            type="number"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="totalWorkingHours"
            name="totalWorkingHours"
            required
            onChange={handleChange}
            defaultValue={0}
            min={0}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="startDate"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            Start Date:
          </label>
          <input
            type="date"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="startDate"
            name="startDate"
            min={today}
            required
            onChange={handleChange}
          />
        </div>
        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="endDate"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            End Date:
          </label>
          <input
            type="date"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="endDate"
            name="endDate"
            min={formData.startDate || today}
            required
            onChange={handleChange}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label
            htmlFor="projectId"
            className="block mr-2.5 w-[150px] text-[18px]"
          >
            Project:
          </label>
          <select
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
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

        <div className="container flex justify-center mt-5 gap-4">
          <button
            type="submit"
            className="bg-blue-500 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-blue-700 flex items-center gap-2"
          >
            Submit <MailOutlined />
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleSave}
          >
            Save Draft <SaveOutlined />
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-gray-700 flex items-center gap-2"
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
