import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/generated/prisma/enums";

export const SESSION_COOKIE = "hrc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: Role;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function verifySession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role as Role;
    if (!["ADMIN", "CONSULTANT", "CLIENT"].includes(role)) return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role,
    };
  } catch {
    return null;
  }
}
