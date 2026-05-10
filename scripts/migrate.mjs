import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
import * as dotenv from "dotenv";
const { Pool } = pkg;

// Load env files for local development
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Waiting for database to be ready...");
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    try {
      await pool.query("SELECT 1");
      console.log("Database is ready.");
      break;
    } catch (e) {
      attempts++;
      console.log(`Database not ready (attempt ${attempts}/${maxAttempts})...`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  if (attempts === maxAttempts) {
    throw new Error("Database connection timed out");
  }

  console.log("Running migrations...");

  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations complete!");

  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
