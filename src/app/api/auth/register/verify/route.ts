import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { SESSION_COOKIE, createSession, getUser } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { username, response } = await request.json();
  const user = getUser(username ?? "");

  if (!user?.currentChallenge) {
    return NextResponse.json({ error: "No pending registration" }, { status: 400 });
  }

  const { rpID, origin } = await getRpConfig();

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch {
    return NextResponse.json({ error: "Passkey could not be verified" }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Passkey could not be verified" }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  user.credentials.push({
    id: credential.id,
    publicKey: credential.publicKey,
    counter: credential.counter,
    transports: response.response?.transports,
  });
  user.currentChallenge = undefined;

  const res = NextResponse.json({ verified: true, username: user.username });
  res.cookies.set(SESSION_COOKIE, createSession(user.username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
