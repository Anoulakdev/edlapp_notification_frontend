const recentActivity = [
  { user: "Sarah Johnson", action: "Placed a new order", time: "2 min ago", avatar: "SJ", color: "61 109 255" },
  { user: "Mark Torres", action: "Updated their profile", time: "15 min ago", avatar: "MT", color: "34 197 94" },
  { user: "Priya Nair", action: "Submitted a support ticket", time: "1 hr ago", avatar: "PN", color: "245 158 11" },
  { user: "Daniel Kim", action: "Cancelled subscription", time: "3 hr ago", avatar: "DK", color: "239 68 68" },
  { user: "Lisa Chen", action: "Upgraded to Pro plan", time: "5 hr ago", avatar: "LC", color: "168 85 247" },
];

export function RecentActivity() {
  return (
    <div
      className="lg:col-span-2 rounded-2xl p-6"
      style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-base font-bold"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            Recent Activity
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
            Latest user events
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "rgb(34 197 94)" }}
          />
          <span className="text-xs" style={{ color: "rgb(34 197 94)" }}>
            Live
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {recentActivity.map((item) => (
          <div key={item.user + item.time} className="flex items-center gap-4">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: `rgb(${item.color})` }}
            >
              {item.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {item.user}
              </div>
              <div className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                {item.action}
              </div>
            </div>
            <div
              className="text-xs shrink-0"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              {item.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
