import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessions } from "@/lib/authStore";
import { DashboardView } from "@/components/DashboardView";

export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const username = token ? sessions.get(token) : undefined;

  if (!username) redirect("/");

  return <DashboardView username={username} />;
}
