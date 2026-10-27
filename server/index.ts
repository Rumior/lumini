import "dotenv/config";
import { createServer } from "node:http";
import app from "./app.js";
import { config } from "./config.js";
import { pool } from "./db.js";

const server = createServer(app);

server.listen(config.PORT, () => {
  console.log(`Lumini API listening on port ${config.PORT}`);
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`Received ${signal}; shutting down Lumini API`);

  const forceExit = setTimeout(() => {
    console.error("Shutdown timed out");
    process.exit(1);
  }, 10000);

  forceExit.unref();

  server.close(async (error) => {
    try {
      await pool.end();
      if (error) {
        console.error("HTTP server shutdown error:", error.message);
        process.exitCode = 1;
      }
    } catch (dbError) {
      console.error("Database pool shutdown error:", dbError);
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExit);
    }
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
