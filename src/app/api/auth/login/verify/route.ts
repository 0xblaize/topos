import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { SESSION_COOKIE, createSession, findUserByCredentialId } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { response } = await request.json();
  const user = findUserByCredentialId(response?.id ?? "");

  if (!user?.currentChallenge) {
    return NextResponse.json({ error: "Unknown passkey" }, { status: 400 });
  }

  const credential = user.credentials.find((c) => c.id === response.id);
  if (!credential) {
    return NextResponse.json({ error: "Unknown passkey" }, { status: 400 });
  }

  const { rpID, origin } = await getRpConfig();

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: credential.transports,
      },
    });
  } catch {
    return NextResponse.json({ error: "Passkey rejected" }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "Passkey rejected" }, { status: 400 });
  }

  credential.counter = verification.authenticationInfo.newCounter;
  user.currentChallenge = undefined;

  const res = NextResponse.json({ verified: true, username: user.username });
  res.cookies.set(SESSION_COOKIE, createSession(user.username), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
