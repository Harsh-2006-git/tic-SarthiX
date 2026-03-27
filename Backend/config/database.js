import * as dotenv from "dotenv";
import fs from "fs";
import { Sequelize } from "sequelize";

dotenv.config();

/**
 * Sequelize instance
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    logging: false,

    // Connection pool
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    // 🔐 SSL support (Aiven / Cloud MySQL)
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
          ssl: {
            require: true,
            ca: fs.readFileSync(process.env.DB_CA_CERT_PATH),
          },
        }
        : {},
  }
);

/**
 * Connect to database
 */
const connectDB = async () => {
  console.log("Database connection attempt...");
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default sequelize;
