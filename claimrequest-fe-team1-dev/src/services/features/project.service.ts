// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { ApiResponse, PagingResponse } from "@/interfaces/apiresponse.interface";
import { AssignStaffResponse, GetProjectResponse, Project } from "@/interfaces/project.interface";
import axiosInstance from "../../apis/axiosInstance";


export const projectService = {

    projectEndpoint: '/project',
    projectsEndpoint: '/projects',

  async getProjects(): Promise<ApiResponse<PagingResponse<Project>>> {
    const response = await axiosInstance.get<ApiResponse<PagingResponse<Project>>>(
      this.projectsEndpoint
    );
    return response.data;
  },

  async getProjectsPaging(pageNumber: number, pageSize: number): Promise<ApiResponse<PagingResponse<Project>>> {
    try
    {
      const response = await axiosInstance.get<ApiResponse<PagingResponse<Project>>>(
      this.projectsEndpoint + `/list?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data;
    } catch (error: unknown) {
      const apiError = (error as any).response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || 'Get projects failed');
      }
      throw new Error('Network error occurred');
    }
  },

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.get<ApiResponse<Project>>(
      this.projectEndpoint + `/${id}`
    );
    return response.data;
  },

  async getProjectDetails(id: string): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.get<ApiResponse<Project>>(
      this.projectEndpoint +  `/${id}/details`
    );
    return response.data;
  },

  async filterProjects(
    filters: {name?: string;
    description?: string;
    status?: string; // ENUM TYPE
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    budgetFrom?: number;
    budgetTo?: number;
    projectManagerId?: string;
    businessUnitLeaderId?: string;}
  ): Promise<ApiResponse<PagingResponse<Project>>> {
    try {
          const response = await axiosInstance.get<ApiResponse<PagingResponse<Project>>>(
          this.projectsEndpoint +  `/filter`, { params: filters }
          );
          return response.data;
    } catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
        throw new Error(apiError.reason || "Failed to filter projects.");
      }
      throw new Error("Network error occurred");
    }
  },

  async createProject(project: Omit<Project, "id">): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.post<ApiResponse<Project>>(
      this.projectEndpoint + '/create',
      project
    );
    return response.data;
  },

  async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await axiosInstance.put<ApiResponse<Project>>(
      this.projectEndpoint + `/update/${id}`,
      project
    );
    return response.data;
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      this.projectEndpoint + `/delete/${id}`
    );
    return response.data;
  },

  async deleteMultipleProjects(ids: string[]): Promise<ApiResponse<void>> {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      this.projectEndpoint + '/delete',
      { data: { ids } }
    );
    return response.data;
  },

  async getProjectByMemberId(memberId: string): Promise<ApiResponse<GetProjectResponse[]>> {
    try {
        const response = await axiosInstance.get<ApiResponse<GetProjectResponse[]>>(`${this.projectsEndpoint}/member-id/${memberId}`);
        console.log(response.data.data);
        return response.data;
    } catch (error: unknown) {
        const apiError = (error as any).response?.data as ApiResponse<any>; // Specify a type instead of 'any'
        console.log(apiError);
        if (apiError) {
            throw new Error(apiError.reason || 'Get claims failed');
        }
        throw new Error('Network error occurred');
    }
  },

  async AssignStaffToProject(projectId:string, staff: { staffId: string, projectRole: string }): Promise<ApiResponse<AssignStaffResponse>> {
    try {
      const response = await axiosInstance.post<ApiResponse<AssignStaffResponse>>(
        `${this.projectEndpoint}/assign-staff`,
        {
          staffId: staff.staffId,
          projectRole: staff.projectRole
        },
        {
          params: { id: projectId }
        }
      );
        return response.data;
    } catch (error: any) {
        const apiError = error.response?.data as ApiResponse<any>;
        if (apiError) {
            throw new Error(apiError.reason || 'Assign staff failed');
        }
        throw new Error('Network error occurred');
    }
  },

  async UpdateStaffInProject(projectId: string, staff: { staffId: string, projectRole: string }): Promise<ApiResponse<AssignStaffResponse>> {
    try {
        const response = await axiosInstance
          .put<ApiResponse<AssignStaffResponse>>(`${this.projectEndpoint}/update-staff`,
            {
              staffId: staff.staffId,
              projectRole: staff.projectRole
            },
            {
              params: { id: projectId }
            });
        return response.data;
    }  catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
          throw new Error(apiError.reason || 'Assign staff failed');
      }
      throw new Error('Network error occurred');
    }
  },

  async RemoveStaffFromProject(projectId: string, staffId: string): Promise<ApiResponse<void>> {
    try {
        const response = await axiosInstance
          .delete<ApiResponse<void>>(`${this.projectEndpoint}/remove-staff`,
            {
              params: {
                projectId,
                staffId
              }
            }
          );
        return response.data;
    }  catch (error: any) {
      const apiError = error.response?.data as ApiResponse<any>;
      if (apiError) {
          throw new Error(apiError.reason || 'Assign staff failed');
      }
      throw new Error('Network error occurred');
    }
  }

};
