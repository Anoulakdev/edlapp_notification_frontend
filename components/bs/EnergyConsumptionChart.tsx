"use client";

import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { BsEnergyItem } from "@/schemas/bs";
import { Zap, BarChart3, TrendingUp } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnergyConsumptionChartProps {
  energyList: BsEnergyItem[];
  className?: string;
}

export function EnergyConsumptionChart({
  energyList,
  className,
}: EnergyConsumptionChartProps) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // Format label and sort items chronologically
  const chartData = useMemo(() => {
    if (!energyList || energyList.length === 0) return null;

    // Clone and sort chronologically (oldest to newest)
    const sorted = [...energyList].sort((a, b) => {
      const yearA =
        a.bill_no && a.bill_no.length >= 4
          ? parseInt(a.bill_no.slice(-4), 10) || 0
          : 0;
      const yearB =
        b.bill_no && b.bill_no.length >= 4
          ? parseInt(b.bill_no.slice(-4), 10) || 0
          : 0;
      const monthA = parseInt(a.months, 10) || 0;
      const monthB = parseInt(b.months, 10) || 0;

      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    const labels = sorted.map((item) => {
      const year =
        item.bill_no && item.bill_no.length >= 4 ? item.bill_no.slice(-4) : "";
      const month = item.months ? String(item.months).padStart(2, "0") : "";
      return year ? `${month}/${year}` : month;
    });

    const consumptions = sorted.map((item) => Number(item.consumption) || 0);

    const totalConsumption = consumptions.reduce((a, b) => a + b, 0);
    const avgConsumption =
      consumptions.length > 0
        ? Math.round(totalConsumption / consumptions.length)
        : 0;
    const maxConsumption =
      consumptions.length > 0 ? Math.max(...consumptions) : 0;
    const minConsumption =
      consumptions.length > 0 ? Math.min(...consumptions) : 0;

    return {
      sorted,
      labels,
      consumptions,
      avgConsumption,
      maxConsumption,
      minConsumption,
      totalConsumption,
    };
  }, [energyList]);

  if (!chartData || chartData.labels.length === 0) {
    return null;
  }

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        padding: 14,
        titleColor: "#ffffff",
        titleFont: {
          size: 13,
          weight: "bold",
          family: "'Noto Sans Lao', sans-serif",
        },
        bodyColor: "#e2e8f0",
        bodyFont: {
          size: 12,
          family: "'Noto Sans Lao', sans-serif",
        },
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        cornerRadius: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items) => {
            const label = items[0]?.label || "";
            return `ງວດເດືອນ: ${label}`;
          },
          label: (context) => {
            const val = context.parsed.y || 0;
            return `ການຊົມໃຊ້: ${val.toLocaleString()} kWh`;
          },
          afterLabel: (context) => {
            const index = context.dataIndex;
            const item = chartData.sorted[index];
            if (item) {
              const amount = Number(item.bill_amount) || 0;
              const billNo = item.bill_no || "-";
              return `ຍອດເງິນບິນ: ${amount.toLocaleString()} ກີບ\nເລກທີບິນ: ${billNo}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.12)",
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.8)",
          font: {
            size: 10,
            family: "'Noto Sans Lao', sans-serif",
          },
          maxTicksLimit: 6,
          callback: (value) => `${Number(value).toLocaleString()} kWh`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.8)",
          font: {
            size: 10,
            weight: "bold",
            family: "'Noto Sans Lao', sans-serif",
          },
          autoSkip: true,
          maxTicksLimit: 12,
          maxRotation: 45,
          minRotation: 0,
        },
      },
    },
  };

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "ການຊົມໃຊ້ໄຟຟ້າ (kWh)",
        data: chartData.consumptions,
        backgroundColor:
          chartType === "bar"
            ? "rgba(59, 130, 246, 0.75)"
            : "rgba(59, 130, 246, 0.12)",
        borderColor: "#2563eb",
        borderWidth: chartType === "bar" ? 0 : 2.5,
        borderRadius: chartType === "bar" ? 8 : 0,
        hoverBackgroundColor: "#1d4ed8",
        tension: 0.35,
        fill: chartType === "line",
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: chartType === "line" ? 4 : 0,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className={className || "p-3.5 sm:p-6 space-y-3.5 sm:space-y-4"}>
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>ກຣາຟສະຖິຕິການຊົມໃຊ້ໄຟຟ້າ</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Energy Consumption ({chartData.labels.length} ງວດ)
            </p>
          </div>
        </div>

        {/* Stats Badges & Chart Type Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType("line")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartType === "line"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Area</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72 md:h-80 pt-1 sm:pt-2">
        {chartType === "bar" ? (
          <Bar data={data as any} options={chartOptions as any} />
        ) : (
          <Line data={data as any} options={chartOptions as any} />
        )}
      </div>
    </div>
  );
}
