import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { db, query } from "@/lib/db";

export type StoredCredential = {
  id: string;
  userId: string;
  publicKey: Uint8Array<ArrayBuffer>;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
};

export type StoredUser = {
  id: string;
  username: string;
  credentials: StoredCredential[];
};

export type SessionUser = {
  id: string;
  username: string;
};

export const SESSION_COOKIE = "topos_session";
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

type RegistrationIntentRow = { username: string; user_handle: string; challenge: string };

export function normalizeWorkspaceName(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])?$/.test(normalized) ? normalized : undefined;
}

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

type UserRow = { id: string; username: string };
type CredentialRow = { id: string; user_id: string; public_key: Uint8Array | Buffer | string; counter: number | string; transports: AuthenticatorTransportFuture[] | null };

export async function getUser(username: string) {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return undefined;
  const rows = await query<UserRow>`SELECT id, username FROM users WHERE username = ${normalized} LIMIT 1`;
  return rows[0] ? hydrateUser(rows[0]) : undefined;
}

export async function getUserById(id: string) {
  const rows = await query<UserRow>`SELECT id, username FROM users WHERE id = ${id} LIMIT 1`;
  return rows[0] ? hydrateUser(rows[0]) : undefined;
}

export async function createUser(username: string) {
  const rows = await query<UserRow>`
    INSERT INTO users (username) VALUES (${username})
    RETURNING id, username
  `;
  return hydrateUser(rows[0]);
}

export async function createRegistrationIntent(username: string, userHandle: string, challenge: string) {
  await db()`DELETE FROM registration_intents WHERE expires_at <= now()`;
  const rows = await query<RegistrationIntentRow>`
    INSERT INTO registration_intents (username, user_handle, challenge, expires_at)
    VALUES (${username}, ${userHandle}, ${challenge}, ${new Date(Date.now() + CHALLENGE_TTL_MS).toISOString()})
    ON CONFLICT (username) DO NOTHING
    RETURNING username, user_handle, challenge
  `;
  return rows[0];
}

export async function getRegistrationIntent(username: string) {
  const rows = await query<RegistrationIntentRow>`
    SELECT username, user_handle, challenge
    FROM registration_intents
    WHERE username = ${username} AND expires_at > now()
    LIMIT 1
  `;
  return rows[0];
}

export async function consumeRegistrationIntent(username: string, challenge: string) {
  const rows = await query<RegistrationIntentRow>`
    DELETE FROM registration_intents
    WHERE username = ${username} AND challenge = ${challenge} AND expires_at > now()
    RETURNING username, user_handle, challenge
  `;
  return rows[0];
}

async function hydrateUser(row: UserRow): Promise<StoredUser> {
  const credentials = await query<CredentialRow>`
    SELECT id, user_id, public_key, counter, transports
    FROM credentials WHERE user_id = ${row.id} ORDER BY created_at ASC
  `;
  return {
    id: row.id,
    username: row.username,
    credentials: credentials.map(mapCredential),
  };
}

export async function findUserByCredentialId(credentialId: string) {
  const rows = await query<UserRow>`
    SELECT u.id, u.username
    FROM users u JOIN credentials c ON c.user_id = u.id
    WHERE c.id = ${credentialId} LIMIT 1
  `;
  return rows[0] ? hydrateUser(rows[0]) : undefined;
}

export async function saveChallenge(userId: string | null, challenge: string, kind: "registration" | "authentication") {
  await db()`
    INSERT INTO auth_challenges (challenge, user_id, kind, expires_at)
    VALUES (${challenge}, ${userId}, ${kind}, ${new Date(Date.now() + CHALLENGE_TTL_MS).toISOString()})
  `;
}

export async function getPendingChallenge(userId: string, kind: "registration" | "authentication") {
  const rows = await query<{ challenge: string }>`
    SELECT challenge FROM auth_challenges
    WHERE user_id = ${userId} AND kind = ${kind} AND consumed_at IS NULL AND expires_at > now()
    ORDER BY expires_at DESC LIMIT 1
  `;
  return rows[0]?.challenge;
}

export async function consumeChallenge(challenge: string) {
  const rows = await query<{ challenge: string }>`
    UPDATE auth_challenges
    SET consumed_at = now()
    WHERE challenge = ${challenge} AND consumed_at IS NULL AND expires_at > now()
    RETURNING challenge
  `;
  return Boolean(rows[0]);
}

export async function deleteUncredentialedUser(id: string) {
  await db()`
    DELETE FROM users
    WHERE id = ${id}
      AND NOT EXISTS (SELECT 1 FROM credentials WHERE user_id = ${id})
  `;
}

export async function addCredential(credential: StoredCredential) {
  await db()`
    INSERT INTO credentials (id, user_id, public_key, counter, transports)
    VALUES (${credential.id}, ${credential.userId}, ${Buffer.from(credential.publicKey)}, ${credential.counter}, ${credential.transports ? JSON.stringify(credential.transports) : null})
  `;
}

export async function updateCredentialCounter(credentialId: string, counter: number) {
  await db()`
    UPDATE credentials SET counter = ${counter}
    WHERE id = ${credentialId} AND counter <= ${counter}
  `;
}

export async function createSession(userId: string) {
  const token = crypto.randomUUID();
  await db()`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (${token}, ${userId}, ${new Date(Date.now() + SESSION_TTL_MS).toISOString()})
  `;
  return token;
}

export async function getSession(token: string): Promise<SessionUser | undefined> {
  const rows = await query<UserRow>`
    SELECT u.id, u.username
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > now()
    LIMIT 1
  `;
  return rows[0];
}

export async function deleteSession(token: string) {
  await db()`DELETE FROM sessions WHERE token = ${token}`;
}

function mapCredential(row: CredentialRow): StoredCredential {
  return {
    id: row.id,
    userId: row.user_id,
    publicKey: toArrayBufferUint8(row.public_key),
    counter: Number(row.counter),
    transports: row.transports ?? undefined,
  };
}

function toArrayBufferUint8(value: Uint8Array | Buffer | string): Uint8Array<ArrayBuffer> {
  if (typeof value === "string") {
    const hex = value.startsWith("\\x") ? value.slice(2) : value;
    return new Uint8Array(Buffer.from(hex, "hex")) as Uint8Array<ArrayBuffer>;
  }
  return new Uint8Array(value) as Uint8Array<ArrayBuffer>;
}
