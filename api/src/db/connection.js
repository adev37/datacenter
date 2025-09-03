// src/db/connection.js (ESM)

import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo(uri) {
  const mongoUri =
    uri || process.env.MONGO_URI || "mongodb://localhost:27017/datacenter";

  if (isConnected) return mongoose.connection;

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    autoIndex: process.env.NODE_ENV !== "production",
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 20,
    minPoolSize: 2,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log("[mongo] connected");

  mongoose.connection.on("error", (err) => console.error("[mongo] error", err));
  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.warn("[mongo] disconnected");
  });

  return mongoose.connection;
}

export async function disconnectMongo() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log("[mongo] connection closed");
  }
}
