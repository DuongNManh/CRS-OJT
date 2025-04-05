// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useApi } from "@/hooks/useApi";
import { SystemRole } from "@/interfaces/auth.interface";
import {
  DEPARTMENT_COLOR,
  SYSTEM_ROLE_COLOR,
} from "@/interfaces/project.interface";
import { Department, GetStaffResponse } from "@/interfaces/staff.interface";
import { staffService } from "@/services/features/staff.service";
import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  TableOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Modal,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useState } from "react";
import { StaffTiles } from "./StaffTiles";
import AdminLayout from "@/layouts/AdminLayout";
import { useTranslation } from "react-i18next";
import { addSpaceBeforeCapitalLetters } from "@/utils/stringFormatter";
import StaffDetailsModal from "./StaffDetailModal";

// Define interfaces for type safety
interface StaffMember extends GetStaffResponse {
  key: string;
}

interface FormData {
  name: string;
  email: string;
  role: string;
  department: string;
  salary: string;
  password: string;
}

// Add department constants
const DEPARTMENTS = {
  PROJECT_MANAGEMENT: "ProjectManagement",
  BUSINESS_LEADER: "BusinessUnitLeader",
  ENGINEER: "Engineering",
  FINANCE: "Finance",
  ADMINISTRATION: "Administration",
};

