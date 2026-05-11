import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];
const PUBLIC_PAGES = ["/login", "/signup", "/privacy", "/terms"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("pace-session");

  // Authenticated user hitting auth pages → redirect to app
  if (hasSession && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated user hitting protected pages → redirect to login
  if (!hasSession && !PUBLIC_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
