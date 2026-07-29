import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessions } from "@/lib/authStore";
import { CaptureView } from "@/components/CaptureView";

export default async function CapturePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const username = token ? sessions.get(token) : undefined;
  if (!username) redirect("/");
  return <CaptureView username={username} />;
}
