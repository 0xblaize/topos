import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { saveChallenge, upsertUser } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { username } = await request.json();
  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  const { rpName, rpID } = await getRpConfig();
  const user = await upsertUser(username);
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: user.username,
    userID: new TextEncoder().encode(user.id),
    attestationType: "none",
    excludeCredentials: user.credentials.map((credential) => ({ id: credential.id, transports: credential.transports })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  await saveChallenge(user.id, options.challenge, "registration");
  return NextResponse.json(options);
}
