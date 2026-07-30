import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  if (token) await deleteSession(token);

  const { origin } = await getRpConfig();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(origin.startsWith("https://")), maxAge: 0 });
  return res;
}
