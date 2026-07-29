import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessions } from "@/lib/authStore";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(/topos_session=([^;]+)/)?.[1];
  if (token) sessions.delete(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
