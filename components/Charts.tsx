"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  title: string;
  subtitle?: string;
}

export function RevenueChart({ title, subtitle }: ChartProps) {
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(100, 116, 139, 0.1)",
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.6)",
          font: {
            size: 12,
          },
          callback: function (value) {
            return "$" + Number(value).toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.6)",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 15000, 18500, 16200, 21000, 24500, 22300],
        borderColor: "rgb(61, 109, 255)",
        backgroundColor: "rgba(61, 109, 255, 0.08)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(61, 109, 255)",
        pointBorderColor: "white",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
    >
      <div className="mb-6">
        <h3
          className="text-base font-bold"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ height: "300px" }}>
        <Line data={data} options={chartOptions} />
      </div>
    </div>
  );
}

export function OrdersChart({ title, subtitle }: ChartProps) {
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(100, 116, 139, 0.1)",
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.6)",
          font: {
            size: 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(100, 116, 139, 0.6)",
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Orders",
        data: [45, 52, 48, 61, 55, 67, 58],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
    >
      <div className="mb-6">
        <h3
          className="text-base font-bold"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ height: "300px" }}>
        <Bar data={data} options={chartOptions} />
      </div>
    </div>
  );
}

export function CustomerDistributionChart({ title, subtitle }: ChartProps) {
  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "rgba(100, 116, 139, 0.7)",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = Number(context.parsed as unknown) || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const data = {
    labels: ["Premium", "Standard", "Free", "Trial"],
    datasets: [
      {
        data: [4500, 6200, 8100, 2700],
        backgroundColor: [
          "rgba(61, 109, 255, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderColor: [
          "rgb(61, 109, 255)",
          "rgb(34, 197, 94)",
          "rgb(245, 158, 11)",
          "rgb(168, 85, 247)",
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
    >
      <div className="mb-6">
        <h3
          className="text-base font-bold"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Doughnut data={data} options={chartOptions} />
      </div>
    </div>
  );
}

export function TrafficSourceChart({ title, subtitle }: ChartProps) {
  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "rgba(100, 116, 139, 0.7)",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        usePointStyle: true,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = Number(context.parsed as unknown) || 0;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  const data = {
    labels: ["Organic", "Direct", "Referral", "Social", "Paid"],
    datasets: [
      {
        data: [3500, 2100, 1800, 1200, 900],
        backgroundColor: [
          "rgba(61, 109, 255, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(61, 109, 255)",
          "rgb(34, 197, 94)",
          "rgb(245, 158, 11)",
          "rgb(168, 85, 247)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
    >
      <div className="mb-6">
        <h3
          className="text-base font-bold"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Doughnut data={data} options={chartOptions} />
      </div>
    </div>
  );
}
