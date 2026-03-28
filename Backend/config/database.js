import * as dotenv from "dotenv";
import fs from "fs";
import { Sequelize } from "sequelize";

dotenv.config();

/**
 * Sequelize instance
 */

// Helper to choose variables based on mode
const isCloud = process.env.DB_MODE === "cloud";

let sequelize;

if (isCloud && process.env.DATABASE_URL) {
  // Use connection string if provided for cloud
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions:
      process.env.DB_SSL === "true"
        ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
            ca: fs.readFileSync(process.env.DB_CA_CERT_PATH),
          },
        }
        : {},
  });
} else {
  // Otherwise use individual variables
  const DB_NAME = isCloud ? process.env.DB_NAME : process.env.DB_NAME_LOCAL;
  const DB_USER = isCloud ? process.env.DB_USER : process.env.DB_USER_LOCAL;
  const DB_PASS = isCloud ? process.env.DB_PASSWORD : process.env.DB_PASSWORD_LOCAL;
  const DB_HOST = isCloud ? process.env.DB_HOST : process.env.DB_HOST_LOCAL;
  const DB_PORT = isCloud ? (process.env.DB_PORT || 3306) : (process.env.DB_PORT_LOCAL || 3306);

  sequelize = new Sequelize(
    DB_NAME,
    DB_USER,
    DB_PASS,
    {
      host: DB_HOST,
      port: Number(DB_PORT),
      dialect: "mysql",
      logging: false,
      dialectOptions:
        process.env.DB_SSL === "true"
          ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
              ca: fs.readFileSync(process.env.DB_CA_CERT_PATH),
            },
          }
          : {},
    }
  );
}

/**
 * Connect to database
 */


const connectDB = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

export { sequelize, connectDB };
export default sequelize;
