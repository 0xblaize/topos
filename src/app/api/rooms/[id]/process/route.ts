import { NextResponse } from "next/server";
import { processRoomImage, startReplicatePrediction, AiBusyError, AiUnavailableError } from "@/lib/ai/provider";
import { getRoom, updateRoom } from "@/lib/rooms";
import { getSessionUser } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const room = await getRoom(session.id, id);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (!room.maskDataUrl) return NextResponse.json({ error: "Save a clutter mask first" }, { status: 400 });

  await updateRoom(session.id, id, { status: "processing", processingStartedAt: new Date().toISOString(), processingAttempts: room.processingAttempts + 1, processingErrorCode: undefined, processingErrorMessage: undefined });
  try {
    if (process.env.TOPOS_REPLICATE_WEBHOOK_URL) {
      const processingJobId = await startReplicatePrediction(room);
      const updatedRoom = await updateRoom(session.id, id, { processingJobId });
      return NextResponse.json({ room: updatedRoom, processing: true }, { status: 202 });
    }
    const cleanedImageDataUrl = await processRoomImage(room);
    const updatedRoom = await updateRoom(session.id, id, { cleanedImageDataUrl, status: "cleared", processingCompletedAt: new Date().toISOString(), processingJobId: undefined });
    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    const unavailable = error instanceof AiUnavailableError;
    const busy = error instanceof AiBusyError;
    const code = unavailable ? "ai_unavailable" : busy ? "ai_busy" : "processing_failed";
    const updatedRoom = await updateRoom(session.id, id, { status: unavailable ? "ai_unavailable" : "mask_ready", processingErrorCode: code, processingErrorMessage: unavailable || busy ? (error instanceof Error ? error.message : "AI service unavailable") : "AI processing failed" });
    return NextResponse.json({
      error: error instanceof Error ? error.message : "AI processing failed",
      code: unavailable ? "ai_unavailable" : busy ? "ai_busy" : "processing_failed",
      room: updatedRoom,
    }, { status: unavailable || busy ? 503 : 502 });
  }
}
