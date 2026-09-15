import { runMigrations } from "../src/db/migrate.js";
import { seedDrills } from "../src/db/seed.js";
import { pool } from "../src/db/connection.js";

async function main() {
  await runMigrations();
  await seedDrills();
  await pool.end();
  console.log("Migrations + drill seeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
