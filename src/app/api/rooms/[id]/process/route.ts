import { NextResponse } from "next/server";
import { processRoomImage, AiUnavailableError } from "@/lib/ai/provider";
import { getRoom, updateRoom } from "@/lib/rooms";
import { getSessionUsername } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const owner = getSessionUsername(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const room = getRoom(owner, id);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (!room.maskDataUrl) return NextResponse.json({ error: "Save a clutter mask first" }, { status: 400 });

  updateRoom(owner, id, { status: "processing" });
  try {
    const cleanedImageDataUrl = await processRoomImage(room);
    const updatedRoom = updateRoom(owner, id, {
      cleanedImageDataUrl,
      objectsRemoved: 1,
      status: "cleared",
    });
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    const unavailable = error instanceof AiUnavailableError;
    const updatedRoom = updateRoom(owner, id, { status: unavailable ? "ai_unavailable" : "mask_ready" });
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI processing failed",
      code: unavailable ? "ai_unavailable" : "processing_failed",
      room: updatedRoom,
    }, { status: unavailable ? 503 : 502 });
  }
}
