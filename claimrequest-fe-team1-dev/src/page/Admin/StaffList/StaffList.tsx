import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, Input, Modal, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { staffService } from "@/services/features/staff.service";
import { GetStaffResponse } from "@/interfaces/staff.interface";
import { useApi } from "@/hooks/useApi";
import { SystemRole } from "@/interfaces/auth.interface";
import { PagingResponse } from '@/interfaces/apiresponse.interface';

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

// Add these constants for department options
const DEPARTMENT_OPTIONS = [
  "Engineering",          // Covers software development, QA, IT support, DevOps, UI/UX, etc. => Staff
  "ProjectManagement",    // Project managers and coordinators => Approver
  "Finance",              // Budgeting, accounting, and financial planning => Finance
  "BusinessUnitLeader",    // Business unit leaders and department heads => Approver
];

// Add department constants
const DEPARTMENTS = {
  PROJECT_MANAGEMENT: 'ProjectManagement',
  BUSINESS_LEADER: 'BusinessUnitLeader',
  ENGINEER: 'Engineering',
  FINANCE: 'Finance'
};

const StaffList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize: number = 15;
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] =
    useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
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
    total: 0
  });
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  const fetchStaffList = async (page: number = pagination.current, pageSize: number = pagination.pageSize) => {
    try {
      setLoading(true);
      setError(null);

      const response = await withLoading(
        staffService.getStaffListPaging(
          page,
          pageSize,
          selectedRole,
          selectedDepartment
        )
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
        pageSize: response.meta.page_size
      });

    } catch (error) {
      setError("Failed to fetch staff list. Please try again later.");
      console.error("Failed to fetch staff list:", error);
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

  const handlePageChange = (page: number, newPageSize?: number) => {
    const size = newPageSize || pagination.pageSize;
    setPagination({ ...pagination, current: page, pageSize: size });
    fetchStaffList(page, size);
  };

  const columns: ColumnsType<StaffMember> = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    { title: "Department", dataIndex: "department", key: "department" },
    {
      title: "Salary (VND)",
      dataIndex: "salary",
      key: "salary",
      render: (salary: string) => Number(salary).toLocaleString("en-US"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: StaffMember) => (
        <Space className="flex gap-[10px]">
          <Button
            type="text"
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
              showDeleteConfirm(record, setSelectedStaff, setIsDeleteModalVisible, setError);
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
      role: staff.role,
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
  const validateRoleAndDepartment = (role: SystemRole, department: string): string | null => {
    switch (role) {
      case SystemRole.FINANCE:
        if (department !== DEPARTMENTS.FINANCE) {
          return 'Finance role must be in Finance department';
        }
        break;
      case SystemRole.APPROVER:
        if (department !== DEPARTMENTS.PROJECT_MANAGEMENT && department !== DEPARTMENTS.BUSINESS_LEADER) {
          return 'Approver role must be in Project Management or Business Leader department';
        }
        break;
      case SystemRole.STAFF:
        if (department !== DEPARTMENTS.ENGINEER) {
          return 'Staff role must be in Engineer department';
        }
        break;
      case SystemRole.ADMIN:
        if (department !== DEPARTMENTS.PROJECT_MANAGEMENT) {
          return 'Admin role must be in Project Management department';
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
      if (!formData.name || !formData.email || !formData.role || !formData.department || !formData.salary || (!isEditing && !formData.password)) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^@\s]+@(gmail\.com|fpt\.edu\.vn)+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Check if email exists when creating new staff
      if (!isEditing) {
        try {
          const emailExists = await staffService.checkEmailExists(formData.email);
          if (emailExists) {
            setError("This email address is already in use");
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Email check error:", error);
          setError("Failed to verify email availability");
          setLoading(false);
          return;
        }
      }

      // Clean salary value (remove commas)
      const cleanedSalary = formData.salary.replace(/,/g, "");
      if (isNaN(Number(cleanedSalary))) {
        setError("Please enter a valid salary amount");
        setLoading(false);
        return;
      }

      // Add role-department validation
      const validationError = validateRoleAndDepartment(formData.role as SystemRole, formData.department);
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      if (isEditing && selectedStaff) {
        // Update existing staff - exclude email and password from update
        const staffData = {
          name: formData.name,
          email: formData.email,
          systemRole: formData.role as SystemRole,
          department: formData.department,
          salary: Number(cleanedSalary)
        };

        const response = await withLoading(staffService.updateStaff(selectedStaff.id, staffData));

        if (response.data) {
          message.success("Staff updated successfully");
          setIsModalOpen(false);
          await fetchStaffList(currentPage);
        }
      } else {
        // Create new staff - ONLY send the fields expected by the backend
        // Extract first name and last name from the full name
        // const nameParts = formData.name.trim().split(' ');
        // const firstName = nameParts[0] || '';
        // const lastName = nameParts.slice(1).join(' ') || '';

        // Create staff with ONLY the fields expected by the backend
        const createStaffRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          systemRole: formData.role,
          department: formData.department,
          salary: Number(cleanedSalary)
        };

        // Log the request to verify it matches the expected format
        console.log("Creating staff with:", createStaffRequest);

        const response = await withLoading(staffService.createStaff(createStaffRequest));

        if (response.data) {
          message.success("Staff created successfully");
          setIsModalOpen(false);
          await fetchStaffList(currentPage);
        }
      }
    } catch (error: any) {
      console.error("Save staff error:", error);
      setError(error.message || "An error occurred while saving staff");
      message.error(error.message || "An error occurred while saving staff");
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
        message.success('Staff deleted successfully');
        setIsDeleteModalVisible(false);
        await fetchStaffList(currentPage);
      }
    } catch (err: any) {
      message.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add confirmation modal for delete action
  const showDeleteConfirm = (staff: StaffMember, setSelectedStaff: React.Dispatch<React.SetStateAction<StaffMember | null>>, setIsDeleteModalVisible: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => {
    setSelectedStaff(staff);
    setIsDeleteModalVisible(true);
    setError(null);
  };

  // Update the DeleteConfirmationModal component
  const DeleteConfirmationModal: React.FC<{
    isDeleteModalVisible: boolean;
    selectedStaff: StaffMember | null;
    loading: boolean;
    error: string | null;
    onDelete: (staffId: string) => Promise<void>;
    onCancel: () => void;
  }> = ({ isDeleteModalVisible, selectedStaff, loading, error, onDelete, onCancel }) => {
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
          className: 'bg-red-500 hover:bg-red-600'
        }}
      >
        <div className="py-4">
          <p className="text-base">Are you sure you want to delete this staff member?</p>
          {selectedStaff && (
            <div className="mt-2 text-gray-600">
              <p>Name: {selectedStaff.name}</p>
              <p>Email: {selectedStaff.email}</p>
            </div>
          )}
          {error && (
            <div className="mt-2 text-red-500">
              {error}
            </div>
          )}
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
        staff.role.toLowerCase().includes(value.toLowerCase())
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
        return [DEPARTMENTS.PROJECT_MANAGEMENT];
      default:
        return Object.values(DEPARTMENTS);
    }
  };

  // Add filter handlers
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Staff List</h2>
      <div className="flex items-center gap-2 mb-4">
        <Input
          className="flex-1 max-w-xs p-2 border border-gray-300 rounded"
          placeholder="Search staff..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={handleSearch}
        />
        <Button
          className="bg-blue-500 text-white text-sm p-2 rounded flex items-center gap-1 border-none cursor-pointer hover:bg-blue-700"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Staff
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="flex items-center gap-4 mb-4">
        <Select
          className="w-48"
          placeholder="Filter by Role"
          allowClear
          onChange={handleRoleChange}
          value={selectedRole}
        >
          <Option value="ADMIN">Admin</Option>
          <Option value="STAFF">Staff</Option>
          <Option value="APPROVER">Approver</Option>
          <Option value="FINANCE">Finance</Option>
        </Select>

        <Select
          className="w-48"
          placeholder="Filter by Department"
          allowClear
          onChange={handleDepartmentChange}
          value={selectedDepartment}
        >
          {Object.values(DEPARTMENTS).map(dept => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
      </div>

      <Table<StaffMember>
        className="bg-white p-4 rounded-lg shadow-md"
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
          pageSizeOptions: ['10', '20', '50'],
          position: ["bottomCenter"],
        }}
        onRow={(record: StaffMember) => ({
          onClick: () => handleRowClick(record),
        })}
      />

      <Modal
        title={isEditing ? "Edit Staff" : "Create New Staff"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        {error && <div className="error-message">{error}</div>}

        <div>
          <div className="form-group">
            <label>Name</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              disabled={isEditing}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled={isEditing} // Email can only be set during creation
            />
          </div>
          {!isEditing && (
            <div className="form-group">
              <label>Password</label>
              <Input.Password
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>
          )}
          <div className="form-group">
            <label>Role</label>
            <Select
              value={formData.role}
              onChange={(value) => {
                const role = value as SystemRole;
                const validDepartments = getDepartmentOptions(role);
                setFormData({
                  ...formData,
                  role: value,
                  department: validDepartments[0] // Set first valid department automatically
                });
              }}
              style={{ width: "100%" }}
            >
              <Select.Option value={SystemRole.ADMIN}>Admin</Select.Option>
              <Select.Option value={SystemRole.APPROVER}>Approver</Select.Option>
              <Select.Option value={SystemRole.STAFF}>Staff</Select.Option>
              <Select.Option value={SystemRole.FINANCE}>Finance</Select.Option>
            </Select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <Select
              value={formData.department}
              onChange={(value) => setFormData({ ...formData, department: value })}
              style={{ width: "100%" }}
            >
              {formData.role === SystemRole.FINANCE && (
                <Select.Option value={DEPARTMENTS.FINANCE}>Finance</Select.Option>
              )}
              {formData.role === SystemRole.APPROVER && (
                <>
                  <Select.Option value={DEPARTMENTS.PROJECT_MANAGEMENT}>Project Management</Select.Option>
                  <Select.Option value={DEPARTMENTS.BUSINESS_LEADER}>Business Leader</Select.Option>
                </>
              )}
              {formData.role === SystemRole.STAFF && (
                <Select.Option value={DEPARTMENTS.ENGINEER}>Engineer</Select.Option>
              )}
              {formData.role === SystemRole.ADMIN && (
                <Select.Option value={DEPARTMENTS.PROJECT_MANAGEMENT}>Project Management</Select.Option>
              )}
            </Select>
          </div>
          <div className="form-group">
            <label>Salary</label>
            <Input
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="Enter salary"
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Staff Details"
        open={isDetailVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="close" onClick={handleCancel}>
            Close
          </Button>,
        ]}
      >
        {selectedStaff && (
          <div>
            <p>
              <strong>Name:</strong> {selectedStaff.name}
            </p>
            <p>
              <strong>Email:</strong> {selectedStaff.email}
            </p>
            <p>
              <strong>Role:</strong> {selectedStaff.role}
            </p>
            <p>
              <strong>Department:</strong> {selectedStaff.department}
            </p>
            <p>
              <strong>Salary:</strong>{" "}
              {Number(selectedStaff.salary).toLocaleString("en-US")} VND
            </p>
          </div>
        )}
      </Modal>

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
          <Button
            key="ok"
            type="primary"
            onClick={handleCancel}
          >
            OK
          </Button>,
        ]}
      >
        <div className="py-4">
          <p className="text-green-600">Operation completed successfully!</p>
        </div>
      </Modal>
    </>
  );
};

export default StaffList;
