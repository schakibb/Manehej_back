import { PrismaClient } from "@prisma/client";
import { AdminRole } from "../src/types/auth.types";
import { hashPassword } from "../src/utils/password.utils";

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log("🌱 Starting admin seed...");

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: "admin@manehej.com",
      },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create default admin user
    const defaultPassword = "Admin123!@#"; // Change this in production
    const hashedPassword = await hashPassword(defaultPassword);

    const admin = await prisma.admin.create({
      data: {
        name: "System Administrator",
        email: "admin@manehej.com",
        password_hash: hashedPassword,
        role: AdminRole.ADMIN,
        is_active: true,
      },
    });

    console.log("✅ Admin user created successfully:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Password: ${defaultPassword}`);
    console.log("");
    console.log(
      "⚠️  IMPORTANT: Change the default password after first login!"
    );
    console.log("   Default credentials:");
    console.log(`   Email: admin@manehej.com`);
    console.log(`   Password: ${defaultPassword}`);
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
    throw error;
  }
}

async function main() {
  try {
    await seedAdmin();
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main();
