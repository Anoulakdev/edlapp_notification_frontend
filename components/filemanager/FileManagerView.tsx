"use client";

import { useState } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileImage,
  Film,
  Music,
  Code,
  Download,
  Trash2,
  Upload,
  Grid,
  List,
  Search,
  ChevronRight,
  MoreHorizontal,
  Plus,
} from "lucide-react";

import { FileItem } from "@/schemas/fileItem";

const ROOT_FILES: FileItem[] = [
  { id: 1, name: "Projects", type: "folder", modified: "Mar 15, 2026", items: 12 },
  { id: 2, name: "Design Assets", type: "folder", modified: "Mar 14, 2026", items: 34 },
  { id: 3, name: "Documents", type: "folder", modified: "Mar 13, 2026", items: 8 },
  { id: 4, name: "hero-banner.png", type: "image", size: "2.4 MB", modified: "Mar 12, 2026" },
  { id: 5, name: "product-demo.mp4", type: "video", size: "128 MB", modified: "Mar 11, 2026" },
  { id: 6, name: "brand-guidelines.pdf", type: "doc", size: "4.1 MB", modified: "Mar 10, 2026" },
  { id: 7, name: "landing-jingle.mp3", type: "audio", size: "3.2 MB", modified: "Mar 9, 2026" },
  { id: 8, name: "app-screenshot.png", type: "image", size: "1.1 MB", modified: "Mar 8, 2026" },
  { id: 9, name: "index.tsx", type: "code", size: "14 KB", modified: "Mar 7, 2026" },
  { id: 10, name: "report-q1.docx", type: "doc", size: "892 KB", modified: "Mar 6, 2026" },
  { id: 11, name: "archive.zip", type: "file", size: "56 MB", modified: "Mar 5, 2026" },
  { id: 12, name: "Uploads", type: "folder", modified: "Mar 4, 2026", items: 5 },
];

const typeIcon = (type: FileItem["type"], isOpen = false) => {
  switch (type) {
    case "folder": return isOpen ? FolderOpen : Folder;
    case "image": return FileImage;
    case "video": return Film;
    case "audio": return Music;
    case "doc": return FileText;
    case "code": return Code;
    default: return File;
  }
};

const typeColor = (type: FileItem["type"]) => {
  switch (type) {
    case "folder": return "245 158 11"; // yellow
    case "image": return "34 197 94";  // green
    case "video": return "239 68 68";  // red
    case "audio": return "168 85 247"; // purple
    case "doc": return "61 109 255";   // brand
    case "code": return "20 184 166";  // teal
    default: return "140 155 185";
  }
};

export function FileManagerView() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [files, setFiles] = useState(ROOT_FILES);

  const displayedFiles = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setActiveMenu(null);
  };

  const isSelected = (id: number) => selected.includes(id);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            File Manager
          </h1>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            {ROOT_FILES.length} items · 4 folders · 8 files
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={{ background: "transparent", borderColor: "rgb(var(--border))", color: "rgb(var(--text-secondary))" }}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "rgb(var(--brand))", boxShadow: "0 4px 12px rgba(var(--brand),0.3)" }}
          >
            <Plus className="w-4 h-4" />
            New Folder
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex items-center gap-3 mb-6 p-3 rounded-2xl border flex-wrap"
        style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
          <span className="font-medium cursor-pointer" style={{ color: "rgb(var(--brand))" }}>Home</span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgb(var(--text-secondary))" }} />
          <span style={{ color: "rgb(var(--text-secondary))" }}>All Files</span>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgb(var(--bg))", border: "1px solid rgb(var(--border))" }}
        >
          <Search className="w-3.5 h-3.5" style={{ color: "rgb(var(--text-secondary))" }} />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="outline-none text-sm w-36"
            style={{ background: "transparent", color: "rgb(var(--text-primary))" }}
          />
        </div>

        {/* View toggle */}
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: "1px solid rgb(var(--border))" }}
        >
          {(["grid", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="w-9 h-9 flex items-center justify-center transition-all"
              style={{
                background: view === v ? "rgb(var(--brand))" : "rgb(var(--bg))",
                color: view === v ? "white" : "rgb(var(--text-secondary))",
              }}
            >
              {v === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
              {selected.length} selected
            </span>
            <button
              onClick={() => {
                setFiles(prev => prev.filter(f => !selected.includes(f.id)));
                setSelected([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: "rgba(var(--danger), 0.1)", color: "rgb(var(--danger))" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* File Grid */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayedFiles.map(file => {
            const Icon = typeIcon(file.type);
            const color = typeColor(file.type);
            const sel = isSelected(file.id);
            return (
              <div
                key={file.id}
                onClick={(e) => toggleSelect(file.id, e)}
                className="relative flex flex-col items-center p-4 rounded-2xl border cursor-pointer transition-all group"
                style={{
                  background: sel ? `rgba(${color}, 0.08)` : "rgb(var(--card))",
                  borderColor: sel ? `rgb(${color})` : "rgb(var(--border))",
                  boxShadow: sel ? `0 0 0 2px rgba(${color},0.2)` : "none",
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: `rgba(${color}, 0.12)` }}
                >
                  <Icon className="w-7 h-7" style={{ color: `rgb(${color})` }} />
                </div>
                <p
                  className="text-xs font-medium text-center truncate w-full"
                  style={{ color: "rgb(var(--text-primary))" }}
                >
                  {file.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
                  {file.size ?? `${file.items} items`}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* File List */
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--border))" }}
        >
          {/* List header */}
          <div
            className="grid grid-cols-12 px-4 py-3 border-b text-xs font-semibold uppercase tracking-wide"
            style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--text-secondary))" }}
          >
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Modified</div>
          </div>
          {displayedFiles.map(file => {
            const Icon = typeIcon(file.type);
            const color = typeColor(file.type);
            const sel = isSelected(file.id);
            return (
              <div
                key={file.id}
                onClick={(e) => toggleSelect(file.id, e)}
                className="grid grid-cols-12 px-4 py-3 border-b last:border-b-0 items-center cursor-pointer transition-all group"
                style={{
                  borderColor: "rgb(var(--border))",
                  background: sel ? `rgba(${color}, 0.06)` : "transparent",
                }}
                onMouseEnter={e => { if (!sel)(e.currentTarget as HTMLDivElement).style.background = "rgb(var(--bg))"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = sel ? `rgba(${color}, 0.06)` : "transparent"; }}
              >
                <div className="col-span-6 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `rgba(${color}, 0.12)` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: `rgb(${color})` }} />
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                    {file.name}
                  </span>
                </div>
                <div className="col-span-2 text-xs capitalize" style={{ color: "rgb(var(--text-secondary))" }}>
                  {file.type}
                </div>
                <div className="col-span-2 text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                  {file.size ?? `${file.items} items`}
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                    {file.modified}
                  </span>
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: "rgb(var(--text-secondary))" }}
                    onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === file.id ? null : file.id); }}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
