const topPages = [
  { page: "/dashboard", views: "12,543", pct: 85 },
  { page: "/products", views: "9,210", pct: 62 },
  { page: "/users", views: "7,830", pct: 53 },
  { page: "/analytics", views: "5,421", pct: 37 },
  { page: "/settings", views: "2,103", pct: 14 },
];

export function TopPages() {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
    >
      <div className="mb-6">
        <h2
          className="text-base font-bold"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Top Pages
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
          By page views this week
        </p>
      </div>
      <div className="space-y-4">
        {topPages.map((page) => (
          <div key={page.page}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-xs font-mono font-medium"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {page.page}
              </span>
              <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                {page.views}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgb(var(--border))" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${page.pct}%`,
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
