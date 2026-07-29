import { headers } from "next/headers";

export async function getRpConfig() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const rpID = host.split(":")[0];
  const proto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";

  return {
    rpName: "Topos",
    rpID,
    origin: `${proto}://${host}`,
  };
}
