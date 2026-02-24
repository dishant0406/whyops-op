import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_BASE_URL;

  if (!authBaseUrl) {
    return NextResponse.next();
  }

  const cookie = request.headers.get("cookie") ?? "";
  const normalizedBaseUrl = authBaseUrl.replace(/\/$/, "");

  let sessionResponse: Response | null = null;
  interface SessionPayload {
    session?: unknown;
    user?: unknown;
    [key: string]: unknown;
  }
  let sessionPayload: SessionPayload | null = null;

  try {
    sessionResponse = await fetch(`${normalizedBaseUrl}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (sessionResponse.ok) {
      sessionPayload = await sessionResponse.json();
    }
  } catch (err) {
    console.error("proxy: failed to fetch session from auth service", err);
    // If the auth service is unreachable, allow the request to continue instead of throwing.
    // Treat as no session so that public routes still work and private routes won't crash the app.
    sessionResponse = null;
    sessionPayload = null;
  }
  const hasSession = Boolean(sessionPayload?.session || sessionPayload?.user);

  if (!hasSession && !isPublicRoute(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  if (!hasSession) {
    return NextResponse.next();
  }

  let userResponse: Response | null = null;
  interface UserPayload {
    data?: {
      onboardingComplete?: boolean;
      [key: string]: unknown;
    };
    onboardingComplete?: boolean;
    [key: string]: unknown;
  }
  let userPayload: UserPayload | null = null;

  try {
    userResponse = await fetch(`${normalizedBaseUrl}/api/users/me`, {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (userResponse.ok) {
      userPayload = await userResponse.json();
    }
  } catch (err) {
    console.error("proxy: failed to fetch user from auth service", err);
    userResponse = null;
    userPayload = null;
  }
  const onboardingComplete = Boolean(userPayload?.data?.onboardingComplete ?? userPayload?.onboardingComplete);

  if (!onboardingComplete && pathname !== "/onboarding") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/onboarding";
    return NextResponse.redirect(redirectUrl);
  }

  if (onboardingComplete && (pathname === "/" || pathname === "/onboarding")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/agents";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
