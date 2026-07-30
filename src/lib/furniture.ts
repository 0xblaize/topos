export const furnitureCatalog = [
  { id: "sofa", label: "Sofa", path: "/models/sofa.glb", halfWidth: 1.5, halfHeight: 0.65 },
  { id: "lamp", label: "Lamp", path: "/models/lamp.glb", halfWidth: 0.5, halfHeight: 1.35 },
  { id: "plant", label: "Plant", path: "/models/plant.glb", halfWidth: 0.6, halfHeight: 1.35 },
] as const;

export type FurnitureModelId = (typeof furnitureCatalog)[number]["id"];

export const furnitureModelIds = new Set<string>(furnitureCatalog.map((item) => item.id));

export function isFurnitureModelId(value: unknown): value is FurnitureModelId {
  return typeof value === "string" && furnitureModelIds.has(value);
}

export function isValidFurniturePlacement(value: unknown): value is {
  id: string;
  modelId: FurnitureModelId;
  x: number;
  y: number;
  scale: number;
  rotation: number;
} {
  if (!value || typeof value !== "object") return false;
  const placement = value as Record<string, unknown>;
  return typeof placement.id === "string"
    && /^[0-9a-f-]{36}$/i.test(placement.id)
    && isFurnitureModelId(placement.modelId)
    && typeof placement.x === "number" && placement.x >= 0.08 && placement.x <= 0.92
    && typeof placement.y === "number" && placement.y >= 0.08 && placement.y <= 0.92
    && typeof placement.scale === "number" && placement.scale >= 0.45 && placement.scale <= 1.6
    && typeof placement.rotation === "number" && placement.rotation >= -Math.PI && placement.rotation <= Math.PI
    && [placement.x, placement.y, placement.scale, placement.rotation].every(Number.isFinite);
}
