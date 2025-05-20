const mongoose = require("mongoose");
const Role = require("./models/Role.model");
const Feature = require("./models/feature.model");
const Permission = require("./models/permission.model");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log("DB connection successful!"));

const roles = ["Admin", "Instructor", "Student"];
const features = [
  "manage_users",
  "manage_courses",
  "add_courses",
  "edit_courses",
  "delete_courses",
  "approve_reject_courses", // Corrigé : "approve_rejecte_courses" → "approve_reject_courses"
  "view_courses",
  "enroll_courses",
  "add_review",
  "view_analytics",
  "manage_payments",
  "view_students",
];

const permissions = [
  // Admin permissions
  { role: "Admin", feature: "manage_users", authorized: true },
  { role: "Admin", feature: "approve_reject_courses", authorized: true },
  { role: "Admin", feature: "view_analytics", authorized: true },
  { role: "Admin", feature: "manage_payments", authorized: true },
  { role: "Admin", feature: "manage_courses", authorized: true },

  // Instructor permissions
  { role: "Instructor", feature: "add_courses", authorized: true },
  { role: "Instructor", feature: "edit_courses", authorized: true },
  { role: "Instructor", feature: "delete_courses", authorized: true },
  { role: "Instructor", feature: "view_students", authorized: true },
  { role: "Instructor", feature: "view_analytics", authorized: true },
  { role: "Instructor", feature: "manage_courses", authorized: true },

  // Student permissions
  { role: "Student", feature: "view_courses", authorized: true },
  { role: "Student", feature: "enroll_courses", authorized: true },
  { role: "Student", feature: "add_review", authorized: true },
];

async function seed() {
  try {
    // 1. Clean previous
    await Role.deleteMany();
    await Feature.deleteMany();
    await Permission.deleteMany();

    // 2. Insert Roles
    const createdRoles = await Role.insertMany(roles.map((name) => ({ name })));

    // 3. Insert Features
    const createdFeatures = await Feature.insertMany(
      features.map((name) => ({ name }))
    );

    // 4. Insert Permissions
    for (const perm of permissions) {
      const role = createdRoles.find((r) => r.name === perm.role);
      const feature = createdFeatures.find((f) => f.name === perm.feature);

      if (role && feature) {
        await Permission.create({
          role: role._id,
          feature: feature._id,
          authorized: perm.authorized,
        });
      }
    }

    console.log("Seeding done !");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
