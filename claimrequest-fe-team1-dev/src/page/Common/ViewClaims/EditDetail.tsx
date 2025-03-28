import { GetProjectResponse } from "@/interfaces/project.interface";
import { claimService } from "@/services/features/claim.service";
import { projectService } from "@/services/features/project.service";
import { useAppSelector } from "@/services/store/store";
import {
  MailOutlined,
  RollbackOutlined,
  SaveOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

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
  const location = useLocation();
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
    status: "Draft"
  });

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
              startDate: claim.startDate ? new Date(claim.startDate).toISOString().split('T')[0] : "",
              endDate: claim.endDate ? new Date(claim.endDate).toISOString().split('T')[0] : "",
              projectId: claim.project?.id || "",
              status: claim.status || "Draft"
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
          const projectsResponse = await projectService.getProjectByMemberId(user.id);
          if (projectsResponse.data) {
            setProjects(projectsResponse.data);
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(error.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' || name === 'totalWorkingHours' ? Number(value) : value,
    }));
  };

  const handleUpdate = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updateData = {
        ...formData,
        id: id,
        status: "Draft"
      };

      const response = await claimService.updateClaim(updateData);

      if (response.is_success) {
        toast.success("Draft saved successfully!");
        navigate("/claims");
      } else {
        toast.error(response.message || "Failed to save draft");
      }
    } catch (error: any) {
      console.error("Save draft error:", error);
      toast.error(error.message || "Failed to save draft. Please try again.");
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
        status: "Pending" // Change status to Pending when submitting
      };

      const response = await claimService.updateClaim(updateData);

      if (response.is_success) {
        toast.success("Claim submitted successfully!");
        navigate("/claims");
      } else {
        toast.error(response.message || "Failed to submit claim");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit claim. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = (): void => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingOutlined style={{ fontSize: 40 }} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <form
        ref={formRef}
        className="max-w-[800px] mx-auto bg-white p-[20px] rounded-[10px] shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-[20px] text-center">
          Update Claim
        </h2>
        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="claimType" className="block mr-2.5 w-[150px] text-[18px]">
            Claim Type:
          </label>
          <select
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="claimType"
            name="claimType"
            required
            value={formData.claimType}
            onChange={handleChange}
          >
            <option value="" disabled>Please select a claim type</option>
            {claimTypes.map(type => (
              <option key={type} value={type}>{type}</option>
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
            value={formData.name}
            placeholder="Please enter your claim name"
            onChange={handleChange}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="remark" className="block mr-2.5 w-[150px] text-[18px]">
            Remark:
          </label>
          <input
            type="text"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="remark"
            name="remark"
            required
            value={formData.remark}
            placeholder="Please enter your remark"
            onChange={handleChange}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="amount" className="block mr-2.5 w-[150px] text-[18px]">
            Amount:
          </label>
          <input
            type="number"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="amount"
            name="amount"
            required
            value={formData.amount}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="totalWorkingHours" className="block mr-2.5 w-[150px] text-[18px]">
            Working Hours:
          </label>
          <input
            type="number"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="totalWorkingHours"
            name="totalWorkingHours"
            required
            value={formData.totalWorkingHours}
            onChange={handleChange}
            min={0}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="startDate" className="block mr-2.5 w-[150px] text-[18px]">
            Start Date:
          </label>
          <input
            type="date"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="startDate"
            name="startDate"
            required
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="endDate" className="block mr-2.5 w-[150px] text-[18px]">
            End Date:
          </label>
          <input
            type="date"
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="endDate"
            name="endDate"
            required
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="mb-[15px] w-full flex items-center">
          <label htmlFor="projectId" className="block mr-2.5 w-[150px] text-[18px]">
            Project:
          </label>
          <select
            className="w-[calc(100%_-_160px)] box-border border p-2 rounded-[5px] border-solid border-[#ccc]"
            id="projectId"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
          >
            <option value="">No project selected</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="container flex justify-center mt-5 gap-4">
          <button
            type="button"
            className="bg-blue-500 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleUpdate}
            disabled={isLoading}
          >
            {isLoading ? <LoadingOutlined spin /> : <SaveOutlined />} Save Draft
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white cursor-pointer px-5 py-2.5 rounded-[5px] border-none hover:bg-gray-700 flex items-center gap-2"
            onClick={handleReturn}
            disabled={isLoading}
          >
            <RollbackOutlined /> Return
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDetail;