import type { Room } from "@/lib/rooms";

export class AiUnavailableError extends Error {}

export async function processRoomImage(room: Room) {
  const endpoint = process.env.TOPOS_AI_PROCESS_URL;
  const token = process.env.TOPOS_AI_TOKEN;
  if (!endpoint || !token) throw new AiUnavailableError("Configure TOPOS_AI_PROCESS_URL and TOPOS_AI_TOKEN to enable erase processing");
  if (!room.maskDataUrl) throw new Error("Save a clutter mask before processing");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: room.sourceImageDataUrl,
      mask: room.maskDataUrl,
      pipeline: "sam-sdxl-inpainting",
    }),
  });

  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const body = await response.json() as { cleanedImageDataUrl?: unknown };
  if (typeof body.cleanedImageDataUrl !== "string" || !body.cleanedImageDataUrl.startsWith("data:image/")) {
    throw new Error("AI provider returned no cleaned image");
  }
  return body.cleanedImageDataUrl;
}
