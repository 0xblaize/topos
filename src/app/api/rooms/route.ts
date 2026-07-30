import { NextResponse } from "next/server";
import { createRoom, listRooms, updateRoom } from "@/lib/rooms";
import { getSessionUser } from "@/lib/session";
import { putDataUrl } from "@/lib/storage";

const MAX_IMAGE_LENGTH = 12_000_000;
const imageDataUrlPattern = /^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/;

export async function GET(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ rooms: await listRooms(session.id) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { name?: unknown; sourceImageDataUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const sourceImageDataUrl = typeof body.sourceImageDataUrl === "string" ? body.sourceImageDataUrl : "";
  if (!name || name.length > 80) return NextResponse.json({ error: "Enter a room name under 80 characters" }, { status: 400 });
  if (sourceImageDataUrl.length > MAX_IMAGE_LENGTH || !imageDataUrlPattern.test(sourceImageDataUrl)) {
    return NextResponse.json({ error: "Upload a supported JPEG, PNG, or WebP image under 9 MB" }, { status: 400 });
  }

  const room = await createRoom(session.id, name, sourceImageDataUrl);
  let asset;
  try {
    asset = await putDataUrl(`rooms/${room.id}/source`, sourceImageDataUrl);
  } catch {
    asset = undefined;
  }
  const updatedRoom = asset ? await updateRoom(session.id, room.id, { sourceImageKey: asset.key }) : room;
  return NextResponse.json({ room: updatedRoom }, { status: 201 });
}
