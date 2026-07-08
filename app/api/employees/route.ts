import { NextRequest, NextResponse } from "next/server";

interface ApiEmployee {
  emp_id: number;
  first_name_la: string;
  last_name_la: string;
  emp_code: string;
  status: string;
  gender: string;
  phone: string;
  email: string;
  image: string;
}

interface ApiEmployeeResponse {
  statusCode?: number;
  message?: string;
  data?: {
    total_record?: number;
    employees?: ApiEmployee[];
  };
}

// In-memory token promise cache to prevent redundant login calls during concurrent requests
let cachedTokenPromise: Promise<string> | null = null;

async function getExternalToken(urlApi: string, usernameApi: string, passwordApi: string): Promise<string> {
  if (cachedTokenPromise) {
    return cachedTokenPromise;
  }

  cachedTokenPromise = (async () => {
    try {
      const loginRes = await fetch(`${urlApi}/auth-svc/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameApi,
          password: passwordApi,
        }),
      });

      if (!loginRes.ok) {
        const loginErr = await loginRes.text();
        throw new Error(`External API login failed: ${loginErr}`);
      }

      const loginData = await loginRes.json();
      const token = loginData?.data?.accessToken;

      if (!token) {
        throw new Error("AccessToken not found in external login response");
      }

      return token;
    } catch (err) {
      cachedTokenPromise = null;
      throw err;
    }
  })();

  return cachedTokenPromise;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  if (!search) {
    return NextResponse.json(
      { message: "Search query is required" },
      { status: 400 },
    );
  }

  const urlApi = process.env.URL_API;
  const usernameApi = process.env.USERNAME_API;
  const passwordApi = process.env.PASSWORD_API;

  if (!urlApi || !usernameApi || !passwordApi) {
    console.error("External API config missing in frontend .env");
    return NextResponse.json(
      { message: "Configuration error" },
      { status: 500 },
    );
  }

  try {
    let token = await getExternalToken(urlApi, usernameApi, passwordApi);

    let employeeRes = await fetch(
      `${urlApi}/organization-svc/employee/get?search=${search}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // If token expired, refresh once and retry
    if (employeeRes.status === 401) {
      console.log("Cached token expired, refreshing external token...");
      cachedTokenPromise = null;
      token = await getExternalToken(urlApi, usernameApi, passwordApi);

      employeeRes = await fetch(
        `${urlApi}/organization-svc/employee/get?search=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
    }

    if (!employeeRes.ok) {
      const empErr = await employeeRes.text();
      console.error("External API fetch employee failed:", empErr);
      return NextResponse.json(
        { message: "Failed to query employee from external API" },
        { status: 502 },
      );
    }

    const employeeData: ApiEmployeeResponse = await employeeRes.json();
    const employees = employeeData?.data?.employees || [];

    // Format and return, including emp_code which is needed by frontend matching logic
    const formattedEmployees = employees.map((emp) => ({
      emp_id: emp.emp_id,
      first_name_la: emp.first_name_la,
      last_name_la: emp.last_name_la,
      emp_code: emp.emp_code,
      gender: emp.gender,
      phone: emp.phone,
      email: emp.email,
      image: emp.image
        ? `${urlApi}/organization-svc/employee/getEmpImg/${emp.emp_code}/${emp.image}`
        : null,
    }));

    return NextResponse.json(formattedEmployees);
  } catch (error: any) {
    console.error("Error calling external API:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 },
    );
  }

  const url = `${apiBaseUrl}/api/employees`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Error communicating with upstream server" },
      { status: 502 },
    );
  }
}
