import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Simulation from "../models/Simulation.js";
import { simulationsData } from "./simulations.js";

dotenv.config();

const seedDB = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting database seeding...");

    await Simulation.deleteMany({});
    console.log("🗑️  Cleared existing simulations");

    const inserted = await Simulation.insertMany(simulationsData);
    console.log(`✅ Inserted ${inserted.length} simulations`);
    console.log(`   Beginner: ${inserted.filter((s) => s.level === "beginner").length}`);
    console.log(`   Intermediate: ${inserted.filter((s) => s.level === "intermediate").length}`);
    console.log(`   Advanced: ${inserted.filter((s) => s.level === "advanced").length}`);
    console.log(`   Pro: ${inserted.filter((s) => s.level === "pro").length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
