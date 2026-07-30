import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Add your Neon connection string to .env first.");
}

const migrationDirectory = new URL("../migrations/", import.meta.url);
const migrationFiles = (await readdir(migrationDirectory))
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort();
const sql = neon(databaseUrl);

await sql.query(`
  CREATE TABLE IF NOT EXISTS topos_schema_migrations (
    filename text PRIMARY KEY,
    checksum text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`);

let appliedCount = 0;
for (const file of migrationFiles) {
  const migration = await readFile(new URL(file, migrationDirectory), "utf8");
  const checksum = createHash("sha256").update(migration).digest("hex");
  const existing = await sql.query("SELECT checksum FROM topos_schema_migrations WHERE filename = $1", [file]);
  if (existing.length > 0) {
    if (existing[0].checksum !== checksum) throw new Error(`Migration checksum changed after application: ${file}`);
    console.log(`Skipping ${file} (already applied).`);
    continue;
  }

  const statements = migration
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  await sql.query(
    "INSERT INTO topos_schema_migrations (filename, checksum) VALUES ($1, $2)",
    [file, checksum],
  );
  appliedCount += statements.length;
  console.log(`Applied ${file} (${statements.length} statements).`);
}

console.log(`Applied ${appliedCount} new database statements total.`);
