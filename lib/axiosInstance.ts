/**
 * axiosInstance.ts
 *
 * Client-side axios instance.
 * - ใช้ใน Client Components ("use client") และ custom hooks
 * - token เป็น httpOnly cookie → browser ส่งให้อัตโนมัติผ่าน withCredentials
 * - เมื่อได้รับ 401 จะ redirect ไป /signin อัตโนมัติ
 */

import axios from "axios";

// On client-side (in the browser), use relative URL "/api" to route requests through Next.js rewrites proxy.
// On server-side (if run in SSR/builds), use process.env.NEXT_PUBLIC_API_BASE_URL.
const API_BASE_URL = typeof window === "undefined"
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : "";

export const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response Interceptor: Handle common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Redirect to signin if unauthorized on the client-side
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