const StaffList: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<"table" | "tile">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] =
    useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<GetStaffResponse | null>(
    null,
  );
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    department: "",
    salary: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { withLoading } = useApi();
  const [searchText, setSearchText] = useState<string>("");
  const [filteredStaffList, setFilteredStaffList] = useState<StaffMember[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  const fetchStaffList = async (
    page: number = pagination.current,
    pageSize: number = pagination.pageSize,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await withLoading(
        staffService.getStaffListPaging(
          page,
          pageSize,
          selectedRole,
          selectedDepartment,
        ),
      );

      const staffWithKeys = response.items.map((staff) => ({
        ...staff,
        key: staff.id,
      }));

      setStaffList(staffWithKeys);
      setPagination({
        ...pagination,
        current: response.meta.current_page,
        total: response.meta.total_items,
        pageSize: response.meta.page_size,
      });
    } catch (error) {
      const errorMessage = (error as any).message || "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList(1, pagination.pageSize);
  }, [selectedRole, selectedDepartment]);

  useEffect(() => {
    setFilteredStaffList(staffList);
  }, [staffList]);

  const handleViewModeChange = (e: RadioChangeEvent) => {
    setViewMode(e.target.value);
    setCurrentPage({
      ...pagination,
      current: 1,
      pageSize: viewMode === "tile" ? 10 : 12,
    });
    fetchStaffList(1, viewMode === "tile" ? 10 : 12);
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    const size = newPageSize || pagination.pageSize;
    setPagination({ ...pagination, current: page, pageSize: size });
    fetchStaffList(page, size);
  };

  const columns: ColumnsType<StaffMember> = [
    {
      title: t("staff_list.avatar"),
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      render: (avatarUrl: string) =>
        avatarUrl ? (
          <img
            src={avatarUrl}
            alt={t("staff_list.avatar_alt")}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            <Avatar size={40} icon={<UserOutlined />} />
          </div>
        ),
    },
    { title: t("staff_list.name"), dataIndex: "name", key: "name" },
    { title: t("staff_list.email"), dataIndex: "email", key: "email" },
    {
      title: t("staff_list.role"),
      dataIndex: "systemRole",
      key: "systemRole",
      render: (systemRole: SystemRole) => (
        <Tag color={SYSTEM_ROLE_COLOR[systemRole].text}>{systemRole}</Tag>
      ),
    },
    {
      title: t("staff_list.department"),
      dataIndex: "department",
      key: "department",
      render: (department: string) => (
        <Tag
          color={
            DEPARTMENT_COLOR[department as keyof typeof DEPARTMENT_COLOR].text
          }
        >
          {addSpaceBeforeCapitalLetters(department)}
        </Tag>
      ),
    },
    {
      title: t("staff_list.salary"),
      dataIndex: "salary",
      key: "salary",
      render: (salary: string) => "$" + Number(salary).toLocaleString("en-US"),
    },
    {
      title: t("staff_list.action"),
      key: "action",
      render: (_: unknown, record: StaffMember) => (
        <Space className="flex gap-[10px]">
          <Button
            type="default"
            icon={<EditOutlined />}
            className="edit-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleUpdate(record);
            }}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="delete-btn"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              showDeleteConfirm(
                record,
                setSelectedStaff,
                setIsDeleteModalVisible,
                setError,
              );
            }}
          />
        </Space>
      ),
    },
  ];

  const handleRowClick = (record: StaffMember): void => {
    setSelectedStaff(record);
    setIsDetailVisible(true);
  };

  const handleAdd = (): void => {
    setIsEditing(false);
    setIsModalOpen(true);
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      salary: "",
      password: "",
    });
  };

  const handleUpdate = (staff: StaffMember): void => {
    setSelectedStaff(staff);
    setIsEditing(true);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.systemRole,
      department: staff.department,
      salary: staff.salary.toLocaleString("en-US"),
      password: "",
    });
    setIsModalOpen(true);
    setIsDetailVisible(false);
  };

  const handleCancel = (): void => {
    setIsModalOpen(false);
    setIsDetailVisible(false);
    setIsDeleteModalVisible(false);
    setIsSuccessModalVisible(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === "salary") {
      const rawValue = value.replace(/[^0-9]/g, "");
      const formattedValue = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setFormData({ ...formData, salary: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Add validation function
  const validateRoleAndDepartment = (
    role: SystemRole,
    department: Department,
  ): string | null => {
    switch (role) {
      case SystemRole.FINANCE:
        if (department !== DEPARTMENTS.FINANCE) {
          return t("staff_list.toast.role_department.finance");
        }
        break;
      case SystemRole.APPROVER:
        if (
          department !== DEPARTMENTS.PROJECT_MANAGEMENT &&
          department !== DEPARTMENTS.BUSINESS_LEADER
        ) {
          return t("staff_list.toast.role_department.approver");
        }
        break;
      case SystemRole.STAFF:
        if (department !== DEPARTMENTS.ENGINEER) {
          return t("staff_list.toast.role_department.staff");
        }
        break;
      case SystemRole.ADMIN:
        if (department !== DEPARTMENTS.ADMINISTRATION) {
          return t("staff_list.toast.role_department.admin");
        }
        break;
    }
    return null;
  };

  const handleSave = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validate form data
      if (
        !formData.name ||
        !formData.email ||
        !formData.role ||
        !formData.department ||
        !formData.salary ||
        (!isEditing && !formData.password)
      ) {
        setError(t("staff_list.toast.fill_required"));
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^@\s]+@(gmail\.com|fpt\.edu\.vn)+$/;
      if (!emailRegex.test(formData.email)) {
        setError(t("staff_list.toast.invalid_email"));
        setLoading(false);
        return;
      }

      // Check if email exists
      if (!isEditing) {
        try {
          const emailExists = await staffService.checkEmailExists(
            formData.email,
          );
          if (emailExists) {
            setError(t("staff_list.toast.email_exists"));
            setLoading(false);
            return;
          }
        } catch (error) {
          setError(t("staff_list.toast.email_verify_failed"));
          setLoading(false);
          return;
        }
      }

      // Salary validation
      const cleanedSalary = formData.salary.replace(/,/g, "");
      if (isNaN(Number(cleanedSalary))) {
        setError(t("staff_list.toast.invalid_salary"));
        setLoading(false);
        return;
      }

      // Role-department validation
      const validationError = validateRoleAndDepartment(
        formData.role as SystemRole,
        formData.department as Department,
      );
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      if (isEditing && selectedStaff) {
        // Update existing staff
        const staffData = {
          name: formData.name,
          email: formData.email,
          systemRole: formData.role as SystemRole,
          department: formData.department as Department,
          salary: Number(cleanedSalary),
        };
        console.log("Staff data:", staffData);
        const response = await withLoading(
          staffService.updateStaff(selectedStaff.id, staffData),
        );
        if (response.data) {
          message.success(t("staff_list.toast.update_success"));
          setIsModalOpen(false);
          await fetchStaffList(currentPage);
        }
      } else {
        // Create new staff
        const createStaffRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          systemRole: formData.role as SystemRole,
          department: formData.department as Department,
          salary: Number(cleanedSalary),
        };
        const response = await withLoading(
          staffService.createStaff(createStaffRequest),
        );
        if (response.data) {
          message.success(t("staff_list.toast.create_success"));
          setIsModalOpen(false);
          await fetchStaffList(currentPage);
        }
      }
    } catch (error: any) {
      setError(t("staff_list.toast.save_error"));
      message.error(t("staff_list.toast.save_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffService.deleteStaff(staffId);
      if (response.is_success) {
        message.success(t("staff_list.toast.delete_success"));
        setIsDeleteModalVisible(false);
        await fetchStaffList(currentPage);
      }
    } catch (err: any) {
      message.error(t("staff_list.toast.delete_error"));
      setError(t("staff_list.toast.delete_error"));
    } finally {
      setLoading(false);
    }
  };

  // Add confirmation modal for delete action
  const showDeleteConfirm = (
    staff: GetStaffResponse,
    setSelectedStaff: React.Dispatch<
      React.SetStateAction<GetStaffResponse | null>
    >,
    setIsDeleteModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    setSelectedStaff(staff);
    setIsDeleteModalVisible(true);
    setError(null);
  };

  // Update the DeleteConfirmationModal component
  const DeleteConfirmationModal: React.FC<{
    isDeleteModalVisible: boolean;
    selectedStaff: GetStaffResponse | null;
    loading: boolean;
    error: string | null;
    onDelete: (staffId: string) => Promise<void>;
    onCancel: () => void;
  }> = ({
    isDeleteModalVisible,
    selectedStaff,
    loading,
    error,
    onDelete,
    onCancel,
  }) => {
    return (
      <Modal
        title="Delete Staff"
        open={isDeleteModalVisible}
        onOk={() => selectedStaff && onDelete(selectedStaff.id)}
        onCancel={onCancel}
        confirmLoading={loading}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          className: "bg-red-500 hover:bg-red-600",
        }}
      >
        <div className="py-4">
          <p className="text-base">
            Are you sure you want to delete this staff member?
          </p>
          {selectedStaff && (
            <div className="mt-2 text-gray-600">
              <p>Name: {selectedStaff.name}</p>
              <p>Email: {selectedStaff.email}</p>
            </div>
          )}
          {error && <div className="mt-2 text-red-500">{error}</div>}
        </div>
      </Modal>
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (!value.trim()) {
      setFilteredStaffList(staffList);
      return;
    }

    const filtered = staffList.filter(
      (staff) =>
        staff.name.toLowerCase().includes(value.toLowerCase()) ||
        staff.email.toLowerCase().includes(value.toLowerCase()) ||
        staff.department.toLowerCase().includes(value.toLowerCase()) ||
        staff.systemRole.toLowerCase().includes(value.toLowerCase()),
    );

    setFilteredStaffList(filtered);
  };

  // Add dynamic options filtering for department based on selected role
  const getDepartmentOptions = (role: SystemRole) => {
    switch (role) {
      case SystemRole.FINANCE:
        return [DEPARTMENTS.FINANCE];
      case SystemRole.APPROVER:
        return [DEPARTMENTS.PROJECT_MANAGEMENT, DEPARTMENTS.BUSINESS_LEADER];
      case SystemRole.STAFF:
        return [DEPARTMENTS.ENGINEER];
      case SystemRole.ADMIN:
        return [DEPARTMENTS.ADMINISTRATION];
      default:
        return Object.values(DEPARTMENTS);
    }
  };

  // Add filter handlers
  const handleRoleChange = (value: string) => {
    console.log("Selected role:", value);
    setSelectedRole(value);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen p-6 bg-gray-100 dark:bg-[#121212]">
        <h2 className="text-[30px] font-semibold text-gray-800 dark:text-gray-200 text-center">
          {t("staff_list.title")}
        </h2>
        <div className="flex flex-row items-center pt-4">
          <div className="flex flex-col justify-between items-center w-full max-w-4xl mb-4">
            <div className="flex items-center gap-2">
              <Input
                className="flex-1 p-2 border border-gray-300 dark:bg-gray-300 dark:text-gray-200 rounded"
                placeholder={t("staff_list.search_placeholder")}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearch}
              />
              <Button
                className="bg-blue-500 dark:bg-blue-700 text-white text-sm p-2 rounded flex items-center gap-1 border-none cursor-pointer hover:bg-blue-700"
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                {t("staff_list.add_staff")}
              </Button>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}
          </div>

          <div className="flex flex-row justify-between items-center w-full max-w-4xl mb-4">
            <div className="flex justify-center items-center gap-4">
              <Select
                className="w-48 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t("staff_list.filter_by_role")}
                allowClear
                onChange={handleRoleChange}
                value={selectedRole}
              >
                <Select.Option value="ADMIN">Admin</Select.Option>
                <Select.Option value="STAFF">Staff</Select.Option>
                <Select.Option value="APPROVER">Approver</Select.Option>
                <Select.Option value="FINANCE">Finance</Select.Option>
              </Select>

              <Select
                className="w-48 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t("staff_list.filter_by_department")}
                allowClear
                onChange={handleDepartmentChange}
                value={selectedDepartment}
              >
                {Object.values(DEPARTMENTS).map((dept) => (
                  <Select.Option key={dept} value={dept}>
                    {dept}
                  </Select.Option>
                ))}
              </Select>
              <Button
                icon={<DeleteOutlined />}
                className="bg-red-500 text-white text-sm p-2 rounded flex items-center gap-1 border-none cursor-pointer hover:bg-red-200"
                onClick={() => {
                  handleRoleChange("");
                  handleDepartmentChange("");
                  fetchStaffList(1, pagination.pageSize);
                }}
              />
            </div>

            <div className="ml-4">
              <Radio.Group
                options={[
                  { label: <TableOutlined />, value: "table" },
                  { label: <AppstoreOutlined />, value: "tile" },
                ]}
                value={viewMode}
                onChange={handleViewModeChange}
                optionType="button"
                buttonStyle="solid"
              />
            </div>
          </div>
        </div>

        {viewMode === "table" ? (
          <Table<StaffMember>
            className="bg-white dark:bg-[#151517] p-4 rounded-lg shadow-md dark:text-gray-300 dark:border dark:border-gray-700"
            columns={columns}
            dataSource={filteredStaffList}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePageChange,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions: ["10", "20", "50"],
              position: ["bottomCenter"],
            }}
            onRow={(record: StaffMember) => ({
              onClick: () => handleRowClick(record),
            })}
            rowClassName={(record, index) =>
              index % 2 === 0
                ? "bg-gray-300 dark:bg-[#2A2A2F]"
                : "bg-white dark:bg-[#424242]"
            }
            components={{
              header: {
                cell: (props) => (
                  <th
                    {...props}
                    className={`!bg-gray-300 dark:!bg-[#2A2A2F]
                  !text-gray-800 dark:!text-gray-200
                  ![&.ant-table-cell-sort]:bg-gray-400
                  ![&.ant-table-cell-sort]:dark:bg-gray-600
                  border-b border-gray-300 dark:border-gray-600
                  ![&.ant-table-column-has-sorters]:hover:bg-gray-400
                  ![&.ant-table-column-has-sorters]:dark:hover:bg-gray-600
                  ![&_.ant-table-column-sorter]:text-gray-800
                  ![&_.ant-table-column-sorter]:dark:text-gray-200
                  `}
                  />
                ),
              },
              body: {
                row: (props) => (
                  <tr
                    {...props}
                    className="hover:bg-gray-300 dark:hover:bg-[#3A3A3A]
                            bg-white dark:bg-[#1E1E2F]
                            text-gray-800 dark:text-gray-200"
                  />
                ),
                cell: (props) => (
                  <td
                    {...props}
                    className={`text-gray-800 dark:text-gray-200
                  ![&.ant-table-column-sort]:bg-gray-100
                  ![&.ant-table-column-sort]:dark:bg-[#2A2A2F]
                  ![&.ant-table-column-sort]:text-gray-800
                  ![&.ant-table-column-sort]:dark:text-gray-200
                  `}
                  />
                ),
              },
            }}
          />
        ) : (
          <StaffTiles
            staffList={filteredStaffList}
            loading={loading}
            onStaffClick={handleRowClick}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePageChange,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions:
                viewMode === "tile" ? ["12", "18", "24"] : ["10", "20", "50"],
              position: ["bottomCenter"],
            }}
            handleUpdate={handleUpdate}
            showDeleteConfirm={(staff) =>
              showDeleteConfirm(
                staff,
                setSelectedStaff,
                setIsDeleteModalVisible,
                setError,
              )
            }
          />
        )}

        <Modal
          title={
            isEditing
              ? t("staff_list.edit_modal_title")
              : t("staff_list.create_modal_title")
          }
          open={isModalOpen}
          onOk={handleSave}
          onCancel={handleCancel}
          confirmLoading={loading}
        >
          {error && <div className="error-message">{error}</div>}

          <div className="flex flex-col gap-4 pt-2">
            <div className="form-group">
              <label>{t("staff_list.name")}</label>
              <Input
                name={t("staff_list.name")}
                value={formData.name}
                onChange={handleChange}
                placeholder={t("staff_list.name")}
                disabled={isEditing}
              />
            </div>
            <div className="form-group">
              <label>{t("staff_list.email")}</label>
              <Input
                name={t("staff_list.email")}
                value={formData.email}
                onChange={handleChange}
                placeholder={t("staff_list.email")}
                disabled={isEditing} // Email can only be set during creation
              />
            </div>
            {!isEditing && (
              <div className="form-group">
                <label>{t("staff_list.password")}</label>
                <Input.Password
                  name={t("staff_list.password")}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t("staff_list.password")}
                />
              </div>
            )}
            <div className="form-group">
              <label>{t("staff_list.role")}</label>
              <Select
                value={formData.role}
                onChange={(value) => {
                  const role = value as SystemRole;
                  const validDepartments = getDepartmentOptions(role);
                  setFormData({
                    ...formData,
                    role: value,
                    department: validDepartments[0], // Set first valid department automatically
                  });
                }}
                style={{ width: "100%" }}
              >
                <Select.Option value={SystemRole.ADMIN}>Admin</Select.Option>
                <Select.Option value={SystemRole.APPROVER}>
                  Approver
                </Select.Option>
                <Select.Option value={SystemRole.STAFF}>Staff</Select.Option>
                <Select.Option value={SystemRole.FINANCE}>
                  Finance
                </Select.Option>
              </Select>
            </div>
            <div className="form-group">
              <label>{t("staff_list.department")}</label>
              <Select
                value={formData.department}
                onChange={(value) =>
                  setFormData({ ...formData, department: value })
                }
                style={{ width: "100%" }}
              >
                {formData.role === SystemRole.FINANCE && (
                  <Select.Option value={DEPARTMENTS.FINANCE}>
                    Finance
                  </Select.Option>
                )}
                {formData.role === SystemRole.APPROVER && (
                  <>
                    <Select.Option value={DEPARTMENTS.PROJECT_MANAGEMENT}>
                      Project Management
                    </Select.Option>
                    <Select.Option value={DEPARTMENTS.BUSINESS_LEADER}>
                      Business Leader
                    </Select.Option>
                  </>
                )}
                {formData.role === SystemRole.STAFF && (
                  <Select.Option value={DEPARTMENTS.ENGINEER}>
                    Engineer
                  </Select.Option>
                )}
                {formData.role === SystemRole.ADMIN && (
                  <Select.Option value={DEPARTMENTS.ADMINISTRATION}>
                    Administration
                  </Select.Option>
                )}
              </Select>
            </div>
            <div className="form-group">
              <label>{t("staff_list.salary")}</label>
              <Input
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder={t("staff_list.salary")}
              />
            </div>
          </div>
        </Modal>

        <StaffDetailsModal
          isVisible={isDetailVisible}
          onClose={() => setIsDetailVisible(false)}
          staff={selectedStaff}
          roleColors={SYSTEM_ROLE_COLOR}
          departmentColors={DEPARTMENT_COLOR}
        />

        <DeleteConfirmationModal
          isDeleteModalVisible={isDeleteModalVisible}
          selectedStaff={selectedStaff}
          loading={loading}
          error={error}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />

        <Modal
          title="Success"
          open={isSuccessModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="ok" type="primary" onClick={handleCancel}>
              OK
            </Button>,
          ]}
        >
          <div className="py-4">
            <p className="text-green-600">Operation completed successfully!</p>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default StaffList;
