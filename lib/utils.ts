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

