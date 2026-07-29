import { getSession, SESSION_COOKIE } from "@/lib/authStore";

export async function getSessionUser(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  return token ? getSession(token) : undefined;
}

export async function getSessionToken(request: Request) {
  return request.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
}
