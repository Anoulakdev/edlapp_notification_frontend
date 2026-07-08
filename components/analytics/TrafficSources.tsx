export function TrafficSources() {
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
        Traffic Sources
      </h3>
      <div className="space-y-4">
        {[
          { source: "Organic Search", visitors: 45210, color: "61 109 255" },
          { source: "Direct", visitors: 28340, color: "34 197 94" },
          { source: "Social Media", visitors: 18920, color: "245 158 11" },
          { source: "Referral", visitors: 12450, color: "168 85 247" },
          { source: "Paid Ads", visitors: 8910, color: "239 68 68" },
        ].map((item) => (
          <div key={item.source}>
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {item.source}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {item.visitors}
              </p>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "rgb(var(--bg))" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.visitors / 45210) * 100}%`,
                  background: `rgb(${item.color})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
