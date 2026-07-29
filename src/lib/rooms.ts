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

const globalStore = globalThis as typeof globalThis & {
  __toposRooms?: Map<string, Map<string, Room>>;
};

export const roomsByOwner = globalStore.__toposRooms ?? new Map<string, Map<string, Room>>();
globalStore.__toposRooms = roomsByOwner;

export const statusLabel: Record<RoomStatus, string> = {
  captured: "Awaiting mask",
  mask_ready: "Mask ready",
  processing: "Processing",
  ai_unavailable: "AI unavailable",
  cleared: "Canvas ready",
  furnished: "Furnished",
};

export function listRooms(owner: string) {
  return [...(roomsByOwner.get(owner)?.values() ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createRoom(owner: string, name: string, sourceImageDataUrl: string) {
  const now = new Date().toISOString();
  const room: Room = {
    id: crypto.randomUUID(),
    owner,
    name,
    status: "captured",
    sourceImageDataUrl,
    objectsRemoved: 0,
    itemsPlaced: 0,
    capturedAt: now,
    updatedAt: now,
    furniture: [],
  };
  const ownerRooms = roomsByOwner.get(owner) ?? new Map<string, Room>();
  ownerRooms.set(room.id, room);
  roomsByOwner.set(owner, ownerRooms);
  return room;
}

export function getRoom(owner: string, id: string) {
  return roomsByOwner.get(owner)?.get(id);
}

export function updateRoom(owner: string, id: string, changes: Partial<Room>) {
  const room = getRoom(owner, id);
  if (!room) return undefined;
  Object.assign(room, changes, { updatedAt: new Date().toISOString() });
  room.itemsPlaced = room.furniture.length;
  if (room.itemsPlaced > 0 && room.status === "cleared") room.status = "furnished";
  return room;
}

export function deleteRoom(owner: string, id: string) {
  return roomsByOwner.get(owner)?.delete(id) ?? false;
}
