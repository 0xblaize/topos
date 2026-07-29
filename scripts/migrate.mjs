import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Add your Neon connection string to .env first.");
}

const migration = await readFile(new URL("../migrations/001_initial.sql", import.meta.url), "utf8");
const statements = migration
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

const sql = neon(databaseUrl);
for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Applied ${statements.length} database statements.`);
