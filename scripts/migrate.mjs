/**
 * Applies the Drizzle migrations in ./drizzle, then creates the first admin
 * from ADMIN_EMAIL / ADMIN_PASSWORD if that account doesn't exist yet.
 *
 * Plain JS on runtime dependencies only: Railway runs this as the
 * pre-deploy command, before the new version takes traffic.
 */
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { hashPassword } from "better-auth/crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, { max: 1, onnotice: () => {} });

async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  const [existing] = await sql`select id from "user" where email = ${email}`;
  if (existing) {
    console.log(`Admin ${email} already exists.`);
    return;
  }
  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  await sql.begin(async (tx) => {
    await tx`insert into "user" (id, name, email, email_verified, role) values (${id}, 'PEEPs Admin', ${email}, true, 'admin')`;
    await tx`insert into account (id, account_id, provider_id, user_id, password)
             values (${crypto.randomUUID()}, ${id}, 'credential', ${id}, ${hash})`;
  });
  console.log(`Created admin ${email}.`);
}

try {
  await migrate(drizzle({ client: sql }), { migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)) });
  console.log("Migrations applied.");
  await bootstrapAdmin();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
