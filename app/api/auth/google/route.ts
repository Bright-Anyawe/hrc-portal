import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { getGoogleAuthorizationUrl } from "@/lib/google-auth";

const STATE_COOKIE = "hrc_google_oauth_state";
const NEXT_COOKIE = "hrc_google_oauth_next";

export async function GET(req: NextRequest) {
  const state = randomBytes(24).toString("base64url");
  const next = req.nextUrl.searchParams.get("next") ?? "/";

  const store = await cookies();

  const sanitizedNext = next.startsWith("/") ? next : "/";
  store.set(NEXT_COOKIE, sanitizedNext, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  store.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  return NextResponse.redirect(getGoogleAuthorizationUrl(state));
}