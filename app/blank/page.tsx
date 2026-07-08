import { FileText } from "lucide-react";

export default function BlankPage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Blank Page
        </h1>
        <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          Use this as a starting point for your new page.
        </p>
      </div>

      <div
        className="rounded-2xl border flex flex-col items-center justify-center py-32 text-center"
        style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(var(--brand), 0.08)" }}
        >
          <FileText className="w-9 h-9" style={{ color: "rgb(var(--brand))" }} />
        </div>
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
        >
          Blank Page
        </h2>
        <p className="text-sm max-w-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          This is a blank page template. Start building your content here by adding components and layouts.
        </p>
        <button
          className="mt-8 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "rgb(var(--brand))", boxShadow: "0 4px 12px rgba(var(--brand),0.3)" }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Blank",
};
