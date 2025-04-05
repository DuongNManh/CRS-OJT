import { GetStaffResponse } from "./staff.interface";

export interface Project {
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
    businessUnitLeader: {
      id: string;
      name: string;
      email: string;
      systemRole: string;
      department: string;
    };
    projectStaffs: ProjectStaff[];
  }

export interface Staff {
    id: string;
    name: string;
    email: string;
    systemRole: string;
    department: string;
  };

export interface ProjectStaff {
    id: string;
    projectId: string;
    staffId: string;
    projectRole: string;
    staff: GetStaffResponse;
  };

export interface FormData {
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
    businessUnitLeader: {
      id: string;
      name: string;
      email: string;
      systemRole: string;
      department: string;
    };
  }

export interface AssignStaffForm {
    staffId: string;
    projectRole: string;
}

export interface RemoveStaffForm {
    projectId: string;
    staffId: string;
}

export interface GetProjectResponse {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  projectManager: GetStaffResponse;
  businessUnitLeader: GetStaffResponse;
}

export interface AssignStaffResponse {
    projectId: string;
    staffId: string;
    staffName: string;
    projectName: string;
    projectRole: string;
}

export const PROJECT_STATUS = {
  DRAFT: "Draft",
  ONGOING: "Ongoing",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export const STATUS_COLOR ={
  Draft: "orange",
  Ongoing: "blue",
  Rejected: "red",
  Archived: "gray"
};

export const DEPARTMENT_COLOR = {
  Engineering: {
    text: "blue",
    bg: "bg-blue-500"
  },
  ProjectManagement: {
    text: "red",
    bg: "bg-red-500"
  },
  Finance: {
    text: "purple",
    bg: "bg-purple-500"
  },
  BusinessUnitLeader: {
    text: "orange",
    bg: "bg-orange-500"
  },
  Administration: {
    text: "green",
    bg: "bg-green-500"
  }
}

export const PROJECT_ROLE_COLOR = {
  Developer: "cyan",
  Tester: "green",
  Engineering: "geekblue",
  BusinessAnalyst: "volcano",
  QualityAssurance: "magenta"
}

export const SYSTEM_ROLE_COLOR = {
  Staff: {
    text: "blue",
    bg: "bg-blue-500"
  },
  Approver: {
    text: "red",
    bg: "bg-red-500"
  },
  Finance: {
    text: "purple",
    bg: "bg-purple-500"
  },
  Admin: {
    text: "green",
    bg: "bg-green-500"
  }
}



