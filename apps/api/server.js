require("module-alias/register");
require("dotenv").config();
const http = require("http");
const app = require("./app");
const { connectMongo, disconnectMongo } = require("db/connection");

const PORT = Number(process.env.API_PORT || 8080);
const HOST = process.env.API_HOST || "0.0.0.0";
let server;

async function start() {
  try {
    await connectMongo(process.env.MONGO_URI);
    server = http.createServer(app);
    server.listen(PORT, HOST, () =>
      console.log(`[api] http://${HOST}:${PORT}`)
    );
    server.on("error", (err) => {
      console.error("[api] server error:", err);
      shutdown(1);
    });
  } catch (e) {
    console.error("[api] startup failed:", e);
    process.exit(1);
  }
}
start();

async function shutdown(code = 0) {
  try {
    if (server) await new Promise((r) => server.close(r));
    await disconnectMongo();
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
