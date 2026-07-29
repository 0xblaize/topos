import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export type StoredCredential = {
  id: string;
  publicKey: Uint8Array<ArrayBuffer>;
  counter: number;
  transports?: AuthenticatorTransportFuture[];
};

export type StoredUser = {
  id: string;
  username: string;
  credentials: StoredCredential[];
  currentChallenge?: string;
};

// In-memory only: passkeys reset when the dev server restarts.
const globalStore = globalThis as unknown as {
  __toposUsers?: Map<string, StoredUser>;
  __toposSessions?: Map<string, string>;
};

export const users = globalStore.__toposUsers ?? new Map<string, StoredUser>();
export const sessions = globalStore.__toposSessions ?? new Map<string, string>();

globalStore.__toposUsers = users;
globalStore.__toposSessions = sessions;

export function getUser(username: string) {
  return users.get(username.toLowerCase());
}

export function upsertUser(username: string): StoredUser {
  const key = username.toLowerCase();
  const existing = users.get(key);
  if (existing) return existing;

  const user: StoredUser = {
    id: crypto.randomUUID(),
    username: key,
    credentials: [],
  };
  users.set(key, user);
  return user;
}

export function findUserByCredentialId(credentialId: string) {
  for (const user of users.values()) {
    if (user.credentials.some((c) => c.id === credentialId)) return user;
  }
  return undefined;
}

export const SESSION_COOKIE = "topos_session";

export function createSession(username: string) {
  const token = crypto.randomUUID();
  sessions.set(token, username.toLowerCase());
  return token;
}
