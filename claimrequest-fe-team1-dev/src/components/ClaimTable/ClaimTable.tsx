import React, { useEffect, useState } from "react";
import { Table, Tag, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/services/store/store";
import { GetClaimResponse } from "@/interfaces/claim.interface";
import { claimService } from "@/services/features/claim.service";
import { toast } from "react-toastify";
import { useApi } from "@/hooks/useApi";
import { statusColors } from "@/utils/statusColors";
import { SystemRole } from "@/interfaces/auth.interface"; 
import { cacheService } from "@/services/features/cacheService"; // Import cacheService
import { CheckSquareOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

// Add interface for table column
interface TableColumn {
  title: string;
  dataIndex: keyof GetClaimResponse | string;
  key: string;
  width?: number;
  filters?: { text: string; value: string }[];
  onFilter?: (value: string, record: GetClaimResponse) => boolean;
  sorter?: (a: GetClaimResponse, b: GetClaimResponse) => number;
  render?: (value: any, record: GetClaimResponse) => React.ReactNode;
}

interface ClaimTableProps {
  mode: "ApproverMode" | "ClaimerMode" | "FinanceMode";
  claimStatus: string;
  startDate: string;
  endDate: string;
  onStatusChange: (status: string | null) => void;
  selectedRows?: string[];
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  onCancelClaim?: (claimId: string) => void;
  refreshKey?: number;
}

const ClaimTable: React.FC<ClaimTableProps> = ({
  mode,
  claimStatus,
  startDate,
  endDate,
  selectedRows,
  onSelectionChange,
  onCancelClaim,
  refreshKey,
}) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [claims, setClaims] = useState<GetClaimResponse[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalItems, setTotalItems] = useState<number>(0);
  const { withLoading } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching data: ", mode, claimStatus, pageNumber, pageSize, startDate, endDate);
      try {
        const cacheKey = `claims_${mode}_${claimStatus}_${pageNumber}_${pageSize}_${startDate}_${endDate}`;
        const cachedData = cacheService.get(cacheKey);

        if (cachedData) {
          setClaims(cachedData.claims);
          setTotalItems(cachedData.totalItems);
        } else {
          const claimsResponse = await withLoading(
            claimService.getClaims(
              claimStatus,
              pageNumber,
              pageSize,
              mode,
              startDate,
              endDate
            )
          );

          if (claimsResponse) {
            setClaims(claimsResponse.items);
            setTotalItems(claimsResponse.meta.total_items);
            cacheService.set(
              cacheKey, 
              {
                claims: claimsResponse.items,
                totalItems: claimsResponse.meta.total_items,
              },
              ['claims', `${mode}-claims`]
            );
          }
        }
      } catch (error) {
        toast.error((error as Error).message || "Failed to fetch claims");
        console.error(error);
      }
    };

    fetchData();
  }, [pageNumber, pageSize, claimStatus, mode, startDate, endDate, refreshKey]);

  const columns: TableColumn[] = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Project Name",
      dataIndex: "project",
      key: "projectName",
      render: (text, record) => record.project?.name || "N/A",
      filters: claims
        .map((claim) => claim.project?.name)
        .filter((name): name is string => name !== undefined)
        .map((name) => ({ text: name, value: name })),
      onFilter: (value, record) => record.project?.name === value,
      sorter: (a, b) =>
        (a.project?.name || "").localeCompare(b.project?.name || ""),
    },
    {
      title: "Created At",
      dataIndex: "createAt",
      key: "createAt",
      sorter: (a, b) =>
        new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    },
    {
      title: "Total Working Hours",
      dataIndex: "totalWorkingHours",
      key: "totalWorkingHours",
      sorter: (a, b) => a.totalWorkingHours - b.totalWorkingHours,
    },
    {
      title: "Total Claim Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorClass = statusColors[status] || "bg-gray-100 text-gray-800"; // Default color if status not found
        return (
          <Tag className={`border-none px-3 py-1 rounded-md w-[77px] text-center ${colorClass}`}>
            {status}
          </Tag>
        );
      },
    },
  ];

  if (user?.systemRole === SystemRole.APPROVER  && mode === "ApproverMode") {
    columns.push({
      title: "Your Approval Status",
      dataIndex: "claimApprover",
      key: "claimApprover.approverStatus",
      width: 100,
      render: (text, record) => {
        const status = record.claimApprover.approverStatus;
        const colorClass = statusColors[status] || "bg-gray-100 text-gray-800"; // Default color if status not found
        return (
          <Tag className={`border-none px-3 py-1 rounded-md w-[77px] text-center ${colorClass}`}>
            {status}
          </Tag>
        );
      },
    });
  }

  if (mode === "ClaimerMode") {
    columns.push({
      title: "Actions",
      key: "actions",
      dataIndex: '',
      render: (text, record) => (
        <div className="ml-2 flex gap-4">
          {record.status === 'Draft' ? (
            <>
              <Tooltip title="Send">
                <CheckSquareOutlined
                  className="text-blue-500 text-xl cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    showModal(record, false);
                  }}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <EditOutlined
                  className="text-green-500 text-xl cursor-pointer hover:text-green-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/claim-update/${record.id}`, { state: record });
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <DeleteOutlined
                  className="text-red-500 text-xl cursor-pointer hover:text-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    showModal(record, true);
                  }}
                />
              </Tooltip>
              <Tooltip title="Cancel">
                <CloseCircleOutlined
                  className="text-red-500 text-xl cursor-pointer hover:text-red-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelClaim(record.id);
                  }}
                />
              </Tooltip>
            </>
          ) : null}
        </div>
      ),
    },
    );
  }
  
  // Add rowSelection configuration
  const rowSelection = mode === "FinanceMode" ? {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys: React.Key[]) => {
      onSelectionChange?.(selectedRowKeys as string[]);
    },
  } : undefined;

  return (
    <div className="bg-white p-6 rounded-xl overflow-x-auto">
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={claims.map((claim) => ({ ...claim, key: claim.id }))}
        pagination={{
          current: pageNumber,
          pageSize: pageSize,
          total: totalItems,
          onChange: (page, pageSize) => {
            setPageNumber(page);
            setPageSize(pageSize);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            let navigationPath = '';
            switch (mode) {
              case "ApproverMode":
                navigationPath = `/approver/claim-detail/${record.id}`;
                break;
              case "FinanceMode":
                navigationPath = `/finance/claim-detail/${record.id}`;
                break;
              case "ClaimerMode":
                navigationPath = `/claim-detail/${record.id}`;
                break;
              default:
                navigationPath = `/claim-detail/${record.id}`;
            }
            navigate(navigationPath, { state: record });
          },
          style: { cursor: "pointer" },
        })}
        scroll={{ x: "max-content" }}
        className="custom-antd-table round-xl"
      />
    </div>
  );
};

export default ClaimTable;