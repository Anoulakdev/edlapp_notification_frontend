export function TopPagesTable() {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
      }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgb(var(--border))" }}>
        <h3
          className="text-lg font-semibold"
          style={{ color: "rgb(var(--text-primary))" }}
        >
          Top Pages
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
        {[
          { page: "/dashboard", views: 12543, traffic: "28.5%" },
          { page: "/products", views: 9210, traffic: "20.8%" },
          { page: "/pricing", views: 7830, traffic: "17.7%" },
          { page: "/blog", views: 5421, traffic: "12.3%" },
          { page: "/about", views: 3856, traffic: "8.7%" },
        ].map((item) => (
          <div key={item.page} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {item.page}
              </p>
              <p
                className="text-xs"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {item.views.toLocaleString()} views
              </p>
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: "rgb(var(--brand))" }}
            >
              {item.traffic}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
