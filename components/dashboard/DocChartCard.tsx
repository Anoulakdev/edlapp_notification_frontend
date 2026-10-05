"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Radar as RadarChart } from "react-chartjs-2";
import { useTheme } from "next-themes";
import {
  LucideIcon,
  BarChart3,
  LineChart as LineChartIcon,
  Radar as RadarIcon,
} from "lucide-react";

// Register ChartJS modules once
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface MonthlyItem {
  monthName: string;
  monthNum: number;
  count: number;
}

export type ColorTheme = "amber" | "rose" | "purple" | "cyan";

interface DocChartCardProps {
  title: string;
  subtitle: string;
  items: MonthlyItem[];
  colorTheme: ColorTheme;
  icon: LucideIcon;
  loading?: boolean;
  year: number;
}

const themeStyles: Record<
  ColorTheme,
  {
    primary: string;
    border: string;
    bgFill: string;
    hoverBg: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    ringColor: string;
  }
> = {
  amber: {
    primary: "#f59e0b",
    border: "rgb(245, 158, 11)",
    bgFill: "rgba(245, 158, 11, 0.12)",
    hoverBg: "rgba(245, 158, 11, 0.85)",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    badgeText: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-500/20",
  },
  rose: {
    primary: "#ef4444",
    border: "rgb(239, 68, 68)",
    bgFill: "rgba(239, 68, 68, 0.12)",
    hoverBg: "rgba(239, 68, 68, 0.85)",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    badgeText: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    iconColor: "text-rose-600 dark:text-rose-400",
    ringColor: "ring-rose-500/20",
  },
  purple: {
    primary: "#8b5cf6",
    border: "rgb(139, 92, 246)",
    bgFill: "rgba(139, 92, 246, 0.12)",
    hoverBg: "rgba(139, 92, 246, 0.85)",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    badgeText: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    ringColor: "ring-purple-500/20",
  },
  cyan: {
    primary: "#06b6d4",
    border: "rgb(6, 182, 212)",
    bgFill: "rgba(6, 182, 212, 0.12)",
    hoverBg: "rgba(6, 182, 212, 0.85)",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    badgeText: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    ringColor: "ring-cyan-500/20",
  },
};

export function DocChartCard({
  title,
  subtitle,
  items = [],
  colorTheme,
  icon: Icon,
  loading = false,
  year,
}: DocChartCardProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [chartType, setChartType] = useState<"line" | "bar" | "radar">("line");

  const style = themeStyles[colorTheme] || themeStyles.amber;



  const labels = items.map((i) => i.monthName || `ເດືອນ ${i.monthNum}`);
  const dataValues = items.map((i) => i.count || 0);

  const gridColor = isDark
    ? "rgba(255, 255, 255, 0.06)"
    : "rgba(100, 116, 139, 0.08)";
  const tickColor = isDark
    ? "rgba(148, 163, 184, 0.75)"
    : "rgba(100, 116, 139, 0.75)";

  const chartOptions: ChartOptions<"line" | "bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: style.primary,
        borderWidth: 1.5,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => {
            return `📅 ເດືອນ: ${tooltipItems[0]?.label || ""}`;
          },
          label: (context) => {
            const val = context.parsed.y ?? 0;
            return ` ຈຳນວນ: ${val.toLocaleString()} ລາຍການ`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: tickColor,
          font: {
            size: 11,
            family: "var(--font-sans)",
          },
          precision: 0,
        },
        grid: {
          color: gridColor,
        },
      },
      x: {
        ticks: {
          color: tickColor,
          font: {
            size: 11,
            family: "var(--font-sans)",
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const lineChartData = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        borderColor: style.border,
        backgroundColor: style.bgFill,
        borderWidth: 2.5,
        pointBackgroundColor: style.border,
        pointBorderColor: isDark ? "#0f172a" : "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4.5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: style.border,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
        tension: 0.38,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        backgroundColor: style.hoverBg,
        borderColor: style.border,
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: style.border,
        barPercentage: 0.65,
      },
    ],
  };

  const radarChartData = {
    labels,
    datasets: [
      {
        label: title,
        data: dataValues,
        borderColor: style.border,
        backgroundColor: style.bgFill.replace("0.12", "0.25"),
        borderWidth: 2,
        pointBackgroundColor: style.border,
        pointBorderColor: isDark ? "#0f172a" : "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 3.5,
        pointHoverRadius: 6,
      },
    ],
  };

  const radarOptions: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.95)" : "rgba(30, 41, 59, 0.95)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: style.primary,
        borderWidth: 1.5,
        padding: 10,
        cornerRadius: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => {
            return `📅 ເດືອນ: ${tooltipItems[0]?.label || ""}`;
          },
          label: (context) => {
            const val = context.parsed.r ?? 0;
            return ` ຈຳນວນ: ${val.toLocaleString()} ລາຍການ`;
          },
        },
      },
    },
    scales: {
      r: {
        angleLines: {
          color: gridColor,
        },
        grid: {
          color: gridColor,
        },
        pointLabels: {
          color: tickColor,
          font: {
            size: 10,
            family: "var(--font-sans)",
          },
        },
        ticks: {
          backdropColor: "transparent",
          color: tickColor,
          font: {
            size: 9,
          },
          precision: 0,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="group relative rounded-3xl p-6 bg-[rgb(var(--card))] border border-[rgb(var(--border))] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${style.iconBg} ${style.iconColor}`}
          >
            <Icon className="w-6 h-6" strokeWidth={2.2} />
          </div>
          <div>
            <h3
              className="text-lg font-bold text-[rgb(var(--text-primary))]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h3>
            <p className="text-xs text-[rgb(var(--text-secondary))] mt-0.5 line-clamp-1">
              {subtitle} ({year})
            </p>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-xl bg-[rgb(var(--border))]/40 border border-[rgb(var(--border))]">
            <button
              type="button"
              onClick={() => setChartType("line")}
              title="ເສັ້ນກາຟິກ (Line Chart)"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === "line"
                  ? "bg-[rgb(var(--card))] text-[rgb(var(--text-primary))] shadow-xs"
                  : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              title="ແທ່ງກາຟິກ (Bar Chart)"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === "bar"
                  ? "bg-[rgb(var(--card))] text-[rgb(var(--text-primary))] shadow-xs"
                  : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setChartType("radar")}
              title="ໃຍແມງມຸມ 360° (Radar Chart)"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === "radar"
                  ? "bg-[rgb(var(--card))] text-[rgb(var(--text-primary))] shadow-xs"
                  : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
              }`}
            >
              <RadarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[280px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-3 border-t-transparent animate-spin"
              style={{ borderColor: `${style.primary} transparent transparent transparent` }}
            />
            <span className="text-xs text-[rgb(var(--text-secondary))]">
              ກຳລັງໂຫຼດຂໍ້ມູນ...
            </span>
          </div>
        ) : chartType === "line" ? (
          <Line data={lineChartData} options={chartOptions as any} />
        ) : chartType === "bar" ? (
          <Bar data={barChartData} options={chartOptions as any} />
        ) : (
          <RadarChart data={radarChartData} options={radarOptions as any} />
        )}
      </div>
    </div>
  );
}
