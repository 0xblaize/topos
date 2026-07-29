import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, SESSION_COOKIE } from "@/lib/authStore";
import { CaptureView } from "@/components/CaptureView";

export const dynamic = "force-dynamic";

export default async function CapturePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await getSession(token) : undefined;
  if (!session) redirect("/");
  return <CaptureView username={session.username} />;
}
