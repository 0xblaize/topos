import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSession, SESSION_COOKIE } from "@/lib/authStore";
import { getRoom } from "@/lib/rooms";
import { RoomWorkspace } from "@/components/RoomWorkspace";

export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = token ? await getSession(token) : undefined;
  if (!session) redirect("/");
  const { id } = await params;
  const room = await getRoom(session.id, id);
  if (!room) notFound();
  return <RoomWorkspace initialRoom={room} />;
}
