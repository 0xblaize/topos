import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { fetchImageAsDataUrl } from "@/lib/ai/provider";
import { getRoomByProcessingJobId, updateRoomProcessingByJob } from "@/lib/rooms";
import { putDataUrl } from "@/lib/storage";

const MAX_TIMESTAMP_AGE_SECONDS = 300;

type ReplicateWebhookPayload = {
  id?: unknown;
  status?: unknown;
  output?: unknown;
  error?: unknown;
};

export async function POST(request: Request) {
  const body = await request.text();
  if (!verifySignature(request.headers, body)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: ReplicateWebhookPayload;
  try {
    payload = JSON.parse(body) as ReplicateWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook body" }, { status: 400 });
  }

  const jobId = typeof payload.id === "string" ? payload.id : "";
  const status = typeof payload.status === "string" ? payload.status : "";
  if (!jobId || !["succeeded", "failed", "canceled"].includes(status)) {
    return NextResponse.json({ received: true });
  }

  const room = await getRoomByProcessingJobId(jobId);
  if (!room) return NextResponse.json({ received: true });

  if (status !== "succeeded") {
    const errorMessage = typeof payload.error === "string" ? payload.error : "Replicate processing failed";
    await updateRoomProcessingByJob(jobId, {
      status: "mask_ready",
      processingJobId: undefined,
      processingErrorCode: status === "canceled" ? "ai_canceled" : "processing_failed",
      processingErrorMessage: errorMessage.slice(0, 500),
      processingCompletedAt: new Date().toISOString(),
    });
    return NextResponse.json({ received: true });
  }

  const output = Array.isArray(payload.output) ? payload.output[0] : payload.output;
  if (typeof output !== "string") {
    await updateRoomProcessingByJob(jobId, {
      status: "mask_ready",
      processingJobId: undefined,
      processingErrorCode: "processing_failed",
      processingErrorMessage: "Replicate returned no cleaned image",
      processingCompletedAt: new Date().toISOString(),
    });
    return NextResponse.json({ received: true });
  }

  try {
    const cleanedImageDataUrl = output.startsWith("data:image/") ? output : await fetchImageAsDataUrl(output);
    const cleanedAsset = await putDataUrl(`rooms/${room.id}/cleaned`, cleanedImageDataUrl);
    const updated = await updateRoomProcessingByJob(jobId, {
      status: "cleared",
      cleanedImageDataUrl,
      cleanedImageKey: cleanedAsset?.key,
      processingJobId: undefined,
      processingErrorCode: undefined,
      processingErrorMessage: undefined,
      processingCompletedAt: new Date().toISOString(),
    });
    if (updated) return NextResponse.json({ received: true });
  } catch {
    await updateRoomProcessingByJob(jobId, {
      status: "mask_ready",
      processingJobId: undefined,
      processingErrorCode: "processing_failed",
      processingErrorMessage: "Could not save the cleaned image",
      processingCompletedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}

function verifySignature(headers: Headers, body: string) {
  const secret = process.env.REPLICATE_WEBHOOK_SECRET;
  const webhookId = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatures = headers.get("webhook-signature")?.split(" ") ?? [];
  if (!secret || !webhookId || !timestamp || !signatures.length) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isInteger(timestampSeconds) || Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > MAX_TIMESTAMP_AGE_SECONDS) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", secretBytes).update(`${webhookId}.${timestamp}.${body}`).digest("base64");
  return signatures.some((signature) => {
    const [version, encoded] = signature.split(",", 2);
    if (version !== "v1" || !encoded) return false;
    const actual = Buffer.from(encoded);
    const target = Buffer.from(expected);
    return actual.length === target.length && timingSafeEqual(actual, target);
  });
}
