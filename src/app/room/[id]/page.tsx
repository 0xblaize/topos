import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SESSION_COOKIE, sessions } from "@/lib/authStore";
import { getRoom } from "@/lib/rooms";
import { RoomWorkspace } from "@/components/RoomWorkspace";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const username = token ? sessions.get(token) : undefined;
  if (!username) redirect("/");
  const { id } = await params;
  const room = getRoom(username, id);
  if (!room) notFound();
  return <RoomWorkspace initialRoom={room} />;
}
