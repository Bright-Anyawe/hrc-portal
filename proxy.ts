import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "hrc_session";

const ROLE_HOMES: Record<string, string> = {
  ADMIN: "/admin",
  CONSULTANT: "/staff",
  CLIENT: "/client",
};

const ROLE_BY_PREFIX: Record<string, string> = {
  "/admin": "ADMIN",
  "/staff": "CONSULTANT",
  "/client": "CLIENT",
};

const PROTECTED_PREFIXES = ["/admin", "/staff", "/client"];

async function getRoleFromToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;
    return role && ROLE_HOMES[role] ? role : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/login") {
    const role = await getRoleFromToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (role) return NextResponse.redirect(new URL(ROLE_HOMES[role], req.url));
    return NextResponse.next();
  }

  const prefix = PROTECTED_PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (prefix) {
    const role = await getRoleFromToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== ROLE_BY_PREFIX[prefix]) {
      return NextResponse.redirect(new URL(ROLE_HOMES[role], req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/staff/:path*",
    "/client/:path*",
  ],
};
