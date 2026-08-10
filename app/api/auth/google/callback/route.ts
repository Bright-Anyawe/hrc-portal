import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { ROLE_HOMES } from "@/lib/rbac";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
} from "@/lib/google-auth";

const STATE_COOKIE = "hrc_google_oauth_state";
const NEXT_COOKIE = "hrc_google_oauth_next";

export async function GET(req: NextRequest) {
  const store = await cookies();

  const error = req.nextUrl.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, req.url)
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  const returnedState = req.nextUrl.searchParams.get("state");
  const expectedState = store.get(STATE_COOKIE)?.value;

  store.delete(STATE_COOKIE);
  store.delete(NEXT_COOKIE);

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let googleUser;
  try {
    const { access_token } = await exchangeCodeForTokens(code);
    googleUser = await fetchGoogleUserInfo(access_token);
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }

  if (!googleUser.email_verified) {
    return NextResponse.redirect(new URL("/login?error=google_email_unverified", req.url));
  }

  const email = googleUser.email.toLowerCase();

  const existingByGoogle = await prisma.user.findUnique({
    where: { googleId: googleUser.sub },
  });

  const user = existingByGoogle
    ? existingByGoogle
    : await prisma.user.upsert({
        where: { email },
        update: { googleId: googleUser.sub },
        create: {
          name: googleUser.name,
          email,
          googleId: googleUser.sub,
          role: "CLIENT",
        },
      });

  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const nextPath = store.get(NEXT_COOKIE)?.value ?? null;
  const target = nextPath && nextPath.startsWith("/") ? nextPath : ROLE_HOMES[user.role];
  return NextResponse.redirect(new URL(target, req.url));
}