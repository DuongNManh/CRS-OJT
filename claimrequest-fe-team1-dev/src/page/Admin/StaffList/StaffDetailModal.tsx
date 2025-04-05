import { addSpaceBeforeCapitalLetters } from "@/utils/stringFormatter";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Modal, Tag } from "antd";
import React from "react";

interface StaffDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  staff: {
    avatarUrl?: string;
    name: string;
    email: string;
    systemRole: string;
    department: string;
    salary: number;
  } | null;
  roleColors: Record<string, { text: string }>;
  departmentColors: Record<string, { text: string; bg: string }>;
}

const StaffDetailsModal: React.FC<StaffDetailsModalProps> = ({
  isVisible,
  onClose,
  staff,
  roleColors,
  departmentColors,
}) => {
  return (
    <Modal
      className="flex justify-center items-center"
      title={null}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      {staff && (
        <div
          className={`relative rounded-xl border-2 transition-transform p-1 ${
            departmentColors[staff.department]?.bg
          }`}
        >
          <div className="bg-gray-200 dark:bg-gray-300 rounded-xl p-4 shadow-md relative h-96 w-64 flex flex-col items-center">
            <div className="absolute inset-0">
              <img
                src="/world.png"
                alt="World Icon"
                className="absolute inset-y-0 right-0 h-full w-auto rounded-2xl object-cover opacity-20"
              />
              <img
                src="/icon.png"
                alt="Logo Icon"
                className="h-6 w-10 top-2 left-1/2 absolute transform -translate-x-1/2"
              />
            </div>

            <div className="flex flex-col items-center justify-evenly h-full">
              {staff.avatarUrl ? (
                <Avatar
                  src={staff.avatarUrl}
                  alt="Avatar"
                  size={85}
                  className="object-cover z-10"
                />
              ) : (
                <Avatar size={90} icon={<UserOutlined />} className="z-10" />
              )}
              <h3 className="text-xl font-semibold text-center text-black z-10">
                {staff.name}
              </h3>
              <p className="text-gray-700 text-center z-10">{staff.email}</p>
              <div className="flex flex-col items-center gap-2 z-10">
                <div className="flex gap-2">
                  <Tag color={roleColors[staff.systemRole]?.text}>
                    {staff.systemRole}
                  </Tag>
                </div>
              </div>
              {staff.salary && (
                <p className="text-gray-700 z-10">
                  {Number(staff.salary).toLocaleString("en-US")},000,000 VND
                </p>
              )}
            </div>
          </div>

          <div
            className={`absolute bottom-0 right-0 flex justify-around gap-2 p-[1px] w-[90%] ${
              departmentColors[staff.department]?.bg
            } rounded-tl-3xl rounded-br-2xl`}
          >
            <div className="flex items-center gap-2 text-xs font-medium text-white">
              {addSpaceBeforeCapitalLetters(staff.department)}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StaffDetailsModal;
