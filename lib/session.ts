import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { config } from "./config";
import { ForbiddenError, UnauthorizedError } from "./errors";
import type { Role, SessionUser } from "@/types";

export interface SessionData {
  user?: string;
  role?: Role;
  name?: string;
}

function sessionOptions(): SessionOptions {
  return {
    cookieName: "mav_session",
    password: config.session.secret(),
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session.user || !session.role || !session.name) return null;
  return { user: session.user, role: session.role, name: session.name };
}

/** Throws UnauthorizedError if nobody is logged in. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** Throws UnauthorizedError/ForbiddenError unless the session matches the given role. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) throw new ForbiddenError();
  return user;
}
