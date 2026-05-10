import pkg from "pg";
const { Pool } = pkg;
import { crypto } from "node:crypto";

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log("🚀 Bootstrapping first admin invite...");

  const email = "admin@villahvitfelt.fi";
  const code = crypto.randomUUID().split("-")[0].toUpperCase();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  try {
    await pool.query(
      `INSERT INTO "invite" (id, email, code, role, "expiresAt", "createdAt") 
       VALUES (gen_random_uuid(), $1, $2, 'admin', $3, NOW())`,
      [email, code, expiresAt]
    );

    console.log("\n✅ Success!");
    console.log("-----------------------------------------");
    console.log(`Email: ${email}`);
    console.log(`Invite Code: ${code}`);
    console.log(`Role: admin`);
    console.log(`Expires: ${expiresAt.toLocaleDateString()}`);
    console.log("-----------------------------------------");
    console.log("\nUse this code to sign up at /signup");
  } catch (error) {
    if (error.code === '23505') {
       console.log("\nℹ️  An invite for admin@villahvitfelt.fi already exists.");
       const res = await pool.query('SELECT code FROM "invite" WHERE email = $1', [email]);
       if (res.rows.length > 0) {
         console.log(`Code: ${res.rows[0].code}`);
       }
    } else {
      console.error("\n❌ Error bootstrapping admin:", error);
    }
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
