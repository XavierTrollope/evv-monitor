import express from "express";
import path from "path";
import { CronJob } from "cron";
import { env } from "./lib/config";
import { logger } from "./lib/logger";
import { ensureDbConnection } from "./lib/db";
import { closeBrowser } from "./lib/fetcher";
import { router } from "./api/routes";
import { runDiscoveryCycle } from "./discovery/engine";
import { runWatchlistCycle } from "./watchlist/engine";

async function main(): Promise<void> {
  await ensureDbConnection();
  logger.info("Database connected");

  // ---- Express API ----
  const app = express();
  app.use(express.json());

  // Serve dashboard UI
  const publicDir = path.resolve(__dirname, "../public");
  app.use(express.static(publicDir));

  app.use("/api", router);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // SPA fallback — serve index.html for any non-API route
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "API server listening");
  });

  // ---- Discovery cron ----
  const discoveryCron = new CronJob(env.DISCOVERY_CRON, async () => {
    try {
      await runDiscoveryCycle();
    } catch (err) {
      logger.error({ err }, "Discovery cycle crashed (scheduler continues)");
    }
  });
  discoveryCron.start();
  logger.info(
    { cron: env.DISCOVERY_CRON },
    "Discovery scheduler started"
  );

  // ---- Watchlist polling loop ----
  const pollIntervalMs = env.DEFAULT_POLL_INTERVAL_MIN * 60 * 1000;
  const watchlistLoop = setInterval(async () => {
    try {
      await runWatchlistCycle();
    } catch (err) {
      logger.error({ err }, "Watchlist cycle crashed (scheduler continues)");
    }
  }, Math.min(pollIntervalMs, 5 * 60 * 1000));

  // Run first watchlist cycle shortly after startup
  setTimeout(() => {
    runWatchlistCycle().catch((err) =>
      logger.error({ err }, "Initial watchlist cycle failed")
    );
  }, 5000);

  // ---- Graceful shutdown ----
  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    clearInterval(watchlistLoop);
    discoveryCron.stop();
    await closeBrowser();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  logger.fatal({ err }, "Fatal startup error");
  process.exit(1);
});
