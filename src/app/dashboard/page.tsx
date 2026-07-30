import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, SESSION_COOKIE } from "@/lib/authStore";
import { listRoomSummaries } from "@/lib/rooms";
import { DashboardView } from "@/components/DashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await getSession(token) : undefined;
  if (!session) redirect("/");
  return <DashboardView username={session.username} rooms={await listRoomSummaries(session.id)} />;
}
