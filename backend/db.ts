// Import Sequelize and the Database configuration file
import { Sequelize } from "sequelize-typescript"
import config from "./config/config.json"

/*
 * db.ts manages the Database connection with Sequelize, in this file the connection between the Databse and Bun is established
 */

// Configuration options for the Database are imported from config.json and made into a config Sequelize object
const dbConfig: Record<string, unknown> =
  config[(process.env.NODE_ENV || "development") as keyof typeof config]

// Sequelize's connection is established using the config, this also loads the model files so TypeScript can validate the types
const sequelize = new Sequelize({
  ...dbConfig,
  modelMatch: () => true,
  models: [`${__dirname}/models`]
})

// Export the function to be called in index.ts
export default sequelize
