import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!token) {
    return NextResponse.json({ message: "No token" }, { status: 401 });
  }

  if (!apiBaseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not defined");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  // Next.js connects to the NestJS backend
  const url = `${apiBaseUrl}/api/auth/me`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { message: "Invalid response from upstream server" },
        { status: 502 },
      );
    }

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error communicating with upstream server" },
      { status: 502 },
    );
  }
}
