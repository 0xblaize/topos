import { neon } from "@neondatabase/serverless";

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return neon(url);
}

export function query<T>(strings: TemplateStringsArray, ...values: unknown[]) {
  return db()(strings, ...values) as Promise<T[]>;
}
