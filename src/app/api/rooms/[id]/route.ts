import { NextResponse } from "next/server";
import { deleteRoom, getRoom, updateRoom, type FurniturePlacement } from "@/lib/rooms";
import { getSessionUsername } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const owner = getSessionUsername(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const room = getRoom(owner, id);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json({ room });
}

export async function PATCH(request: Request, context: RouteContext) {
  const owner = getSessionUsername(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!getRoom(owner, id)) return NextResponse.json({ error: "Room not found" }, { status: 404 });

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
    const furniture = body.furniture.filter((item): item is FurniturePlacement => {
      if (!item || typeof item !== "object") return false;
      const value = item as Partial<FurniturePlacement>;
      return typeof value.id === "string" && typeof value.modelId === "string" &&
        [value.x, value.y, value.scale, value.rotation].every((number) => typeof number === "number" && Number.isFinite(number));
    });
    if (furniture.length !== body.furniture.length || furniture.length > 12) {
      return NextResponse.json({ error: "Invalid furniture placements" }, { status: 400 });
    }
    changes.furniture = furniture;
    changes.status = furniture.length > 0 ? "furnished" : "cleared";
  }

  const room = updateRoom(owner, id, changes);
  return NextResponse.json({ room });
}

export async function DELETE(request: Request, context: RouteContext) {
  const owner = getSessionUsername(request);
  if (!owner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!deleteRoom(owner, id)) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
