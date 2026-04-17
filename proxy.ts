import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/signin"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) return;
  if (PUBLIC_ROUTES.has(pathname)) {
    if (req.auth) return NextResponse.redirect(new URL("/", req.nextUrl));
    return;
  }

  if (!req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl);
    if (pathname !== "/") signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
