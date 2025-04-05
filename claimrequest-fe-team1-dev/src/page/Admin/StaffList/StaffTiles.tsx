// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  DEPARTMENT_COLOR,
  SYSTEM_ROLE_COLOR,
} from "@/interfaces/project.interface";
import { GetStaffResponse } from "@/interfaces/staff.interface";
import { addSpaceBeforeCapitalLetters } from "@/utils/stringFormatter";
import { DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Pagination, Spin, Tag } from "antd";

interface StaffTilesProps {
  staffList: GetStaffResponse[];
  onStaffClick: (staff: GetStaffResponse) => void;
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger: boolean;
    showTotal: (total: number) => string;
    pageSizeOptions: string[];
    position: (
      | "topLeft"
      | "topCenter"
      | "topRight"
      | "bottomLeft"
      | "bottomCenter"
      | "bottomRight"
    )[];
  };
  handleUpdate: (staff: GetStaffResponse) => void;
  showDeleteConfirm: (staff: GetStaffResponse) => void;
}

export const StaffTiles: React.FC<StaffTilesProps> = ({
  staffList,
  onStaffClick,
  loading = false,
  pagination,
  handleUpdate,
  showDeleteConfirm,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5 px-20">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className={`relative rounded-xl border-2 transition-transform cursor-pointer hover:scale-105 hover:shadow-lg p-1 h-100 ${
                DEPARTMENT_COLOR[staff.department].bg
              }`}
              onClick={() => onStaffClick(staff)}
            >
              <div className="bg-gray-200 dark:bg-gray-300 rounded-xl p-4 shadow-md relative h-96 flex flex-col items-center">
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
                      className="object-cover z-10" // Ensure avatar is above the background
                    />
                  ) : (
                    <Avatar
                      size={90}
                      icon={<UserOutlined />}
                      className="z-10"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-center text-black z-10">
                    {staff.name}
                  </h3>
                  <p className="text-gray-700 text-center z-10">
                    {staff.email}
                  </p>
                  <div className="flex flex-col items-center gap-2 z-10">
                    <div className="flex gap-2">
                      <Tag
                        color={`${SYSTEM_ROLE_COLOR[staff.systemRole].text}`}
                      >
                        {staff.systemRole}
                      </Tag>
                    </div>
                  </div>
                  <p className="text-gray-700 z-10">
                    ${Number(staff.salary).toLocaleString("en-US")}
                  </p>
                </div>
              </div>

              <div
                className={`absolute bottom-0 right-0 flex justify-around gap-2 p-[1px] w-[90%] ${DEPARTMENT_COLOR[staff.department].bg} rounded-tl-3xl rounded-br-2xl`}
              >
                <div className="flex items-center gap-2 text-xs font-medium text-white">
                  {addSpaceBeforeCapitalLetters(staff.department)}
                </div>
                <Button
                  icon={<EditOutlined />}
                  type="text"
                  variant="dashed"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleUpdate(staff);
                  }}
                />
                <Button
                  icon={<DeleteOutlined />}
                  type="text"
                  variant="dashed"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    showDeleteConfirm(staff);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Spin>
      <div className="flex justify-center mt-4">
        <Pagination
          {...pagination}
          className="dark: fo"
          itemRender={(current, type, originalElement) => {
            if (type === "prev") {
              return (
                <Button className="dark:text-gray-300 text-gray-700 dark:bg-gray-400">
                  {"<"}
                </Button>
              );
            }
            if (type === "next") {
              return (
                <Button className="dark:text-gray-300 text-gray-700 dark:bg-gray-400">
                  {">"}
                </Button>
              );
            }
            return originalElement;
          }}
        />
      </div>
    </div>
  );
};
