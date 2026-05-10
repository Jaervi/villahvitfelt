import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set in .env or .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool, { schema });

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address: npm run db:promote user@email.com");
  process.exit(1);
}

async function main() {
  console.log(`🚀 Promoting user ${email} to admin...`);

  try {
    const result = await db
      .update(schema.user)
      .set({ role: "admin" })
      .where(eq(schema.user.email, email))
      .returning();

    if (result.length === 0) {
      console.log(`\n❌ User with email ${email} not found.`);
    } else {
      console.log("\n✅ Success!");
      console.log("-----------------------------------------");
      console.log(`Name: ${result[0].name}`);
      console.log(`Email: ${result[0].email}`);
      console.log(`Role: ${result[0].role}`);
      console.log("-----------------------------------------");
    }
  } catch (error: any) {
    console.error("\n❌ Error promoting user:", error);
  } finally {
    await pool.end();
  }
}

main();
