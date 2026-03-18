import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as zlib from "zlib";
import axios from "axios";
import { prisma } from "../lib/db";
import { logger } from "../lib/logger";
import { env } from "../lib/config";
import { fetchPage } from "../lib/fetcher";

interface QueriesConfig {
  queries: string[];
}

interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

function loadQueries(): string[] {
  const configPath = path.resolve(
    __dirname,
    "../../config/evv-queries.json"
  );
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const config: QueriesConfig = JSON.parse(raw);
    return config.queries;
  } catch (err) {
    logger.error({ err }, "Failed to load EVV queries config");
    return [];
  }
}

async function googleSearch(query: string): Promise<SearchResult[]> {
  if (!env.SEARCH_API_KEY || !env.SEARCH_ENGINE_ID) {
    logger.warn("Search API credentials not configured — skipping search");
    return [];
  }

  try {
    const resp = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: env.SEARCH_API_KEY,
          cx: env.SEARCH_ENGINE_ID,
          q: query,
          num: 10,
        },
        timeout: 15000,
      }
    );

    return (resp.data.items ?? []).map(
      (item: { link: string; title: string; snippet: string }) => ({
        link: item.link,
        title: item.title,
        snippet: item.snippet,
      })
    );
  } catch (err) {
    logger.error({ err, query }, "Google Custom Search request failed");
    return [];
  }
}

export async function runDiscoveryCycle(): Promise<void> {
  const start = Date.now();
  logger.info("Discovery cycle starting");

  const queries = loadQueries();
  let totalFound = 0;
  let totalNew = 0;

  for (const query of queries) {
    try {
      const results = await googleSearch(query);
      totalFound += results.length;

      let newForQuery = 0;
      for (const result of results) {
        const isNew = await processDiscoveredUrl(result);
        if (isNew) newForQuery++;
      }

      totalNew += newForQuery;

      await prisma.discoveryRun.create({
        data: {
          query,
          resultsFound: results.length,
          newUrlsCount: newForQuery,
        },
      });

      logger.info(
        { query, results: results.length, new: newForQuery },
        "Discovery query complete"
      );
    } catch (err) {
      logger.error({ err, query }, "Discovery query failed");
    }
  }

  const duration = Date.now() - start;
  logger.info(
    { totalFound, totalNew, durationMs: duration },
    "Discovery cycle complete"
  );
}

async function processDiscoveredUrl(
  result: SearchResult
): Promise<boolean> {
  const existing = await prisma.watchedUrl.findUnique({
    where: { url: result.link },
  });

  if (existing) return false;

  const isPdf = result.link.toLowerCase().endsWith(".pdf");

  const entry = await prisma.watchedUrl.create({
    data: {
      url: result.link,
      source: "discovered",
      status: isPdf ? "pending_review" : "active",
      intervalMinutes: env.DEFAULT_POLL_INTERVAL_MIN,
      tags: JSON.stringify({
        url_type: isPdf ? "pdf" : guessUrlType(result),
        discovered_title: result.title,
      }),
    },
  });

  if (!isPdf) {
    try {
      const fetched = await fetchPage(result.link);
      const contentHash = crypto
        .createHash("sha256")
        .update(fetched.textContent)
        .digest("hex");
      const htmlCompressed = zlib.gzipSync(
        Buffer.from(fetched.html, "utf-8")
      );

      await prisma.snapshot.create({
        data: {
          urlId: entry.id,
          htmlCompressed,
          textContent: fetched.textContent,
          contentHash,
        },
      });
    } catch (err) {
      logger.warn(
        { url: result.link, err },
        "Failed to capture initial snapshot for discovered URL"
      );
    }
  }

  return true;
}

function guessUrlType(result: SearchResult): string {
  const text = `${result.link} ${result.title} ${result.snippet}`.toLowerCase();
  if (text.includes(".gov")) return "portal";
  if (text.includes("aggregator")) return "aggregator";
  if (text.includes("guide") || text.includes("spec")) return "spec_doc";
  if (text.includes("export")) return "export_guide";
  return "unknown";
}
