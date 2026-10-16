import postgres from "postgres";

// Only the dev database opts in via PEEPS_DEV_DB=1 in .env.local; production never sets it.
if (process.env.PEEPS_DEV_DB !== "1" || !process.env.DATABASE_URL) {
  console.error("db:reset only wipes the dev database (PEEPS_DEV_DB=1 and DATABASE_URL in .env.local). Refusing.");
  process.exit(1);
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  // The drizzle schema holds the migrations journal; drop it too so every migration re-runs.
  await sql.unsafe("drop schema if exists drizzle cascade; drop schema public cascade; create schema public;");
  await sql.end();
  console.log("Wiped dev database.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
