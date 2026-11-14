import { config } from "dotenv";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
config({ path: fs.existsSync(envLocalPath) ? envLocalPath : path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;

async function purge() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI.");
    process.exit(1);
  }

  const isConfirmed = process.argv.includes("--confirm");

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  const propCount = await db.collection("properties").countDocuments();
  const orderCount = await db.collection("orders").countDocuments();
  const electCount = await db.collection("electricalreadings").countDocuments();

  console.log("Current counts in database:");
  console.log(`- properties: ${propCount}`);
  console.log(`- orders: ${orderCount}`);
  console.log(`- electricalreadings: ${electCount}`);

  if (!isConfirmed) {
    console.log("\n[DRY RUN] Run with --confirm to wipe these fake/seed records and leave the database clean for the client.");
    await mongoose.disconnect();
    return;
  }

  console.log("\nDeleting all fake/seed properties, orders, and electrical readings...");
  const delProps = await db.collection("properties").deleteMany({});
  const delOrders = await db.collection("orders").deleteMany({});
  const delElect = await db.collection("electricalreadings").deleteMany({});

  console.log(`Deleted ${delProps.deletedCount} properties.`);
  console.log(`Deleted ${delOrders.deletedCount} orders.`);
  console.log(`Deleted ${delElect.deletedCount} electrical readings.`);
  console.log("\nDatabase is now completely clean and ready for real client data!");

  await mongoose.disconnect();
}

purge().catch(console.error);
