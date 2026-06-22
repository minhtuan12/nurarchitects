import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDb } from "../src/lib/db";
import { AdminUser } from "../src/models";

async function main() {
  await connectDb();
  const passwordHash = await bcrypt.hash("admin123", 12);
  await AdminUser.findOneAndUpdate(
    { username: "admin" },
    { username: "admin", passwordHash },
    { upsert: true, new: true, runValidators: true },
  );
  console.log("Seeded admin account: admin/admin123");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
