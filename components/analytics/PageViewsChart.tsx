export function PageViewsChart() {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
      }}
    >
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "rgb(var(--text-primary))" }}
      >
        Page Views (Last 7 Days)
      </h3>
      <div className="space-y-4">
        {[
          { day: "Monday", views: 8520, percentage: 85 },
          { day: "Tuesday", views: 9210, percentage: 92 },
          { day: "Wednesday", views: 7850, percentage: 78 },
          { day: "Thursday", views: 10120, percentage: 100 },
          { day: "Friday", views: 8960, percentage: 89 },
          { day: "Saturday", views: 7230, percentage: 72 },
          { day: "Sunday", views: 6450, percentage: 64 },
        ].map((item) => (
          <div key={item.day}>
            <div className="flex items-center justify-between mb-1.5">
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {item.day}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {item.views}
              </p>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "rgb(var(--bg))" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percentage}%`,
                  background: "rgb(var(--brand))",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
