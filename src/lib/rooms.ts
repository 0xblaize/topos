export type RoomStatus = "captured" | "cleared" | "furnished";

export type Room = {
  id: string;
  name: string;
  status: RoomStatus;
  objectsRemoved: number;
  itemsPlaced: number;
  capturedAt: string;
};

export const rooms: Room[] = [
  { id: "RM-01", name: "Loft Living Room", status: "furnished", objectsRemoved: 7, itemsPlaced: 5, capturedAt: "2 hours ago" },
  { id: "RM-02", name: "Studio Bedroom", status: "cleared", objectsRemoved: 4, itemsPlaced: 0, capturedAt: "Yesterday" },
  { id: "RM-03", name: "Corner Office", status: "furnished", objectsRemoved: 9, itemsPlaced: 3, capturedAt: "2 days ago" },
  { id: "RM-04", name: "Garden Flat Kitchen", status: "captured", objectsRemoved: 0, itemsPlaced: 0, capturedAt: "3 days ago" },
  { id: "RM-05", name: "Attic Workspace", status: "cleared", objectsRemoved: 12, itemsPlaced: 0, capturedAt: "Last week" },
];

export const statusLabel: Record<RoomStatus, string> = {
  captured: "Awaiting erase",
  cleared: "Canvas ready",
  furnished: "Furnished",
};
