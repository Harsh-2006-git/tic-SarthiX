import { sequelize } from "./config/database.js";
import ZoneTracker from "./models/zoneTracker.js";

const fixSchema = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB...");

    // Remove foreign keys first (MySQL specific attempt)
    try {
      await sequelize.query('ALTER TABLE zone_trackers DROP FOREIGN KEY zone_trackers_ibfk_1;');
    } catch (e) {
      console.log("FK 1 might not exist or already dropped");
    }

    // Force modify the ID columns to be nullable
    await sequelize.query('ALTER TABLE zone_trackers MODIFY client_id INT NULL;');
    await sequelize.query('ALTER TABLE zone_trackers MODIFY member_id INT NULL;');

    console.log("✅ Schema adjusted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adjusting schema:", error);
    process.exit(1);
  }
};

fixSchema();
