import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ALLOWED_ROUTES: Record<number, string[]> = {
  1: [
    "/dashboard",
    "/users",
    "/role",
    "/sourcetype",
    "/meterstatus",
    "/syncdata",
  ],
  2: [
    "/users",
    "/turnoff",
    "/turnoffassign",
    "/emergency",
    "/emergencyassign",
    "/cutpower",
    "/cutpowerassign",
    "/registermeter",
    "/topic",
  ],
  3: [
    "/turnoff",
    "/turnoffassign",
    "/emergency",
    "/emergencyassign",
    "/cutpower",
    "/cutpowerassign",
    "/registermeter",
    "/topic",
  ],
  4: [
    "/users",
    "/turnoff",
    "/turnoffassign",
    "/emergency",
    "/emergencyassign",
    "/cutpower",
    "/cutpowerassign",
    "/registermeter",
  ],
  5: [
    "/turnoff",
    "/turnoffassign",
    "/emergency",
    "/emergencyassign",
    "/cutpower",
    "/cutpowerassign",
    "/registermeter",
  ],
};

// 2. Define default page for each role ID
const ROLE_DEFAULT_PAGES: Record<number, string> = {
  1: "/dashboard",
  2: "/users",
  3: "/turnoff",
  4: "/users",
  5: "/turnoff",
};

// 3. Define routes that require authentication
const GUARDED_ROUTES = [
  "/dashboard",
  "/users",
  "/role",
  "/sourcetype",
  "/meterstatus",
  "/syncdata",
  "/turnoff",
  "/turnoffassign",
  "/emergency",
  "/emergencyassign",
  "/cutpower",
  "/cutpowerassign",
  "/registermeter",
  "/topic",
];

// 4. Define auth routes (public but redirects to default page if logged in)
const AUTH_ROUTES = ["/signin", "/signup", "/resetpassword"];

// Helper function to decode JWT payload without external libraries (fully Edge compatible)
function getJwtPayload(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Retrieve the JWT token from the HTTP-only cookie
  const token = request.cookies.get("token")?.value;

  // Extract payload from token and verify expiration
  let payload: any = null;
  if (token) {
    payload = getJwtPayload(token);
    // If the token is expired, treat as unauthenticated
    if (payload && payload.exp && Date.now() >= payload.exp * 1000) {
      payload = null;
    }
  }

  const isAuthenticated = !!payload;
  const roleId = payload?.roleId ? Number(payload.roleId) : null;

  // 1. Handle auth routes (/signin, /signup, /resetpassword)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute) {
    if (isAuthenticated && roleId && ROLE_DEFAULT_PAGES[roleId]) {
      // Redirect logged-in users away from signin/signup/resetpassword to their default homepage
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_PAGES[roleId], request.url),
      );
    }
    return NextResponse.next();
  }

  // 2. Handle root route (/)
  if (pathname === "/") {
    if (isAuthenticated && roleId && ROLE_DEFAULT_PAGES[roleId]) {
      return NextResponse.redirect(
        new URL(ROLE_DEFAULT_PAGES[roleId], request.url),
      );
    }
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 3. Handle guarded routes
  const isGuardedRoute = GUARDED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  if (isGuardedRoute) {
    if (!isAuthenticated) {
      // Not logged in -> redirect to /signin
      return NextResponse.redirect(new URL("/signin", request.url));
    }

    if (roleId === null || !ROLE_ALLOWED_ROUTES[roleId]) {
      // Logged in but has invalid/no role -> clear session / redirect to signin
      const response = NextResponse.redirect(new URL("/signin", request.url));
      response.cookies.delete("token");
      return response;
    }

    // Check if user's role is allowed on this specific route prefix
    const isAllowed = ROLE_ALLOWED_ROUTES[roleId].some((route) =>
      pathname.startsWith(route),
    );
    if (!isAllowed) {
      // Unauthorized -> redirect to standard unauthorized page
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // 4. Handle any other page (e.g., /profile, /settings, /error404, /unauthorized)
  // These are standard pages that require authentication, except for /error404 and /unauthorized which can be open
  if (pathname !== "/error404" && pathname !== "/unauthorized") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

// See Next.js Middleware Matcher docs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.png (system icons)
     * - png/svg/jpg/jpeg/gif/webp/ico/woff/woff2 (common static files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:png|svg|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};
