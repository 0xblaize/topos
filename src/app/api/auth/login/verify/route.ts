import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { consumeChallenge, createSession, findUserByCredentialId, getPendingChallenge, getUserById, SESSION_COOKIE, updateCredentialCounter } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  const { response } = await request.json();
  const user = await findUserByCredentialId(response?.id ?? "");
  if (!user) return NextResponse.json({ error: "Unknown passkey" }, { status: 400 });

  const credential = user.credentials.find((item) => item.id === response.id);
  if (!credential) return NextResponse.json({ error: "Unknown passkey" }, { status: 400 });
  const expectedChallenge = await getPendingChallenge(user.id, "authentication");
  if (!expectedChallenge) return NextResponse.json({ error: "No pending login" }, { status: 400 });

  const { rpID, origin } = await getRpConfig();
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
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

  if (!verification.verified) return NextResponse.json({ error: "Passkey rejected" }, { status: 400 });
  if (!(await consumeChallenge(expectedChallenge))) return NextResponse.json({ error: "Login challenge expired" }, { status: 400 });
  await updateCredentialCounter(credential.id, verification.authenticationInfo.newCounter);
  const currentUser = await getUserById(user.id);

  const res = NextResponse.json({ verified: true, username: currentUser?.username ?? user.username });
  res.cookies.set(SESSION_COOKIE, await createSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
  });
  return res;
}
