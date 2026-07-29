import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getUser, saveChallenge } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { username } = await request.json();
  const { rpID } = await getRpConfig();
  const user = username ? await getUser(username) : undefined;

  if (username && !user?.credentials.length) {
    return NextResponse.json({ error: "No passkey registered for that name" }, { status: 404 });
  }

  if (!user) return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "preferred",
    allowCredentials: user.credentials.map((credential) => ({ id: credential.id, transports: credential.transports })),
  });
  await saveChallenge(user.id, options.challenge, "authentication");
  return NextResponse.json(options);
}
