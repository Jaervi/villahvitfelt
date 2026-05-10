import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";
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

async function main() {
  console.log("🚀 Bootstrapping first admin invite...");

  const email = "admin@villahvitfelt.fi"; // Default email for the first admin invite
  const code = uuidv4().split("-")[0].toUpperCase();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Valid for 1 year

  try {
    await db.insert(schema.invite).values({
      email,
      code,
      role: "admin",
      expiresAt,
    });

    console.log("\n✅ Success!");
    console.log("-----------------------------------------");
    console.log(`Email: ${email}`);
    console.log(`Invite Code: ${code}`);
    console.log(`Role: admin`);
    console.log(`Expires: ${expiresAt.toLocaleDateString()}`);
    console.log("-----------------------------------------");
    console.log("\nUse this code to sign up at /signup");
  } catch (error: any) {
    if (error.code === '23505') {
       console.log("\nℹ️  An invite for admin@villahvitfelt.fi already exists.");
       const existing = await db.select().from(schema.invite).where(eq(schema.invite.email, email));
       if (existing.length > 0) {
         console.log(`Code: ${existing[0].code}`);
       }
    } else {
      console.error("\n❌ Error bootstrapping admin:", error);
    }
  } finally {
    await pool.end();
  }
}

main();
