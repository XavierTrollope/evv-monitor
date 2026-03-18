import * as crypto from "crypto";
import * as zlib from "zlib";
import { prisma } from "../lib/db";
import { logger } from "../lib/logger";
import { env } from "../lib/config";
import { fetchPage, type FetchResult } from "../lib/fetcher";
import { computeDiff } from "../changes/detector";
import { notifyChange, notifyErrorPaused } from "../notifications/slack";

const MAX_CONSECUTIVE_FAILURES = 5;

export async function runWatchlistCycle(): Promise<void> {
  const start = Date.now();
  logger.info("Watchlist cycle starting");

  const reactivated = await autoReactivateUrls();
  if (reactivated > 0) {
    logger.info({ reactivated }, "Auto-reactivated stalled URLs");
  }

  const urls = await prisma.watchedUrl.findMany({
    where: { status: "active" },
  });

  let checked = 0;
  let changed = 0;
  let failed = 0;

  for (const entry of urls) {
    const isDue = isPollingDue(entry.lastCheckedAt, entry.intervalMinutes);
    if (!isDue) continue;

    try {
      const result = await processUrl(entry);
      checked++;
      if (result === "changed") changed++;
    } catch (err) {
      failed++;
      await handleFetchFailure(entry, err);
    }
  }

  const duration = Date.now() - start;
  logger.info(
    { checked, changed, failed, durationMs: duration },
    "Watchlist cycle complete"
  );
}

async function autoReactivateUrls(): Promise<number> {
  const stalled = await prisma.watchedUrl.findMany({
    where: {
      status: "error_paused",
    },
  });

  if (stalled.length === 0) return 0;

  for (const entry of stalled) {
    const isPdf = entry.url.toLowerCase().endsWith(".pdf");
    if (isPdf) continue;

    await prisma.watchedUrl.update({
      where: { id: entry.id },
      data: {
        status: "active",
        consecutiveFailures: 0,
      },
    });

    logger.info(
      { urlId: entry.id, url: entry.url },
      "Auto-reactivated error_paused URL"
    );
  }

  return stalled.filter((e) => !e.url.toLowerCase().endsWith(".pdf")).length;
}

function isPollingDue(
  lastChecked: Date | null,
  intervalMinutes: number
): boolean {
  if (!lastChecked) return true;
  const elapsed = Date.now() - lastChecked.getTime();
  return elapsed >= intervalMinutes * 60 * 1000;
}

async function processUrl(
  entry: {
    id: number;
    url: string;
    tags: string;
    intervalMinutes: number;
  }
): Promise<"changed" | "unchanged" | "first_snapshot"> {
  const isPdf = entry.url.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    logger.info({ url: entry.url }, "PDF URL flagged as manual_review — skipping fetch");
    await prisma.watchedUrl.update({
      where: { id: entry.id },
      data: { status: "pending_review", lastCheckedAt: new Date() },
    });
    return "unchanged";
  }

  const result: FetchResult = await fetchPage(entry.url);
  const contentHash = crypto
    .createHash("sha256")
    .update(result.textContent)
    .digest("hex");

  const htmlCompressed = zlib.gzipSync(Buffer.from(result.html, "utf-8"));

  const newSnapshot = await prisma.snapshot.create({
    data: {
      urlId: entry.id,
      htmlCompressed,
      textContent: result.textContent,
      contentHash,
    },
  });

  await prisma.watchedUrl.update({
    where: { id: entry.id },
    data: {
      lastCheckedAt: new Date(),
      consecutiveFailures: 0,
    },
  });

  const previousSnapshot = await prisma.snapshot.findFirst({
    where: {
      urlId: entry.id,
      id: { not: newSnapshot.id },
    },
    orderBy: { fetchedAt: "desc" },
  });

  if (!previousSnapshot) {
    logger.info({ urlId: entry.id }, "First snapshot captured");
    return "first_snapshot";
  }

  if (previousSnapshot.contentHash === contentHash) {
    return "unchanged";
  }

  const ignoreRules = await prisma.ignoreRule.findMany({
    where: { urlId: entry.id },
    select: { pattern: true },
  });
  const ignorePatterns = ignoreRules.map((r) => r.pattern);

  const diff = computeDiff(
    previousSnapshot.textContent ?? "",
    result.textContent,
    ignorePatterns
  );

  if (diff.changeScore < env.CHANGE_THRESHOLD_PCT) {
    logger.debug(
      { urlId: entry.id, score: diff.changeScore },
      "Change below threshold"
    );
    return "unchanged";
  }

  const changeEvent = await prisma.changeEvent.create({
    data: {
      urlId: entry.id,
      oldSnapshotId: previousSnapshot.id,
      newSnapshotId: newSnapshot.id,
      changeScore: diff.changeScore,
      diffPreview: diff.diffPreview,
      summary: diff.summary,
    },
  });

  logger.info(
    { urlId: entry.id, changeEventId: changeEvent.id, score: diff.changeScore },
    "Change detected"
  );

  await notifyChange(changeEvent.id);
  return "changed";
}

async function handleFetchFailure(
  entry: { id: number; url: string; consecutiveFailures: number },
  err: unknown
): Promise<void> {
  const failures = entry.consecutiveFailures + 1;
  const newStatus =
    failures >= MAX_CONSECUTIVE_FAILURES ? "error_paused" : "active";

  await prisma.watchedUrl.update({
    where: { id: entry.id },
    data: {
      consecutiveFailures: failures,
      status: newStatus,
      lastCheckedAt: new Date(),
    },
  });

  logger.error(
    { urlId: entry.id, url: entry.url, failures, err },
    "Page fetch failed"
  );

  if (newStatus === "error_paused") {
    await notifyErrorPaused(entry.id, entry.url, failures);
  }
}
