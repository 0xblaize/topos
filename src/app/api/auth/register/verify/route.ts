import { NextResponse } from "next/server";
import { type RegistrationResponseJSON, verifyRegistrationResponse } from "@simplewebauthn/server";
import {
  addCredential,
  consumeRegistrationIntent,
  createSession,
  createUser,
  deleteUncredentialedUser,
  getRegistrationIntent,
  normalizeWorkspaceName,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  let body: { username?: unknown; response?: RegistrationResponseJSON };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = normalizeWorkspaceName(body.username);
  if (!username || !body.response) return NextResponse.json({ error: "Invalid registration" }, { status: 400 });

  const intent = await getRegistrationIntent(username);
  if (!intent) return NextResponse.json({ error: "No pending registration. Start passkey setup again." }, { status: 400 });

  const { rpID, origin } = await getRpConfig();
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: intent.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch {
    return NextResponse.json({ error: "Passkey could not be verified" }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Passkey could not be verified" }, { status: 400 });
  }
  if (!(await consumeRegistrationIntent(username, intent.challenge))) {
    return NextResponse.json({ error: "Registration challenge expired" }, { status: 400 });
  }

  let user;
  try {
    user = await createUser(username);
  } catch {
    return NextResponse.json({ error: "A workspace already uses that name. Sign in with its passkey instead." }, { status: 409 });
  }

  const { credential } = verification.registrationInfo;
  try {
    await addCredential({
      id: credential.id,
      userId: user.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: body.response.response?.transports,
    });
  } catch {
    await deleteUncredentialedUser(user.id);
    return NextResponse.json({ error: "That passkey is already associated with another workspace." }, { status: 409 });
  }

  const res = NextResponse.json({ verified: true, username: user.username });
  res.cookies.set(SESSION_COOKIE, await createSession(user.id), sessionCookieOptions(origin.startsWith("https://")));
  return res;
}
