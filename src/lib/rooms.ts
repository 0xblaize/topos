import { query } from "@/lib/db";

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
  sourceImageKey?: string;
  maskKey?: string;
  cleanedImageKey?: string;
  processingJobId?: string;
  processingErrorCode?: string;
  processingErrorMessage?: string;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  processingAttempts: number;
};

export type RoomSummary = Pick<Room, "id" | "name" | "status" | "itemsPlaced" | "capturedAt" | "updatedAt">;

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
  source_image_key: string | null;
  mask_key: string | null;
  cleaned_image_key: string | null;
  processing_job_id: string | null;
  processing_error_code: string | null;
  processing_error_message: string | null;
  processing_started_at: string | Date | null;
  processing_completed_at: string | Date | null;
  processing_attempts: number;
};

type RoomSummaryRow = Pick<RoomRow, "id" | "name" | "status" | "items_placed" | "captured_at" | "updated_at">;

export async function listRoomSummaries(ownerId: string): Promise<RoomSummary[]> {
  const rows = await query<RoomSummaryRow>`
    SELECT id, name, status, items_placed, captured_at, updated_at
    FROM rooms
    WHERE owner_id = ${ownerId}
    ORDER BY updated_at DESC
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    itemsPlaced: Number(row.items_placed),
    capturedAt: new Date(row.captured_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  }));
}

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

export async function updateRoom(ownerId: string, id: string, changes: Partial<Pick<Room, "name" | "status" | "maskDataUrl" | "cleanedImageDataUrl" | "objectsRemoved" | "furniture" | "sourceImageKey" | "maskKey" | "cleanedImageKey" | "processingJobId" | "processingErrorCode" | "processingErrorMessage" | "processingStartedAt" | "processingCompletedAt" | "processingAttempts">>) {
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
        source_image_key = ${changes.sourceImageKey ?? existing.sourceImageKey ?? null},
        mask_key = ${changes.maskKey ?? existing.maskKey ?? null},
        cleaned_image_key = ${changes.cleanedImageKey ?? existing.cleanedImageKey ?? null},
        processing_job_id = ${changes.processingJobId ?? existing.processingJobId ?? null},
        processing_error_code = ${changes.processingErrorCode ?? existing.processingErrorCode ?? null},
        processing_error_message = ${changes.processingErrorMessage ?? existing.processingErrorMessage ?? null},
        processing_started_at = ${changes.processingStartedAt ?? existing.processingStartedAt ?? null},
        processing_completed_at = ${changes.processingCompletedAt ?? existing.processingCompletedAt ?? null},
        processing_attempts = ${changes.processingAttempts ?? existing.processingAttempts},
        updated_at = now()
    WHERE id = ${id} AND owner_id = ${ownerId}
    RETURNING rooms.*, (SELECT username FROM users WHERE id = rooms.owner_id)
  `;
  return rows[0] ? mapRoom(rows[0]) : undefined;
}

export async function getRoomByProcessingJobId(processingJobId: string) {
  const rows = await query<RoomRow>`
    SELECT r.*, u.username
    FROM rooms r JOIN users u ON u.id = r.owner_id
    WHERE r.processing_job_id = ${processingJobId}
    LIMIT 1
  `;
  return rows[0] ? mapRoom(rows[0]) : undefined;
}

export async function updateRoomProcessingByJob(processingJobId: string, changes: Partial<Pick<Room, "status" | "cleanedImageDataUrl" | "cleanedImageKey" | "processingJobId" | "processingErrorCode" | "processingErrorMessage" | "processingCompletedAt">>) {
  const rows = await query<RoomRow>`
    UPDATE rooms
    SET status = COALESCE(${changes.status ?? null}, status),
        cleaned_image_data_url = COALESCE(${changes.cleanedImageDataUrl ?? null}, cleaned_image_data_url),
        cleaned_image_key = COALESCE(${changes.cleanedImageKey ?? null}, cleaned_image_key),
        processing_job_id = ${changes.processingJobId ?? null},
        processing_error_code = ${changes.processingErrorCode ?? null},
        processing_error_message = ${changes.processingErrorMessage ?? null},
        processing_completed_at = COALESCE(${changes.processingCompletedAt ?? null}, processing_completed_at),
        updated_at = now()
    WHERE processing_job_id = ${processingJobId} AND status = 'processing'
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
    sourceImageKey: row.source_image_key ?? undefined,
    maskKey: row.mask_key ?? undefined,
    cleanedImageKey: row.cleaned_image_key ?? undefined,
    processingJobId: row.processing_job_id ?? undefined,
    processingErrorCode: row.processing_error_code ?? undefined,
    processingErrorMessage: row.processing_error_message ?? undefined,
    processingStartedAt: row.processing_started_at ? new Date(row.processing_started_at).toISOString() : undefined,
    processingCompletedAt: row.processing_completed_at ? new Date(row.processing_completed_at).toISOString() : undefined,
    processingAttempts: Number(row.processing_attempts ?? 0),
  };
}
