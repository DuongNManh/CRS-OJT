// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useApi } from "@/hooks/useApi";
import { SystemRole } from "@/interfaces/auth.interface";
import { GetClaimResponse } from "@/interfaces/claim.interface";
import { cacheService } from "@/services/features/cacheService";
import { claimService } from "@/services/features/claim.service";
import { useAppSelector } from "@/services/store/store";
import { statusColors } from "@/utils/statusColors";
import {
  CheckSquareOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Table, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

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
  mode: "ApproverMode" | "ClaimerMode" | "FinanceMode" | "AdminMode";
  claimStatus: string;
  startDate: string;
  endDate: string;
  onStatusChange: (status: string | null) => void;
  selectedRows?: string[];
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  onCancelClaim?: (claimId: string) => void;
  onSubmitClaim?: (claimId: string) => void;
  refreshKey?: number;
  searchText?: string;
}

const ClaimTable: React.FC<ClaimTableProps> = ({
  mode,
  claimStatus,
  startDate,
  endDate,
  selectedRows,
  onSelectionChange,
  onCancelClaim,
  onSubmitClaim,
  refreshKey,
  searchText,
}) => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [claims, setClaims] = useState<GetClaimResponse[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalItems, setTotalItems] = useState<number>(0);
  const { withLoading } = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cacheKey = `claims_${mode}_${claimStatus}_${pageNumber}_${pageSize}_${startDate}_${endDate}_${searchText || ""}`;
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
              endDate,
              searchText,
            ),
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
              ["claims", `${mode}-claims`],
            );
          }
        }
      } catch (error) {
        toast.error(
          (error as Error).message || t("claim_table.error_fetching_claims"),
        );
      }
    };

    fetchData();
  }, [
    pageNumber,
    pageSize,
    claimStatus,
    mode,
    startDate,
    endDate,
    refreshKey,
    searchText,
  ]);

  const columns: TableColumn[] = [
    {
      title: t("claim_table.name"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <Tooltip title={text}>
          <div className="max-w-[200px] truncate">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: t("claim_table.project_name"),
      dataIndex: "project",
      key: "projectName",
      render: (text, record) => {
        const projectName = record.project?.name || t("claim_table.na");
        return (
          <Tooltip title={projectName}>
            <div className="max-w-[200px] truncate">{projectName}</div>
          </Tooltip>
        );
      },
      filters: claims
        .map((claim) => claim.project?.name)
        .filter((name): name is string => name !== undefined)
        .map((name) => ({ text: name, value: name })),
      onFilter: (value, record) => record.project?.name === value,
      sorter: (a, b) =>
        (a.project?.name || "").localeCompare(b.project?.name || ""),
    },
    {
      title: t("claim_table.created_at"),
      dataIndex: "createAt",
      key: "createAt",
      sorter: (a, b) =>
        new Date(a.createAt).getTime() - new Date(b.createAt).getTime(),
    },
    {
      title: t("claim_table.total_working_hours"),
      dataIndex: "totalWorkingHours",
      key: "totalWorkingHours",
      sorter: (a, b) => a.totalWorkingHours - b.totalWorkingHours,
    },
    {
      title: t("claim_table.total_claim_amount"),
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: t("claim_table.status"),
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorClass = statusColors[status] || "bg-gray-200 text-gray-800";
        return (
          <Tag
            className={`border-none px-3 py-1 rounded-xl w-[77px] text-center font-bold ${colorClass}`}
          >
            {status}
          </Tag>
        );
      },
    },
  ];

  if (user?.systemRole === SystemRole.APPROVER && mode === "ApproverMode") {
    columns.push({
      title: t("claim_table.your_approval_status"),
      dataIndex: "claimApprover",
      key: "claimApprover.approverStatus",
      width: 100,
      render: (text, record) => {
        const status = record.claimApprover.approverStatus;
        const colorClass = statusColors[status] || "bg-gray-200 text-gray-800";
        return (
          <Tag
            className={`border-none px-3 py-1 rounded-xl w-[77px] text-center font-bold ${colorClass}`}
          >
            {status}
          </Tag>
        );
      },
    });
  }

  if (mode === "ClaimerMode") {
    columns.push({
      title: t("claim_table.actions"),
      key: "actions",
      dataIndex: "",
      render: (text, record) => (
        <div className="ml-2 flex gap-4">
          {record.status === "Draft" ? (
            <>
              <Tooltip title={t("claim_table.submit")}>
                <CheckSquareOutlined
                  className="text-blue-500 dark:text-blue-400 text-xl cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSubmitClaim(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title={t("claim_table.edit")}>
                <EditOutlined
                  className="text-green-500 dark:text-green-400 text-xl cursor-pointer hover:text-green-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/claim-update/${record.id}`, { state: record });
                  }}
                />
              </Tooltip>
              <Tooltip title={t("claim_table.cancel")}>
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
    });
  }

  const rowSelection =
    mode === "FinanceMode"
      ? {
          selectedRowKeys: selectedRows,
          onChange: (selectedRowKeys: React.Key[]) => {
            onSelectionChange?.(selectedRowKeys as string[]);
          },
        }
      : undefined;

  return (
    <div className="bg-white dark:bg-[#272B34] p-6 rounded-xl overflow-x-auto">
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
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} ${t("claim_table.of")} ${total} ${t("claim_table.items")}`,
        }}
        onRow={(record) => ({
          onClick: () => {
            let navigationPath = "";
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
              case "AdminMode":
                navigationPath = `/admin/claim-detail/${record.id}`;
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
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                className={`
                  !bg-gray-300 dark:!bg-[#121212]
                  !text-gray-800 dark:!text-white
                  ![&.ant-table-cell-sort]:bg-gray-300
                  ![&.ant-table-cell-sort]:dark:bg-gray-700
                  border-b border-gray-300 dark:border-gray-700
                  ![&.ant-table-column-has-sorters]:hover:bg-gray-300
                  ![&.ant-table-column-has-sorters]:dark:hover:bg-gray-700
                  ![&_.ant-table-column-sorter]:text-gray-800
                  ![&_.ant-table-column-sorter]:dark:text-white
                `}
              />
            ),
          },
          body: {
            row: (props) => (
              <tr
                {...props}
                className="hover:bg-gray-100 dark:hover:bg-gray-800
                          bg-white dark:bg-gray-900
                          text-gray-800 dark:text-white"
              />
            ),
            cell: (props) => (
              <td
                {...props}
                className={`
                  text-gray-800 dark:text-white
                  ![&.ant-table-column-sort]:bg-gray-100
                  ![&.ant-table-column-sort]:dark:bg-gray-800
                  ![&.ant-table-column-sort]:text-gray-800
                  ![&.ant-table-column-sort]:dark:text-white
                `}
              />
            ),
          },
        }}
      />
    </div>
  );
};

export default ClaimTable;
