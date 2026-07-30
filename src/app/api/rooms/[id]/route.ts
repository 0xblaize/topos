import { NextResponse } from "next/server";
import { deleteRoom, getRoom, updateRoom, type FurniturePlacement } from "@/lib/rooms";
import { getSessionUser } from "@/lib/session";
import { isValidFurniturePlacement } from "@/lib/furniture";
import { deleteAsset } from "@/lib/storage";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const room = await getRoom(session.id, id);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json({ room }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!(await getRoom(session.id, id))) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  let body: { name?: unknown; furniture?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const changes: { name?: string; furniture?: FurniturePlacement[]; status?: "furnished" | "cleared" } = {};
  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name || name.length > 80) return NextResponse.json({ error: "Invalid room name" }, { status: 400 });
    changes.name = name;
  }
  if (Array.isArray(body.furniture)) {
    const furniture = body.furniture.filter((item): item is FurniturePlacement => isValidFurniturePlacement(item));
    if (furniture.length !== body.furniture.length || furniture.length > 12) return NextResponse.json({ error: "Invalid furniture placements" }, { status: 400 });
    changes.furniture = furniture;
    changes.status = furniture.length > 0 ? "furnished" : "cleared";
  }

  return NextResponse.json({ room: await updateRoom(session.id, id, changes) });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getSessionUser(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const room = await getRoom(session.id, id);
  if (!room || !(await deleteRoom(session.id, id))) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  await Promise.allSettled([room.sourceImageKey, room.maskKey, room.cleanedImageKey].filter((key): key is string => Boolean(key)).map((key) => deleteAsset(key)));
  return NextResponse.json({ deleted: true });
}
