import { sequelize } from "./config/database.js";

const addCategoryColumn = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to DB...");

    // Check if the column already exists before adding
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'tickets' 
        AND COLUMN_NAME = 'category'
    `);

    if (results.length > 0) {
      console.log("ℹ️  Column 'category' already exists in tickets table. Nothing to do.");
    } else {
      await sequelize.query(`
        ALTER TABLE tickets 
        ADD COLUMN category VARCHAR(255) NOT NULL DEFAULT 'normal'
      `);
      console.log("✅ Column 'category' added to tickets table successfully.");
    }

    // Also ensure temple column exists (defensive)
    const [templeCheck] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'tickets' 
        AND COLUMN_NAME = 'temple'
    `);

    if (templeCheck.length === 0) {
      await sequelize.query(`
        ALTER TABLE tickets 
        ADD COLUMN temple VARCHAR(255) NULL
      `);
      console.log("✅ Column 'temple' added to tickets table.");
    } else {
      console.log("ℹ️  Column 'temple' already exists.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
};

addCategoryColumn();
