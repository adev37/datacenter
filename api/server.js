// server.js (ESM, no relative paths)

import "dotenv/config";
import http from "http";
import app from "#app"; // <-- keep this exact line
import { connectMongo, disconnectMongo } from "#db/connection.js";

const PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 8080);
const HOST = process.env.API_HOST ?? "0.0.0.0";

let server;

async function start() {
  try {
    const { MONGO_URI } = process.env;
    if (!MONGO_URI) {
      console.error("[api] MONGO_URI is not set in environment.");
      process.exit(1);
    }

    await connectMongo(MONGO_URI);

    server = http.createServer(app);

    server.listen(PORT, HOST, () => {
      console.log(`[api] http://${HOST}:${PORT}`);
    });

    server.on("error", (err) => {
      console.error("[api] server error:", err);
      shutdown(1);
    });
  } catch (e) {
    console.error("[api] startup failed:", e);
    process.exit(1);
  }
}

async function shutdown(code = 0) {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectMongo();
  } catch (e) {
    console.error("[api] shutdown error:", e);
    code = code || 1;
  } finally {
    process.exit(code);
  }
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
process.on("uncaughtException", (e) => {
  console.error(e);
  shutdown(1);
});
process.on("unhandledRejection", (r) => {
  console.error(r);
  shutdown(1);
});

start();
