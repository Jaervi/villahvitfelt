import pkg from "pg";
const { Pool } = pkg;

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email address: node scripts/promote-user.mjs user@email.com");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log(`🚀 Promoting user ${email} to admin...`);

  try {
    const res = await pool.query(
      'UPDATE "user" SET role = \'admin\' WHERE email = $1 RETURNING name, email, role',
      [email]
    );

    if (res.rows.length === 0) {
      console.log(`\n❌ User with email ${email} not found.`);
    } else {
      console.log("\n✅ Success!");
      console.log("-----------------------------------------");
      console.log(`Name: ${res.rows[0].name}`);
      console.log(`Email: ${res.rows[0].email}`);
      console.log(`Role: ${res.rows[0].role}`);
      console.log("-----------------------------------------");
    }
  } catch (error) {
    console.error("\n❌ Error promoting user:", error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
