import { projectService } from '@/services/features/project.service';
import { staffService } from '@/services/features/staff.service';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, InputNumber, message, Modal, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

// Define interfaces for type safety
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
  businessUnitLeader: {
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

interface FormData {
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

interface ModalState {
  view: 'list' | 'view' | 'update' | 'add';
}

const PROJECT_STATUS = {
  DRAFT: "Draft",
  ONGOING: "Ongoing",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
} as const;

const ProjectList: React.FC = () => {
  const [viewMode, setViewMode] = useState<ModalState['view']>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    id: "",
    name: "",
    description: "",
    status: "",
    startDate: "",
    endDate: "",
    budget: 0,
    projectManager: {
      id: '',
      name: '',
      email: '',
      systemRole: '',
      department: ''
    },
    businessUnitLeader: {
      id: '',
      name: '',
      email: '',
      systemRole: '',
      department: ''
    }
  });
  // const {withLoading} = useApi();

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [staffsList, setStaffsList] = useState<Staff[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    console.log("Debug: useEffect");
    fetchStaffs();
    fetchProjects();
  }, []);

  // Data fetchers

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();

      if (response.is_success && response.data) {
        setProjectList(response.data);
      } else {
        setProjectList([]);
        message.error(response.message);
      }
    } catch (error) {
      setProjectList([]);
      message.error("Failed to fetch projects");
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
      message.error("Failed to fetch staffs");
      console.error(error);
      setStaffsList([]);
    }
  };

  // CRUD Handlers

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === 'budget') {
      // Remove existing commas first
      const numericValue = value.replace(/,/g, '');
      // Only proceed if it's a valid number or empty
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
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
        businessUnitLeaderId: formData.businessUnitLeader.id
    }

    console.table(processedData);

      let response;
      if (viewMode === 'update') {
        response = await projectService.updateProject(formData.id, processedData);
      } else {
        const { id, ...createData } = processedData;
        console.log("Create Data: ", createData);
        response = await projectService.createProject(createData);
        response = await projectService.createProject(createData);
      }

      if (response.is_success) {
        await fetchProjects(); 
        setIsModalVisible(false);
        setIsSuccessModalVisible(true);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      message.error(error.message);
      console.error(error);
    }
  };

  const handleEdit = (record: Project): void => {
    setFormData({
      ...record,
      budget: Number(String(record.budget).replace(/,/g, "")),
    });
    setViewMode('update');
    setIsModalVisible(true);
  };

  const handleAdd = (): void => {
    setFormData({
      id: "",
      name: "",
      description: "",
      status: "",
      startDate: "",
      endDate: "",
      budget: 0,
      projectManager: { 
        id: '',
        name: '',
        email: '',
        systemRole: '',
        department: ''
      },
      businessUnitLeader: { 
        id: '',
        name: '',
        email: '',
        systemRole: '',
        department: ''
      }
    });
    setViewMode('add');
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
          setIsDeleteModalVisible(false);
          message.success("Project deleted successfully!");
        } else {
          message.error(response.message || "Failed to delete project");
        }
      }
    } catch (error) {
      message.error("Failed to delete project");
      console.error(error);
    }
  };

  const handleDeleteClick = (record: Project): void => {
    setProjectToDelete(record.id);
    setIsDeleteModalVisible(true);
  };

  const columns: ColumnsType<Project> = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      sorter: (a, b) => a.startDate.localeCompare(b.startDate)
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      sorter: (a, b) => a.endDate.localeCompare(b.endDate)
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      render: (budget: number) => `${budget} VND`,
      sorter: (a, b) => a.budget - b.budget
    },
    {
      title: "Project Manager",
      dataIndex: "projectManager",
      key: "projectManager",
      render: (projectManager: Staff) => projectManager.name,
      filters: staffsList
      .filter(staff => staff.department === 'ProjectManagement')
      .map(staff => ({ 
        text: staff.name,
        value: staff.id
      })),
      onFilter: (value: string, record: Project) => record.projectManager.id === value, 
      sorter: (a, b) => a.projectManager.name.localeCompare(b.projectManager.name)
    },
    {
      title: 'Business Unit Leader',
      dataIndex: 'businessUnitLeader',
      key: 'businessUnitLeader',
      render: (businessUnitLeader: Staff) => businessUnitLeader.name,
      filters: staffsList
      .filter(staff => staff.department === 'BusinessUnitLeader')
      .map(staff => ({ 
        text: staff.name,
        value: staff.id
      })),
      onFilter: (value: string, record: Project) => record.businessUnitLeader.id === value, 
      sorter: (a, b) => a.businessUnitLeader.name.localeCompare(b.businessUnitLeader.name)
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Project) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(record);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
      <div className="p-[10px]">
        <h2 className="text-[24px] font-bold mb-[15px] text-[#333]">Project List</h2>
        <div className="flex justify-between mb-4">
          <Input
            placeholder="Search projects"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Project
          </Button>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={projectList.filter(project => 
            project.name.toLowerCase().includes(searchText.toLowerCase()) ||
            project.description.toLowerCase().includes(searchText.toLowerCase()) ||
            project.projectManager.name.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey='id'
          onRow={(record: Project) => ({
            onClick: () => handleView(record),
          })}
          pagination={{
            pageSize: 9,
            hideOnSinglePage: true,
            showSizeChanger: false
          }}
        />

        <Modal
          title={viewMode === 'update' ? 'Edit Project' : viewMode === 'add' ? 'Add Project' : 'View Project'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              Cancel
            </Button>,
            viewMode !== 'view' && (
              <Button
                key="submit"
                type="primary"
                onClick={handleSave}
              >
                {viewMode === 'update' ? 'Update' : 'Add'}
              </Button>
            ),
          ]}
        >
          <form>

            <div className="mb-4">
              <label className="block mb-2">Project ID:</label>
              <Input 
                name="id" 
                value={formData.id} 
                onChange={handleChange} 
                placeholder="Auto-generated ID" 
                disabled={true}
                readOnly
              />
              </div>

            <div className="mb-4">
              <label className="block mb-2">Name:</label>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter project name" 
                disabled={viewMode === 'view'}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Description:</label>
              <Input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description"
                disabled={viewMode === 'view'}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Status:</label>
              <Select
                name="status"
                value={formData.status}
                onChange={(value) => setFormData({ ...formData, status: value })}
                placeholder="Select project status"
                disabled={viewMode === 'view'}
                style={{ width: '100%' }}
              >
                {Object.values(PROJECT_STATUS).map((status) => (
                  <Select.Option key={status} value={status}>
                    {status}
                  </Select.Option>
                ))}
              </Select>
            </div>
            

            <div className="mb-4">
              <label className="block mb-2">Start Date:</label>
              <DatePicker
                name="startDate"
                value={formData.startDate ? dayjs(formData.startDate) : null}
                onChange={(date) => {
                  setFormData({
                    ...formData,
                    startDate: date ? date.format('YYYY-MM-DD') : ''
                  });
                }}
                placeholder="Select start date"
                disabled={viewMode === 'view'}
                style={{ width: '100%' }}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">End Date:</label>
              <DatePicker
                name="endDate"
                value={formData.endDate ? dayjs(formData.endDate) : null}
                onChange={(date) => {
                  setFormData({
                    ...formData,
                    endDate: date ? date.format('YYYY-MM-DD') : ''
                  });
                }}
                placeholder="Select end date"
                disabled={viewMode === 'view'}
                style={{ width: '100%' }}
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">Budget (VND):</label>
              <InputNumber
                name="budget"
                value={formData.budget}
                onChange={(value) => setFormData({ ...formData, budget: value || 0 })}
                placeholder="Enter budget"
                disabled={viewMode === 'view'}
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                min={0}
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2">Project Manager:</label>
              <Select
                name="projectManagerId"
                value={formData.projectManager.id}
                onChange={(value) => {
                  const selectedStaff = staffsList.find(staff => staff.id === value);
                  if (selectedStaff) {
                    setFormData({
                      ...formData,
                      projectManager: selectedStaff
                    });
                  }
                }}
                placeholder="Select project manager"
                disabled={viewMode === 'view'}
                style={{ width: '100%' }}
              >
                {staffsList
                  .filter(staff => staff.department === 'ProjectManagement')
                  .map(staff => (
                    <Select.Option key={staff.id} value={staff.id}>
                      {staff.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Business Unit Leader:</label>
              <Select
                name="businessUnitLeaderId"
                value={formData.businessUnitLeader.id}
                onChange={(value) => {
                  const selectedStaff = staffsList.find(staff => staff.id === value);
                  if (selectedStaff) {
                    setFormData({
                      ...formData,
                      businessUnitLeader: selectedStaff
                    });
                  }
                }}
                placeholder="Select business unit leader"
                disabled={viewMode === 'view'}
                style={{ width: '100%' }}
              >
                {staffsList
                  .filter(staff => staff.department === 'BusinessUnitLeader')
                  .map(staff => (
                    <Select.Option key={staff.id} value={staff.id}>
                      {staff.name}
                    </Select.Option>
                  ))}
              </Select>
            </div>

          </form>
        </Modal>

        {/* Confirm deletion */}

        <Modal
          title="Confirm Delete"
          open={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsDeleteModalVisible(false)}>
              Cancel
            </Button>,
            <Button key="delete" type="primary" danger onClick={handleDelete}>
              Delete
            </Button>,
          ]}
        >
          <p>Are you sure you want to delete this project?</p>
        </Modal>

        {/* Success Modal */}

        <Modal
          title="Success"
          open={isSuccessModalVisible}
          onCancel={() => setIsSuccessModalVisible(false)}
          footer={[
            <Button key="ok" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
              OK
            </Button>,
          ]}
        >
          <p>{viewMode === 'update' ? "Project updated successfully!" : "Project added successfully!"}</p>
        </Modal>
      </div>
  );
};

export default ProjectList;
