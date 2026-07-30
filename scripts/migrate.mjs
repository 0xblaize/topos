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
let statementCount = 0;

for (const file of migrationFiles) {
  const migration = await readFile(new URL(file, migrationDirectory), "utf8");
  const statements = migration
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await sql.query(statement);
    statementCount += 1;
  }
  console.log(`Applied ${file} (${statements.length} statements).`);
}

console.log(`Applied ${statementCount} database statements total.`);
