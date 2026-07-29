import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { addCredential, consumeChallenge, createSession, getPendingChallenge, getUser, SESSION_COOKIE } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { username, response } = await request.json();
  const user = await getUser(username ?? "");
  if (!user) return NextResponse.json({ error: "Workspace not found" }, { status: 400 });

  const expectedChallenge = await getPendingChallenge(user.id, "registration");
  if (!expectedChallenge) return NextResponse.json({ error: "No pending registration" }, { status: 400 });

  const { rpID, origin } = await getRpConfig();
  let verification;
  try {
    verification = await verifyRegistrationResponse({ response, expectedChallenge, expectedOrigin: origin, expectedRPID: rpID });
  } catch {
    return NextResponse.json({ error: "Passkey could not be verified" }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Passkey could not be verified" }, { status: 400 });
  }
  if (!(await consumeChallenge(expectedChallenge))) {
    return NextResponse.json({ error: "Registration challenge expired" }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  await addCredential({
    id: credential.id,
    userId: user.id,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: response.response?.transports,
  });

  const res = NextResponse.json({ verified: true, username: user.username });
  res.cookies.set(SESSION_COOKIE, await createSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
  });
  return res;
}
