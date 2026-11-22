import { NextResponse } from "next/server";

const ALLOWED_LOCALES = ["en", "fr", "ar"];
const DEFAULT_LOCALE = "fr";
const LOCALE_COOKIE = "preferred_locale";

function isPublicFile(pathname) {
  return /\.[^/]+$/.test(pathname);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_LOCALE}`, request.url),
      308,
    );
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  // valid locale => allow
  if (ALLOWED_LOCALES.includes(firstSegment)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, firstSegment, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  // Invalid top-level locale-like path: let route resolution handle it.
  // The [local] layout enforces allowed locales and returns 404 for garbage paths.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
