import { rmSync } from "node:fs";

const url = process.env.DATABASE_URL ?? "file:peeps.db";
if (!url.startsWith("file:")) {
  console.error("db:reset only wipes local SQLite files. Refusing to touch", url);
  process.exit(1);
}
const file = url.slice("file:".length);
for (const suffix of ["", "-wal", "-shm", "-journal"]) {
  rmSync(file + suffix, { force: true });
}
console.log(`Removed ${file}`);
