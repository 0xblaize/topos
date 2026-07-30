import type { Room } from "@/lib/rooms";

export class AiUnavailableError extends Error {}
export class AiBusyError extends Error {}

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[] | null;
  error?: string | null;
  urls?: { get?: string };
};

export async function processRoomImage(room: Room) {
  if (!room.maskDataUrl) throw new Error("Save a clutter mask before processing");

  const bridgeEndpoint = process.env.TOPOS_AI_PROCESS_URL;
  const bridgeToken = process.env.TOPOS_AI_TOKEN;
  if (bridgeEndpoint && bridgeToken) {
    return processWithBridge(room, bridgeEndpoint, bridgeToken);
  }

  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_SDXL_INPAINT_VERSION;
  if (!replicateToken || !version) {
    throw new AiUnavailableError("Configure REPLICATE_API_TOKEN and REPLICATE_SDXL_INPAINT_VERSION to enable erase processing");
  }

  const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${replicateToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version,
      input: {
        image: room.sourceImageDataUrl,
        mask: room.maskDataUrl,
        prompt: process.env.TOPOS_INPAINT_PROMPT ?? "Photorealistic empty room, preserve the existing walls, floor, windows, lighting, and camera perspective, remove everything covered by the mask",
        negative_prompt: "people, furniture, clutter, distorted architecture, warped floor, extra objects",
      },
    }),
  });

  if (predictionResponse.status === 429) throw new AiBusyError("The AI service is busy. Wait a moment and try again.");
  if (!predictionResponse.ok) throw new Error(`Replicate returned ${predictionResponse.status}`);
  const prediction = await predictionResponse.json() as ReplicatePrediction;
  const completed = await waitForPrediction(prediction, replicateToken);
  const output = Array.isArray(completed.output) ? completed.output[0] : completed.output;
  if (typeof output !== "string") throw new Error("Replicate returned no cleaned image");
  return output.startsWith("data:image/") ? output : fetchImageAsDataUrl(output);
}

async function processWithBridge(room: Room, endpoint: string, token: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: room.sourceImageDataUrl, mask: room.maskDataUrl, pipeline: "sam-sdxl-inpainting" }),
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  const body = await response.json() as { cleanedImageDataUrl?: unknown };
  if (typeof body.cleanedImageDataUrl !== "string" || !body.cleanedImageDataUrl.startsWith("data:image/")) throw new Error("AI provider returned no cleaned image");
  return body.cleanedImageDataUrl;
}

async function waitForPrediction(initial: ReplicatePrediction, token: string) {
  let prediction = initial;
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (prediction.status === "succeeded") return prediction;
    if (prediction.status === "failed" || prediction.status === "canceled") throw new Error(prediction.error ?? "Replicate processing failed");
    const url = prediction.urls?.get;
    if (!url) throw new Error("Replicate returned no polling URL");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error(`Replicate polling returned ${response.status}`);
    prediction = await response.json() as ReplicatePrediction;
  }
  throw new Error("Replicate processing timed out");
}

async function fetchImageAsDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not download the cleaned image");
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "image/png";
  const bytes = Buffer.from(await response.arrayBuffer()).toString("base64");
  return `data:${contentType};base64,${bytes}`;
}
