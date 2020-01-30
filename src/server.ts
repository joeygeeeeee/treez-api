import express, { Express } from 'express'
import bodyParser from 'body-parser'
import routes from './routes'
import mongoose from 'mongoose'
import {Server} from "http";

export interface MongoConfig {
  connectionString: string
}

export interface Config {
  port: number
  mongo: MongoConfig
}

interface ServerOpts {
  config: Config
}

export interface TreezApp {
  app: Express
  destroy: () => void
}
export const server: (opts: ServerOpts) => Promise<TreezApp> = async ({ config }) => {

  const connectionString = config.mongo.connectionString

  console.log(`Connecting to: ${connectionString}`)
  await mongoose.connect(connectionString)

  const app = express()

  const port = config.port

  app.use(bodyParser.json())

  routes.forEach(([path, routes]) => {
    app.use(path, routes)
  })

  app.get('/', (req, res) => res.sendStatus(200))

  const server = app.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`)
  })

  return {
    app,
    destroy: () => {
      server.close()
      mongoose.connection.close()
    }
  }
}
