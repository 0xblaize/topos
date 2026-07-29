import { SESSION_COOKIE, sessions } from "@/lib/authStore";

export function getSessionUsername(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
  return token ? sessions.get(token) : undefined;
}
