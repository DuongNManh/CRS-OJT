// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import React, { useState, useEffect, useCallback } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  ChartData,
  ArcElement,
  Chart as ChartJS,
  Tooltip,
  Legend,
} from "chart.js";
import { claimService } from "@/services/features/claim.service";
import { format } from "date-fns";
import { SystemRole } from "@/interfaces/auth.interface";
import { useTranslation } from "react-i18next";

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface FinanceChartProps {
  userId?: string;
  userRole?: SystemRole;
  isActive: boolean;
}

// ApproverChart status
// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum FinanceChartStatus {
  Approved = "Approved",
  Paid = "Paid",
}

const FinanceChart: React.FC<FinanceChartProps> = React.memo(
  ({ userId, userRole, isActive }) => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState<ChartData<"doughnut"> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dataFetched, setDataFetched] = useState(false);
    const [totalClaims, setTotalClaims] = useState(0);

    const refreshData = useCallback(() => {
      setIsLoading(true);
      setError(null);
      setDataFetched(false);
      fetchData();
    }, []);

    const fetchData = useCallback(async () => {
      if (!userId || !userRole) {
        setError(t("chart.error_message"));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const endDate = format(new Date(), "yyyy-MM-dd");
        const startDate = format(
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd",
        );

        const viewMode = "FinanceMode";

        const response = await claimService.getClaimStatusCount(
          viewMode,
          startDate,
          endDate,
        );

        if (!response.is_success || !response.data) {
          throw new Error(response?.reason || t("chart.error_message"));
        }

        let totalFromApi = 0;
        if (response.data.total !== undefined) {
          totalFromApi = Number(response.data.total);
          setTotalClaims(totalFromApi);
        }

        const filteredData = Object.entries(response.data)
          .filter(([key]) => {
            const upperKey = key.toUpperCase();
            return ["APPROVED", "PAID"].includes(upperKey);
          })
          .reduce(
            (acc, [key, value]) => {
              const formattedKey =
                key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
              acc[formattedKey] = Number(value);
              return acc;
            },
            {} as Record<string, number>,
          );

        const labels = Object.keys(filteredData) as Array<
          keyof typeof FinanceChartStatus
        >;
        const values = Object.values(filteredData);

        if (values.length === 0 || !values.some((val) => val > 0)) {
          setData(null);
          setIsLoading(false);
          return;
        }

        const percentages = values.map((value) =>
          Math.round((value / totalFromApi) * 100),
        );
        const labelsWithPercentages = labels.map(
          (label, index) => `${label} ${percentages[index]}%`,
        );

        const chartData: ChartData<"doughnut"> = {
          labels: labelsWithPercentages,
          datasets: [
            {
              data: values,
              backgroundColor: [
                "rgba(76, 175, 80, 0.7)", // green color for Approved
                "rgba(255, 235, 59, 0.7)", // yellow color for Paid
              ],
              borderColor: ["rgba(76, 175, 80, 1)", "rgba(255, 235, 59, 1)"],
              borderWidth: 1,
              hoverOffset: 15,
            },
          ],
        };

        setData(chartData);
        setDataFetched(true);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : t("chart.error_message"),
        );
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }, [userId, userRole, t]);

    useEffect(() => {
      if (isActive && !dataFetched && userId && userRole) {
        fetchData();
      }
    }, [isActive, dataFetched, userId, userRole, fetchData]);

    useEffect(() => {
      const handleLanguageChange = () => {
        fetchData();
      };

      i18n.on("languageChanged", handleLanguageChange);
      return () => {
        i18n.off("languageChanged", handleLanguageChange);
      };
    }, [i18n, fetchData]);

    const centerText = {
      id: "centerText",
      afterDatasetsDraw(chart: ChartJS) {
        const {
          ctx,
          chartArea: { left, top, width, height },
        } = chart;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "#1169B0";
        ctx.fillText(
          totalClaims.toString(),
          width / 2 + left,
          height / 2 + top - 10,
        );

        ctx.font = "14px Arial";
        ctx.fillStyle = "#666";
        ctx.fillText(
          t("chart.total_claims"),
          width / 2 + left,
          height / 2 + top + 30,
        );

        ctx.restore();
      },
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      layout: {
        padding: 10,
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const label = context.label || "";
              const value = context.raw || 0;
              return `${label.split(" ")[0]}: ${value}`;
            },
          },
        },
      },
    };

    return (
      <div className="animate__animated animate__zoomIn animate__faster p-12 w-full">
        <h2 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-[#1169B0] to-[#16B14B] text-transparent bg-clip-text">
          {t("chart.finance.title")}
        </h2>
        <p className="text-md text-gray-500 dark:text-gray-400 mb-6 text-center">
          {t("chart.subtitle")}
        </p>

        <div className="flex h-[500px] items-center justify-center">
          {isLoading && (
            <div className="text-center">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p>{t("chart.loading")}</p>
            </div>
          )}

          {error && (
            <div className="text-center p-4">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                {t("chart.try_again")}
              </button>
            </div>
          )}

          {!isLoading && !error && data && (
            <div
              className="flex items-center justify-center w-full h-full"
              style={{
                position: "relative",
                padding: "10px",
              }}
            >
              <Doughnut
                data={data}
                options={chartOptions}
                plugins={[centerText]}
              />
            </div>
          )}

          {!isLoading && !error && !data && (
            <div className="text-center p-4">
              <p className="text-gray-500 mb-2">{t("chart.no_data")}</p>
              <p className="text-sm text-gray-400">
                {t("chart.no_data_reasons.reason_1")}
              </p>
              <ul className="text-sm text-gray-400 list-disc ml-6 mt-2 text-left">
                <li>{t("chart.no_data_reasons.reason_1")}</li>
                <li>{t("chart.no_data_reasons.reason_2")}</li>
                <li>{t("chart.no_data_reasons.reason_3")}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default FinanceChart;
