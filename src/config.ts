import { Config } from "./server"

export const config: Config = {
  port: parseInt(process.env.TREEZ_PORT) || 3000,
  mongo: {
    connectionString: process.env.TREEZ_MONGO_CONNECTION_STRING
  }
}
