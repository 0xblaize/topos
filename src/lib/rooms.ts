export type RoomStatus = "captured" | "cleared" | "furnished";

export type Room = {
  id: string;
  name: string;
  status: RoomStatus;
  objectsRemoved: number;
  itemsPlaced: number;
  capturedAt: string;
};

export const rooms: Room[] = [];

export const statusLabel: Record<RoomStatus, string> = {
  captured: "Awaiting erase",
  cleared: "Canvas ready",
  furnished: "Furnished",
};
