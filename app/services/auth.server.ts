import type { User } from "@prisma/client";
import type { LoaderFunctionArgs } from "react-router";
import { UserRole } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "react-router";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";
import prisma from "./db.server";

export const authenticator = new Authenticator<User>();

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    invariant(typeof email === "string", "Email must be a string");
    invariant(email.length > 0, "Email must not be empty");
    invariant(typeof password === "string", "Password must be a string");
    invariant(password.length > 0, "Password must not be empty");
    const user = await login({ email, password });
    if (!user) {
      throw new Error("Invalid email or password");
    }
    return user;
  }),
  "FormStrategy",
);

type EmailPassword = {
  email: string;
  password: string;
};

export async function login({ email, password }: EmailPassword) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }
  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return null;
  }
  return user;
}

export async function register({ email, password }: EmailPassword) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: passwordHash, role: UserRole.USER },
  });
  if (!user) {
    return null;
  }
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    name: "spiritevents_session",
    path: "/",
    sameSite: "lax",
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export async function requireUserSession(
  request: LoaderFunctionArgs["request"],
) {
  const cookie = request.headers.get("cookie");
  const session = await getSession(cookie);
  if (!session.has("user")) {
    const requestUrl = new URL(request.url);
    throw redirect(`/sign-in?originRoute=${requestUrl.pathname}`);
  }
  return session;
}

export async function authenticate(request: Request, redirectTo?: string) {
  let session = await getSession(request.headers.get("cookie"));
  let user = session.get("user");
  if (user) {
    if (redirectTo) throw redirect(redirectTo);
    return user;
  } else {
    return null;
  }
}
