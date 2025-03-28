import axiosInstance from "@/apis/axiosInstance";
import {
  ApiResponse,
  PagingResponse,
} from "@/interfaces/apiresponse.interface";
import { GetProjectResponse } from "@/interfaces/project.interface";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  projectManager: {
    id: string;
    name: string;
    email: string;
    systemRole: string;
    department: string;
  };
}

interface Staff {
  id: string;
  name: string;
  email: string;
  systemRole: string;
  department: string;
}

export const projectService = {
  projectEndpoint: "/project",
  projectsEndpoint: "/projects",

  async getStaffs(): Promise<ApiResponse<PagingResponse<Staff>>> {
    const response =
      await axiosInstance.get<ApiResponse<PagingResponse<Staff>>>("/staffs");
    return response.data;
  },

  async getProjects(): Promise<ApiResponse<PagingResponse<Project>>> {
    const response =
      await axiosInstance.get<ApiResponse<PagingResponse<Project>>>(
        "/projects",
      );
    return response.data;
  },

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.get<ApiResponse<Project>>(
      `/project/${id}`,
    );
    return response.data;
  },

  async getProjectDetails(id: string): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.get<ApiResponse<Project>>(
      `/project/${id}/details`,
    );
    return response.data;
  },

  async createProject(
    project: Omit<Project, "id">,
  ): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.post<ApiResponse<Project>>(
      "/project/create",
      project,
    );
    return response.data;
  },

  async updateProject(
    id: string,
    project: Partial<Project>,
  ): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.put<ApiResponse<Project>>(
      `/project/update/${id}`,
      project,
    );
    return response.data;
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/project/delete/${id}`,
    );
    return response.data;
  },

  async getProjectByMemberId(
    memberId: string,
  ): Promise<ApiResponse<GetProjectResponse[]>> {
    try {
      const response = await axiosInstance.get<
        ApiResponse<GetProjectResponse[]>
      >(`${this.projectEndpoint}/member-id/${memberId}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = (error as any).response?.data as ApiResponse<any>; // Specify a type instead of 'any'

      if (apiError) {
        throw new Error(apiError.reason || "Get claims failed");
      }
      throw new Error("Network error occurred");
    }
  },
};
