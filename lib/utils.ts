import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Leaflet cannot be loaded on the server side"));
      return;
    }

    if ((window as any).L) {
      resolve((window as any).L);
      return;
    }

    // Load CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load JS
    const existingScript = document.getElementById("leaflet-js");
    if (existingScript) {
      const handler = () => resolve((window as any).L);
      existingScript.addEventListener("load", handler);
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      resolve((window as any).L);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export const ASSET_BASE_URL = (() => {
  const defaultUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4500";
  if (typeof window === "undefined") return defaultUrl;
  // If running in browser and URL is proxied under /backend, keep /backend prefix
  if (window.location.pathname.startsWith("/backend")) {
    return `${window.location.origin}/backend`;
  }
  // By returning empty string on client, Next.js rewrites (/upload/* -> backend) seamlessly proxy assets
  return "";
})();

export function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  const defaultBackend = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4500";
  if (typeof window === "undefined") {
    return defaultBackend;
  }
  const host = window.location.hostname;
  // In dev / LAN testing (localhost, 127.0.0.1, or local IPs like 192.168.x.x, 10.x.x.x, or port 4600):
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^192\.168\./.test(host) ||
    /^10\./.test(host) ||
    window.location.port === "4600"
  ) {
    try {
      const parsed = new URL(defaultBackend);
      // If backend was configured with localhost, adapt to client LAN IP with backend port
      if (host !== "localhost" && host !== "127.0.0.1" && parsed.hostname === "localhost") {
        return `${parsed.protocol}//${host}:${parsed.port || "4500"}`;
      }
      return defaultBackend;
    } catch {
      return defaultBackend;
    }
  }
  // In production behind reverse proxy (e.g. https://crm.edl.com.la)
  return window.location.origin;
}

export function getImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${ASSET_BASE_URL}${cleanPath}`;
}


