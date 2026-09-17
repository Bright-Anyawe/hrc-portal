import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { ROLE_HOMES } from "@/lib/rbac";
import { getCallbackUrl } from "@/lib/google-auth";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
} from "@/lib/google-auth";
import { handleUserSignupStrategy } from "@/lib/welcome";

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
  const nextPath = store.get(NEXT_COOKIE)?.value ?? null;

  store.delete(STATE_COOKIE);
  store.delete(NEXT_COOKIE);

  if (!code || !returnedState || !expectedState || returnedState !== expectedState) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  let googleUser;
  try {
    const { access_token } = await exchangeCodeForTokens(
      code,
      getCallbackUrl(req.nextUrl.origin)
    );
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

  let user = existingByGoogle;
  let isNewSignup = false;

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId: googleUser.sub },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: googleUser.name || "Client",
          email,
          googleId: googleUser.sub,
          role: "CLIENT",
        },
      });
      isNewSignup = true;
    }
  }

  if (isNewSignup && user) {
    await handleUserSignupStrategy({
      user: { id: user.id, name: user.name, email: user.email },
      signupMethod: "google",
    });
  }

  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const target = nextPath && nextPath.startsWith("/") ? nextPath : ROLE_HOMES[user.role];
  return NextResponse.redirect(new URL(target, req.url));
}