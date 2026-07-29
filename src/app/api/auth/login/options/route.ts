import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getUser } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { username } = await request.json();
  const { rpID } = await getRpConfig();
  const user = username ? getUser(username) : undefined;

  if (username && !user?.credentials.length) {
    return NextResponse.json({ error: "No passkey registered for that name" }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: user?.credentials.map((c) => ({ id: c.id, transports: c.transports })),
  });

  if (user) user.currentChallenge = options.challenge;

  return NextResponse.json(options);
}
