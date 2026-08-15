import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/AppLayout";
import { Noto_Sans_Lao, Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-lao",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "AdminOS",
  },
  description: "Modern Admin Dashboard Template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans",
        notoSansLao.variable,
        syne.variable,
        dmSans.variable,
        jetbrainsMono.variable
      )}
    >
      <head />
      <body className="min-h-screen relative">
        {/* Modern Smooth Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-theme-bg transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[rgba(var(--brand),0.05)]"></div>

          {/* Animated Glowing Orbs - Soft Mesh Gradient with GPU Acceleration */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[rgba(var(--brand),0.12)] rounded-full blur-[120px] animate-blob transform-gpu will-change-transform"></div>
          <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-[rgba(56,189,248,0.12)] rounded-full blur-[120px] animate-blob transform-gpu will-change-transform" style={{ animationDelay: '2000ms' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-[rgba(99,102,241,0.12)] rounded-full blur-[120px] animate-blob transform-gpu will-change-transform" style={{ animationDelay: '4000ms' }}></div>
        </div>

        <ThemeProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <ToastContainer position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
