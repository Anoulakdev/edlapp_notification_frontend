import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Call NestJS backend endpoint (which returns { token, user })
    const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
      username,
      password,
    });

    const { token, user } = response.data;

    // Save token inside a secure HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Next.js Proxy Login API error:", error.message);
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ຫາລະບົບ";
    return NextResponse.json({ success: false, message }, { status });
  }
}
