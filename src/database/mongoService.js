import { MongoClient, ObjectId } from "mongodb"

let client = null
let db = null

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.MONGODB_DB || "kennyjaks"

export async function connectMongo() {
  if (db) return db

  client = new MongoClient(MONGODB_URI)
  await client.connect()
  db = client.db(DB_NAME)
  return db
}

export function getMongoDb() {
  if (!db) {
    throw new Error("MongoDB not connected. Call connectMongo() first.")
  }
  return db
}

export function isMongoConnected() {
  return !!db
}

export async function closeMongo() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
