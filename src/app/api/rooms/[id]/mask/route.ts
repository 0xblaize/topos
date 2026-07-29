import { NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { getSessionUser } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };
const maskPattern = /^data:image\/(png|webp);base64,[a-zA-Z0-9+/=]+$/;

export async function POST(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!(await getRoom(session.id, id))) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  let body: { maskDataUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const maskDataUrl = typeof body.maskDataUrl === "string" ? body.maskDataUrl : "";
  if (!maskPattern.test(maskDataUrl) || maskDataUrl.length > 12_000_000) return NextResponse.json({ error: "Invalid mask" }, { status: 400 });

  return NextResponse.json({ room: await updateRoom(session.id, id, { maskDataUrl, status: "mask_ready" }) });
}
