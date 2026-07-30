import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { createRegistrationIntent, getUser, normalizeWorkspaceName } from "@/lib/authStore";
import { getRpConfig } from "@/lib/rp";

export async function POST(request: Request) {
  let body: { username?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const username = normalizeWorkspaceName(body.username);
  if (!username) {
    return NextResponse.json({ error: "Use 3–48 lowercase letters, numbers, or hyphens for the workspace name" }, { status: 400 });
  }
  if (await getUser(username)) {
    return NextResponse.json({ error: "A workspace already uses that name. Sign in with its passkey instead." }, { status: 409 });
  }

  const { rpName, rpID } = await getRpConfig();
  const userHandle = crypto.randomUUID();
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    userID: new TextEncoder().encode(userHandle),
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  if (!(await createRegistrationIntent(username, userHandle, options.challenge))) {
    return NextResponse.json({ error: "A passkey setup is already in progress for that name. Try again in a few minutes." }, { status: 409 });
  }
  return NextResponse.json(options);
}
