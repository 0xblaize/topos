import { db, query } from "@/lib/db";

export type RoomStatus = "captured" | "mask_ready" | "processing" | "ai_unavailable" | "cleared" | "furnished";

export type FurniturePlacement = {
  id: string;
  modelId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
};

export type Room = {
  id: string;
  owner: string;
  name: string;
  status: RoomStatus;
  sourceImageDataUrl: string;
  maskDataUrl?: string;
  cleanedImageDataUrl?: string;
  objectsRemoved: number;
  itemsPlaced: number;
  capturedAt: string;
  updatedAt: string;
  furniture: FurniturePlacement[];
};

export const statusLabel: Record<RoomStatus, string> = {
  captured: "Awaiting mask",
  mask_ready: "Mask ready",
  processing: "Processing",
  ai_unavailable: "AI unavailable",
  cleared: "Canvas ready",
  furnished: "Furnished",
};

type RoomRow = {
  id: string;
  owner_id: string;
  username: string;
  name: string;
  status: RoomStatus;
  source_image_data_url: string;
  mask_data_url: string | null;
  cleaned_image_data_url: string | null;
  objects_removed: number;
  items_placed: number;
  captured_at: string | Date;
  updated_at: string | Date;
  furniture: FurniturePlacement[] | null;
};

export async function listRooms(ownerId: string) {
  const rows = await query<RoomRow>`
    SELECT r.*, u.username
    FROM rooms r JOIN users u ON u.id = r.owner_id
    WHERE r.owner_id = ${ownerId}
    ORDER BY r.updated_at DESC
  `;
  return rows.map(mapRoom);
}

export async function createRoom(ownerId: string, name: string, sourceImageDataUrl: string) {
  const rows = await query<RoomRow>`
    INSERT INTO rooms (owner_id, name, status, source_image_data_url)
    SELECT ${ownerId}, ${name}, 'captured', ${sourceImageDataUrl}
    RETURNING rooms.*, (SELECT username FROM users WHERE id = rooms.owner_id)
  `;
  return mapRoom(rows[0]);
}

export async function getRoom(ownerId: string, id: string) {
  const rows = await query<RoomRow>`
    SELECT r.*, u.username
    FROM rooms r JOIN users u ON u.id = r.owner_id
    WHERE r.id = ${id} AND r.owner_id = ${ownerId}
    LIMIT 1
  `;
  return rows[0] ? mapRoom(rows[0]) : undefined;
}

export async function updateRoom(ownerId: string, id: string, changes: Partial<Pick<Room, "name" | "status" | "maskDataUrl" | "cleanedImageDataUrl" | "objectsRemoved" | "furniture">>) {
  const existing = await getRoom(ownerId, id);
  if (!existing) return undefined;
  const furniture = changes.furniture ?? existing.furniture;
  const itemsPlaced = furniture.length;
  const status = changes.status ?? (itemsPlaced > 0 && existing.status === "cleared" ? "furnished" : existing.status);
  const rows = await query<RoomRow>`
    UPDATE rooms
    SET name = ${changes.name ?? existing.name},
        status = ${status},
        mask_data_url = ${changes.maskDataUrl ?? existing.maskDataUrl ?? null},
        cleaned_image_data_url = ${changes.cleanedImageDataUrl ?? existing.cleanedImageDataUrl ?? null},
        objects_removed = ${changes.objectsRemoved ?? existing.objectsRemoved},
        items_placed = ${itemsPlaced},
        furniture = ${JSON.stringify(furniture)}::jsonb,
        updated_at = now()
    WHERE id = ${id} AND owner_id = ${ownerId}
    RETURNING rooms.*, (SELECT username FROM users WHERE id = rooms.owner_id)
  `;
  return rows[0] ? mapRoom(rows[0]) : undefined;
}

export async function deleteRoom(ownerId: string, id: string) {
  const rows = await query<{ id: string }>`
    DELETE FROM rooms WHERE id = ${id} AND owner_id = ${ownerId} RETURNING id
  `;
  return Boolean(rows[0]);
}

function mapRoom(row: RoomRow): Room {
  return {
    id: row.id,
    owner: row.username,
    name: row.name,
    status: row.status,
    sourceImageDataUrl: row.source_image_data_url,
    maskDataUrl: row.mask_data_url ?? undefined,
    cleanedImageDataUrl: row.cleaned_image_data_url ?? undefined,
    objectsRemoved: Number(row.objects_removed),
    itemsPlaced: Number(row.items_placed),
    capturedAt: new Date(row.captured_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    furniture: row.furniture ?? [],
  };
}
