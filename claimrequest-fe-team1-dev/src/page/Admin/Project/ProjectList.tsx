// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { SystemRole } from "@/interfaces/auth.interface";
import {
  AssignStaffForm,
  DEPARTMENT_COLOR,
  FormData,
  Project,
  PROJECT_ROLE_COLOR,
  PROJECT_STATUS,
  ProjectStaff,
  RemoveStaffForm,
  Staff,
  STATUS_COLOR,
  SYSTEM_ROLE_COLOR,
} from "@/interfaces/project.interface";
import { Department, GetStaffResponse } from "@/interfaces/staff.interface";
import { projectService } from "@/services/features/project.service";
import { staffService } from "@/services/features/staff.service";
import {
  DeleteFilled,
  EditFilled,
  FilterFilled,
  PlusCircleFilled,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import StaffDetailsModal from "../StaffList/StaffDetailModal";
import { useTranslation } from "react-i18next";
import { addSpaceBeforeCapitalLetters } from "@/utils/stringFormatter";
const { RangePicker } = DatePicker;

interface ModalState {
  view:
    | "list"
    | "view"
    | "update"
    | "add"
    | "assign"
    | "editStaff"
    | "deleteStaff";
}

const ExpandedRow: React.FC<{
  record: Project;
  columns: ColumnsType<ProjectStaff>;
  loadedDetails: { [key: string]: Project };
  setLoadedDetails: (details: { [key: string]: Project }) => void;
  refreshTrigger: number;
}> = ({ record, columns, setLoadedDetails, refreshTrigger }) => {
  const [detailLoading, setDetailLoading] = useState(true);
  const [projectDetail, setProjectDetail] = useState<Project | null>(null);
  const [isStaffDetailVisible, setIsStaffDetailVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<GetStaffResponse | null>(
    null,
  );

  const handleRowClick = (staff: GetStaffResponse) => {
    setSelectedStaff(staff);
    setIsStaffDetailVisible(true);
  };
  const fetchProjectDetail = async () => {
    try {
      setDetailLoading(true);
      const response = await projectService.getProjectDetails(record.id);
      if (response.is_success && response.data) {
        setProjectDetail(response.data);
        setLoadedDetails((prev: { [key: string]: Project }) => ({
          ...prev,
          [record.id]: response.data,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
  }, [record.id, refreshTrigger]);

  return (
    <>
      <Table
        loading={detailLoading}
        columns={columns}
        dataSource={projectDetail?.projectStaffs || []}
        pagination={false}
        rowKey={(record) => `${record.id}`}
        onRow={(record: ProjectStaff) => ({
          onClick: () => {
            handleRowClick(record.staff);
          },
        })}
      />
      <StaffDetailsModal
        isVisible={isStaffDetailVisible}
        onClose={() => setIsStaffDetailVisible(false)}
        staff={selectedStaff}
        roleColors={SYSTEM_ROLE_COLOR}
        departmentColors={DEPARTMENT_COLOR}
      />
    </>
  );
};

const ProjectList: React.FC = () => {
  const { t } = useTranslation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewMode, setViewMode] = useState<ModalState["view"]>("list");
  const [loadedDetails, setLoadedDetails] = useState<{
    [key: string]: Project;
  }>({});
  const [isAssignModalVisible, setIsAssignModalVisible] =
    useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] =
    useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDeleteProjectModalVisible, setIsDeleteProjectModalVisible] =
    useState<boolean>(false);
  const [isDeleteStaffModalVisible, setIsDeleteStaffModalVisible] =
    useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] =
    useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    id: "",
    name: "",
    description: "",
    status: "",
    startDate: "",
    endDate: "",
    budget: 0,
    projectManager: {
      id: "",
      name: "",
      email: "",
      systemRole: "",
      department: "",
    },
    businessUnitLeader: {
      id: "",
      name: "",
      email: "",
      systemRole: "",
      department: "",
    },
  });
  const [removeStaffForm, setRemoveStaffForm] = useState<RemoveStaffForm>();
  const [assignStaffForm, setAssignStaffForm] = useState<AssignStaffForm>({
    staffId: "",
    projectRole: "",
  });

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [staffsList, setStaffsList] = useState<GetStaffResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterForm, setFilterForm] = useState({
    name: "",
    description: "",
    status: "",
    startDateFrom: "",
    startDateTo: "",
    endDateFrom: "",
    endDateTo: "",
    projectManagerId: "",
    businessUnitLeaderId: "",
    budgetFrom: 1000000,
    budgetTo: 9999999,
  });

  useEffect(() => {
    fetchProjects(1, pagination.pageSize);
    fetchStaffs();
  }, []);

  // Data fetchers

  const fetchProjects = async (
    page: number = pagination.current,
    pageSize: number = pagination.pageSize,
  ) => {
    try {
      setLoading(true);
      const response = await projectService.getProjectsPaging(page, pageSize);

      if (response.is_success && response.data) {
        setProjectList(response.data || []);
        setPagination({
          ...pagination,
          current: page,
          pageSize: pageSize,
          total: response.data || 0,
        });
      }
    } catch (error) {
      message.error(t("project_list.error.fetch_projects"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      const response = await staffService.getStaffList();
      if (response.is_success) {
        setStaffsList(response.data || []);
      } else {
        message.error(response.message);
        setStaffsList([]);
      }
    } catch (error) {
      message.error(t("project_list.error.fetch_staffs"));
      console.error(error);
      setStaffsList([]);
    }
  };

  // PROJECT HANDLERS

  const handleFilter = async () => {
    try {
      setLoading(true);
      const response = await projectService.filterProjects({
        name: filterForm.name || undefined,
        description: filterForm.description || undefined,
        status: filterForm.status || undefined,
        startDateFrom: filterForm.startDateFrom || undefined,
        startDateTo: filterForm.startDateTo || undefined,
        endDateFrom: filterForm.endDateFrom || undefined,
        endDateTo: filterForm.endDateTo || undefined,
        budgetFrom: filterForm.budgetFrom || undefined,
        budgetTo: filterForm.budgetTo || undefined,
        projectManagerId: filterForm.projectManagerId || undefined,
        businessUnitLeaderId: filterForm.businessUnitLeaderId || undefined,
      });

      if (response.is_success) {
        setProjectList(response.data || []);
        setIsFilterModalVisible(false);
      } else {
        message.error(response.reason);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("project_list.error.filter_projects");
      setIsFilterModalVisible(false);
      setProjectList([]);
      message.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === "budget") {
      // Remove existing commas first
      const numericValue = value.replace(/,/g, "");
      // Only proceed if it's a valid number or empty
      if (numericValue === "" || /^\d+$/.test(numericValue)) {
        // Format with commas
        const formattedValue = Number(numericValue).toLocaleString();
        setFormData({ ...formData, [name]: formattedValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async (): Promise<void> => {
    try {
      const processedData = {
        name: formData.name,
        description: formData.description,
        status: formData.status || PROJECT_STATUS.DRAFT,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: Number(String(formData.budget).replace(/,/g, "")),
        projectManagerId: formData.projectManager.id,
        businessUnitLeaderId: formData.businessUnitLeader.id,
      };

      let response;
      if (viewMode === "update") {
        response = await projectService.updateProject(
          formData.id,
          processedData,
        );
      } else {
        const { id, ...createData } = processedData;
        console.log("Create Data: ", createData);
        response = await projectService.createProject(createData);
      }

      if (response.is_success) {
        setLoadedDetails({});
        await fetchProjects();
        setIsModalVisible(false);
        setIsSuccessModalVisible(true);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      message.error(
        error instanceof Error
          ? error.message
          : viewMode === "update"
            ? t("project_list.error.update_project")
            : t("project_list.error.create_project"),
      );
      console.error(error);
    }
  };

  const handleEdit = (record: Project): void => {
    setFormData({
      ...record,
      budget: Number(String(record.budget).replace(/,/g, "")),
    });
    setViewMode("update");
    setIsModalVisible(true);
  };

  const handleAdd = (): void => {
    setFormData({
      id: "",
      name: "",
      description: "",
      status: "",
      startDate: dayjs().format("YYYY-MM-DD"),
      endDate: "",
      budget: 1000000,
      projectManager: {
        id: "",
        name: "",
        email: "",
        systemRole: "",
        department: "",
      },
      businessUnitLeader: {
        id: "",
        name: "",
        email: "",
        systemRole: "",
        department: "",
      },
    });
    setViewMode("add");
    setIsModalVisible(true);
  };

  const handleView = (record: Project): void => {
    setSelectedProject(record);
    setFormData(record);
    setViewMode("view");
    setIsModalVisible(true);
  };

  const handleDelete = async (): Promise<void> => {
    try {
      if (projectToDelete) {
        const response = await projectService.deleteProject(projectToDelete);

        if (response.is_success) {
          await fetchProjects(); // Refresh the project list
          setIsDeleteProjectModalVisible(false);
          fetchProjectDetail();
          message.success(t("project_list.success.delete_project"));
        } else {
          message.error(response.message);
        }
      }
    } catch (error: unknown) {
      message.error(
        error instanceof Error
          ? error.message
          : t("project_list.error.delete_project"),
      );
      console.error(error);
    }
  };

  const handleDeleteClick = (record: Project): void => {
    setProjectToDelete(record.id);
    setIsDeleteProjectModalVisible(true);
  };

  // PROJECT STAFF HANDLERS

  const handleAssignStaff = async (): Promise<void> => {
    try {
      if (!selectedProject) return;

      let response;

      switch (viewMode) {
        case "assign":
          response = await projectService.AssignStaffToProject(
            selectedProject.id,
            {
              staffId: assignStaffForm.staffId,
              projectRole: assignStaffForm.projectRole,
            },
          );
          break;

        case "editStaff":
          response = await projectService.UpdateStaffInProject(
            selectedProject.id,
            {
              staffId: assignStaffForm.staffId,
              projectRole: assignStaffForm.projectRole,
            },
          );
          break;

        default:
          return;
      }

      if (response.is_success) {
        setLoadedDetails((prev) => {
          const { [selectedProject.id]: _, ...rest } = prev;
          return rest;
        });
        await fetchProjects();
        await fetchStaffs();
        setIsAssignModalVisible(false);
        setRefreshTrigger((prev) => prev + 1);
        message.success(
          viewMode === "assign"
            ? t("project_list.success.assign_staff")
            : t("project_list.success.update_staff"),
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      message.error(
        error instanceof Error
          ? error.message
          : viewMode === "assign"
            ? t("project_list.error.assign_staff")
            : t("project_list.error.update_staff"),
      );
      console.error(error);
    }
  };

  const handleAssign = (record: Project): void => {
    setSelectedProject(record);
    setAssignStaffForm({
      staffId: "",
      projectRole: "",
    });
    setViewMode("assign");
    setIsAssignModalVisible(true);
  };

  const handleEditStaff = (record: ProjectStaff): void => {
    const parentProject = Object.values(loadedDetails).find((project) =>
      project.projectStaffs?.some(
        (pstaff) => pstaff.staff.id === record.staff.id,
      ),
    );

    if (parentProject) {
      setSelectedProject(parentProject);
      setAssignStaffForm({
        staffId: record.staff.id,
        projectRole: record.projectRole,
      });
      setViewMode("editStaff");
      setIsAssignModalVisible(true);
    } else {
      message.error(t("project_list.error.parent_project"));
    }
  };

  const handleRemove = async (): Promise<void> => {
    try {
      if (!selectedProject || !removeStaffForm?.staffId) return;

      const response = await projectService.RemoveStaffFromProject(
        selectedProject.id,
        removeStaffForm.staffId,
      );

      if (response.is_success) {
        setLoadedDetails((prev) => {
          const { [selectedProject.id]: _, ...rest } = prev;
          return rest;
        });
        await fetchProjects();
        await fetchStaffs();
        setIsDeleteStaffModalVisible(false);
        setRefreshTrigger((prev) => prev + 1);
        message.success(t("project_list.success.remove_staff"));
      } else {
        throw new Error(response.message);
      }
    } catch (error: unknown) {
      message.error(
        error instanceof Error
          ? error.message
          : t("project_list.error.remove_staff"),
      );
      console.error(error);
    }
  };

  const handleRemoveStaff = (record: ProjectStaff): void => {
    const parentProject = Object.values(loadedDetails).find((project) =>
      project.projectStaffs?.some(
        (pstaff) => pstaff.staff.id === record.staff.id,
      ),
    );

    if (parentProject) {
      setSelectedProject(parentProject);
      setAssignStaffForm({
        staffId: record.staff.id,
        projectRole: record.projectRole,
      });
      setRemoveStaffForm({
        projectId: parentProject.id,
        staffId: record.staff.id,
      });

      setViewMode("deleteStaff");
      setIsDeleteStaffModalVisible(true);
    } else {
      message.error(t("project_list.error.parent_project"));
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: t("project_list.project_name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("project_list.description"),
      dataIndex: "description",
      key: "description",
    },
    {
      title: t("project_list.status"),
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status as keyof typeof STATUS_COLOR]}>
          {status}
        </Tag>
      ),
    },
    {
      title: t("project_list.start_date"),
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
    },
    {
      title: t("project_list.end_date"),
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => a.endDate.localeCompare(b.endDate),
    },
    {
      title: t("project_list.budget"),
      dataIndex: "budget",
      key: "budget",
      render: (budget: number) => `$${Number(budget).toLocaleString("en-US")}`,
      sorter: (a, b) => a.budget - b.budget,
    },
    {
      title: t("project_list.project_manager"),
      dataIndex: "projectManager",
      key: "projectManager",
      render: (projectManager: Staff) => projectManager.name,
      filters: staffsList
        .filter((staff) => staff.department === "ProjectManagement")
        .map((staff) => ({
          text: staff.name,
          value: staff.id,
        })),
      onFilter: (value: string, record: Project) =>
        record.projectManager.id === value,
      sorter: (a, b) =>
        a.projectManager.name.localeCompare(b.projectManager.name),
    },
    {
      title: t("project_list.business_unit_leader"),
      dataIndex: "businessUnitLeader",
      key: "businessUnitLeader",
      render: (businessUnitLeader: Staff) => businessUnitLeader.name,
      filters: staffsList
        .filter((staff) => staff.department === "BusinessUnitLeader")
        .map((staff) => ({
          text: staff.name,
          value: staff.id,
        })),
      onFilter: (value: string, record: Project) =>
        record.businessUnitLeader.id === value,
      sorter: (a, b) =>
        a.businessUnitLeader.name.localeCompare(b.businessUnitLeader.name),
    },
    {
      title: t("project_list.action"),
      key: "action",
      render: (_: unknown, record: Project) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditFilled />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          ></Button>
          <Button
            type="link"
            danger
            icon={<DeleteFilled />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(record);
            }}
          ></Button>
          <Button
            type="link"
            icon={<PlusCircleFilled />}
            onClick={(e) => {
              e.stopPropagation();
              handleAssign(record);
            }}
          >
            {t("project_list.assign_staff")}
          </Button>
        </Space>
      ),
    },
  ];

  const assignStaffColumns: ColumnsType<ProjectStaff> = [
    {
      title: t("project_list.staff_name"),
      dataIndex: ["staff", "name"],
      key: "staffname",
    },
    {
      title: t("project_list.email"),
      dataIndex: ["staff", "email"],
      key: "email",
    },
    {
      title: t("project_list.department"),
      dataIndex: ["staff", "department"],
      key: "department",
      render: (department: Department) => (
        <Tag color={`${DEPARTMENT_COLOR[department].text}`}>
          {addSpaceBeforeCapitalLetters(department)}
        </Tag>
      ),
    },
    {
      title: t("project_list.project_role"),
      dataIndex: "projectRole",
      key: "projectRole",
      render: (projectRole: string) => (
        <Tag
          color={
            PROJECT_ROLE_COLOR[projectRole as keyof typeof PROJECT_ROLE_COLOR]
          }
        >
          {addSpaceBeforeCapitalLetters(projectRole)}
        </Tag>
      ),
    },
    {
      title: t("project_list.system_role"),
      dataIndex: ["staff", "systemRole"],
      key: "systemRole",
      render: (systemRole: SystemRole) => (
        <Tag color={`${SYSTEM_ROLE_COLOR[systemRole].text}`}>{systemRole}</Tag>
      ),
    },
    {
      title: t("project_list.action"),
      dataIndex: "action",
      key: "action",
      render: (_: unknown, record: ProjectStaff) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditFilled />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditStaff(record);
            }}
          ></Button>
          <Button
            type="link"
            danger
            icon={<DeleteFilled />}
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveStaff(record);
            }}
          ></Button>
        </Space>
      ),
    },
  ];

  const expandedRowRender = (record: Project) => (
    <ExpandedRow
      record={record}
      columns={assignStaffColumns}
      loadedDetails={loadedDetails}
      setLoadedDetails={setLoadedDetails}
      refreshTrigger={refreshTrigger}
    />
  );

  return (
    <div className="h-full p-4 bg-gray-100 dark:bg-[#121212] min-h-screen">
      <div className="">
        <h2 className="flex justify-center text-[30px] font-['Poppins'] font-semibold mb-[50px] text-gray-800 dark:text-gray-200">
          {t("project_list.title")}
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder={t("project_list.search_placeholder")}
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            className="border border-gray-300 dark:bg-gray-700 dark:text-gray-200"
          />
          <Button
            type="primary"
            icon={<FilterFilled />}
            onClick={() => setIsFilterModalVisible(true)}
          />
          <Button
            type="primary"
            icon={<DeleteFilled />}
            onClick={() => {
              Modal.confirm({
                title: t("project_list.confirm_refresh_title"),
                content: t("project_list.confirm_refresh_content"),
                okText: t("common.yes"),
                cancelText: t("common.no"),
                onOk: () => {
                  window.location.reload();
                },
              });
            }}
            danger
          />
          <Button
            className="bg-blue-500 text-white text-sm p-2 rounded flex items-center gap-1 border-none cursor-pointer hover:bg-blue-700"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            {t("project_list.add_project")}
          </Button>
        </div>
      </div>

      <Table
        loading={loading}
        columns={columns}
        expandable={{
          expandedRowRender,
          onExpand: (expanded, record) => {
            if (expanded) {
              setLoadedDetails((prev) => {
                const { [record.id]: _, ...rest } = prev;
                return rest;
              });
              if (record.projectStaffs?.length === 0) {
                message.error(t("project_list.error.no_staff_assigned"));
              }
            }
          },
        }}
        dataSource={projectList.filter(
          (project) =>
            project.name.toLowerCase().includes(searchText.toLowerCase()) ||
            project.description
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            project.projectManager.name
              .toLowerCase()
              .includes(searchText.toLowerCase()),
        )}
        rowKey="id"
        onRow={(record: Project) => ({
          onClick: () => handleView(record),
        })}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            fetchProjects(page, pageSize);
          },
          showSizeChanger: true,
          showTotal: (total) => `${t("common.total_items", { total })}`,
        }}
        className="bg-white dark:bg-[#121212] rounded-lg shadow-md"
      />

      {/* FILTER PROJECTS MODAL */}

      <Modal
        title={t("project_list.filter_projects")}
        open={isFilterModalVisible}
        onOk={handleFilter}
        onCancel={() => setIsFilterModalVisible(false)}
        footer={[
          <Button
            key="reset"
            onClick={() => {
              setFilterForm({
                name: "",
                description: "",
                status: "",
                startDateFrom: "",
                startDateTo: "",
                endDateFrom: "",
                endDateTo: "",
                projectManagerId: "",
                businessUnitLeaderId: "",
                budgetFrom: 1000000,
                budgetTo: 9999999,
              });
            }}
            danger
          >
            {t("common.reset_filters")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleFilter}>
            {t("common.apply_filters")}
          </Button>,
        ]}
        width={800}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t("project_list.name")}>
                <Input
                  value={filterForm.name}
                  onChange={(e) =>
                    setFilterForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("project_list.description")}>
                <Input
                  value={filterForm.description}
                  onChange={(e) =>
                    setFilterForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="dark:bg-gray-700 dark:text-gray-200"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={t("project_list.status")}>
                <Select
                  value={filterForm.status}
                  onChange={(value) =>
                    setFilterForm((prev) => ({ ...prev, status: value }))
                  }
                  placeholder={t("project_list.select_status")}
                  allowClear
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  {Object.values(PROJECT_STATUS).map((status) => (
                    <Select.Option key={status} value={status}>
                      {status}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t("project_list.start_date_range")}>
                <RangePicker
                  value={[
                    filterForm.startDateFrom
                      ? dayjs(filterForm.startDateFrom)
                      : null,
                    filterForm.startDateTo
                      ? dayjs(filterForm.startDateTo)
                      : null,
                  ]}
                  onChange={(dates) => {
                    if (dates) {
                      setFilterForm((prev) => ({
                        ...prev,
                        startDateFrom: dates?.[0]
                          ? dates[0].format("YYYY-MM-DD")
                          : "",
                        startDateTo: dates?.[1]
                          ? dates[1].format("YYYY-MM-DD")
                          : "",
                      }));
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("project_list.end_date_range")}>
                <RangePicker
                  value={[
                    filterForm.endDateFrom
                      ? dayjs(filterForm.endDateFrom)
                      : null,
                    filterForm.endDateTo ? dayjs(filterForm.endDateTo) : null,
                  ]}
                  onChange={(dates) => {
                    if (dates) {
                      setFilterForm((prev) => ({
                        ...prev,
                        endDateFrom: dates?.[0]
                          ? dates[0].format("YYYY-MM-DD")
                          : "",
                        endDateTo: dates?.[1]
                          ? dates[1].format("YYYY-MM-DD")
                          : "",
                      }));
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t("project_list.budget_range")}>
            <Slider
              range
              min={1000000}
              max={9999999}
              step={100}
              value={[filterForm.budgetFrom, filterForm.budgetTo]}
              onChange={(values: [number, number]) =>
                setFilterForm((prev) => ({
                  ...prev,
                  budgetFrom: values[0],
                  budgetTo: values[1],
                }))
              }
              tooltip={{
                formatter: (value) => `${value.toLocaleString()} VND`,
              }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t("project_list.project_manager")}>
                <Select
                  value={filterForm.projectManagerId}
                  onChange={(value) =>
                    setFilterForm((prev) => ({
                      ...prev,
                      projectManagerId: value,
                    }))
                  }
                  placeholder={t("project_list.select_project_manager")}
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  {staffsList
                    .filter((staff) => staff.department === "ProjectManagement")
                    .map((staff) => (
                      <Select.Option key={staff.id} value={staff.id}>
                        {staff.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t("project_list.business_unit_leader")}>
                <Select
                  value={filterForm.businessUnitLeaderId}
                  onChange={(value) =>
                    setFilterForm((prev) => ({
                      ...prev,
                      businessUnitLeaderId: value,
                    }))
                  }
                  placeholder={t("project_list.select_business_unit_leader")}
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  {staffsList
                    .filter(
                      (staff) => staff.department === "BusinessUnitLeader",
                    )
                    .map((staff) => (
                      <Select.Option key={staff.id} value={staff.id}>
                        {staff.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ADD & EDIT PROJECT MODAL */}

      <Modal
        title={
          viewMode === "update"
            ? t("project_list.edit_project")
            : viewMode === "add"
              ? t("project_list.add_project")
              : t("project_list.view_project")
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            {t("common.cancel")}
          </Button>,
          viewMode !== "view" && (
            <Button key="submit" type="primary" onClick={handleSave}>
              {viewMode === "update" ? t("common.update") : t("common.add")}
            </Button>
          ),
        ]}
      >
        <form>
          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.project_id")}:
            </label>
            <Input
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder={t("project_list.auto_generated_id")}
              disabled={true}
              readOnly
              className="dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">{t("project_list.name")}:</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("project_list.enter_project_name")}
              disabled={viewMode === "view"}
              className="dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.description")}:
            </label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("project_list.enter_project_description")}
              disabled={viewMode === "view"}
              className="dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">{t("project_list.status")}:</label>
            <Select
              name="status"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
              placeholder={t("project_list.select_project_status")}
              disabled={viewMode === "view"}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              {Object.values(PROJECT_STATUS).map((status) => (
                <Select.Option key={status} value={status}>
                  {status}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.start_date")}:
            </label>
            <DatePicker
              name="startDate"
              value={formData.startDate ? dayjs(formData.startDate) : null}
              onChange={(date) => {
                setFormData({
                  ...formData,
                  startDate: date ? date.format("YYYY-MM-DD") : "",
                });
              }}
              placeholder={t("project_list.select_start_date")}
              disabled={viewMode === "view"}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">{t("project_list.end_date")}:</label>
            <DatePicker
              name="endDate"
              value={formData.endDate ? dayjs(formData.endDate) : null}
              onChange={(date) => {
                setFormData({
                  ...formData,
                  endDate: date ? date.format("YYYY-MM-DD") : "",
                });
              }}
              placeholder={t("project_list.select_end_date")}
              disabled={viewMode === "view"}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">{t("project_list.budget")}:</label>
            <InputNumber
              name="budget"
              value={formData.budget}
              onChange={(value) =>
                setFormData({ ...formData, budget: value || 0 })
              }
              placeholder={t("project_list.enter_budget")}
              disabled={viewMode === "view"}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              min={0}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.project_manager")}:
            </label>
            <Select
              name="projectManagerId"
              value={formData.projectManager.id}
              onChange={(value) => {
                const selectedStaff = staffsList.find(
                  (staff) => staff.id === value,
                );
                if (selectedStaff) {
                  setFormData({
                    ...formData,
                    projectManager: selectedStaff,
                  });
                }
              }}
              placeholder={t("project_list.select_project_manager")}
              disabled={viewMode === "view"}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              {staffsList
                .filter((staff) => staff.department === "ProjectManagement")
                .map((staff) => (
                  <Select.Option key={staff.id} value={staff.id}>
                    {staff.name}
                  </Select.Option>
                ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.business_unit_leader")}:
            </label>
            <Select
              name="businessUnitLeaderId"
              value={formData.businessUnitLeader.id}
              onChange={(value) => {
                const selectedStaff = staffsList.find(
                  (staff) => staff.id === value,
                );
                if (selectedStaff) {
                  setFormData({
                    ...formData,
                    businessUnitLeader: selectedStaff,
                  });
                }
              }}
              placeholder={t("project_list.select_business_unit_leader")}
              disabled={viewMode === "view"}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              {staffsList
                .filter((staff) => staff.department === "BusinessUnitLeader")
                .map((staff) => (
                  <Select.Option key={staff.id} value={staff.id}>
                    {staff.name}
                  </Select.Option>
                ))}
            </Select>
          </div>
        </form>
      </Modal>

      {/* ASSIGN STAFF TO PROJECT FORM */}

      <Modal
        title={
          viewMode === "editStaff"
            ? t("project_list.edit_staff")
            : t("project_list.assign_staff")
        }
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsAssignModalVisible(false)}>
            {t("common.cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={handleAssignStaff}>
            {viewMode === "editStaff" ? t("common.update") : t("common.add")}
          </Button>,
        ]}
      >
        <form>
          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.staff_name")}:
            </label>
            <Select
              value={assignStaffForm.staffId}
              onChange={(value) =>
                setAssignStaffForm({ ...assignStaffForm, staffId: value })
              }
              placeholder={t("project_list.select_staff")}
              style={{ width: "100%" }}
              disabled={viewMode === "editStaff"}
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              {staffsList
                .filter((staff) => staff.department == Department.Engineering)
                .map((staff) => (
                  <Select.Option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.department})
                  </Select.Option>
                ))}
            </Select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              {t("project_list.project_role")}:
            </label>
            <Select
              value={assignStaffForm.projectRole}
              onChange={(value) =>
                setAssignStaffForm({ ...assignStaffForm, projectRole: value })
              }
              placeholder={t("project_list.select_role")}
              style={{ width: "100%" }}
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              <Select.Option value="Developer">
                {t("project_list.role.developer")}
              </Select.Option>
              <Select.Option value="Tester">
                {t("project_list.role.tester")}
              </Select.Option>
              <Select.Option value="Engineering">
                {t("project_list.role.engineering")}
              </Select.Option>
              <Select.Option value="BusinessAnalyst">
                {t("project_list.role.business_analyst")}
              </Select.Option>
              <Select.Option value="QualityAssurance">
                {t("project_list.role.quality_assurance")}
              </Select.Option>
            </Select>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETION */}

      <Modal
        title={t("project_list.confirm_delete")}
        open={isDeleteProjectModalVisible}
        onCancel={() => setIsDeleteProjectModalVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setIsDeleteProjectModalVisible(false)}
          >
            {t("common.cancel")}
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDelete}>
            {t("common.delete")}
          </Button>,
        ]}
      >
        <p>{t("project_list.confirm_delete_message")}</p>
      </Modal>

      {/* CONFIRM STAFF DELETION */}

      <Modal
        title={t("project_list.confirm_delete_staff")}
        open={isDeleteStaffModalVisible}
        onCancel={() => setIsDeleteStaffModalVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setIsDeleteStaffModalVisible(false)}
          >
            {t("common.cancel")}
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleRemove}>
            {t("common.delete")}
          </Button>,
        ]}
      >
        <p>{t("project_list.confirm_delete_staff_message")}</p>
      </Modal>

      {/* SUCCESS MODAL */}

      <Modal
        title={t("common.success")}
        open={isSuccessModalVisible}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={() => setIsSuccessModalVisible(false)}
          >
            {t("common.ok")}
          </Button>,
        ]}
      >
        <p>
          {viewMode === "update"
            ? t("project_list.update_success")
            : t("project_list.add_success")}
        </p>
      </Modal>
    </div>
  );
};

export default ProjectList;
