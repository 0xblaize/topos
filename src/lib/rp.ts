import { headers } from "next/headers";

export async function getRpConfig() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const configuredOrigin = process.env.TOPOS_ORIGIN?.replace(/\/$/, "");
  const origin = configuredOrigin ?? `${host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https"}://${host}`;
  const rpID = process.env.TOPOS_RP_ID ?? new URL(origin).hostname;

  return {
    rpName: "Topos",
    rpID,
    origin,
  };
}
