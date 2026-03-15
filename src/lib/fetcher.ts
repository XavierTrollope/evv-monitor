import { chromium, type Browser } from "playwright";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { env } from "./config";
import { logger } from "./logger";

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({ headless: true });
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance?.isConnected()) {
    await browserInstance.close();
    browserInstance = null;
  }
}

export interface FetchResult {
  html: string;
  textContent: string;
  method: "playwright" | "http";
}

export async function fetchPage(url: string): Promise<FetchResult> {
  try {
    return await fetchWithPlaywright(url);
  } catch (err) {
    logger.warn({ url, err }, "Playwright fetch failed, falling back to HTTP");
    return await fetchWithHttp(url);
  }
}

async function fetchWithPlaywright(url: string): Promise<FetchResult> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: env.PLAYWRIGHT_TIMEOUT_MS,
    });
    const html = await page.content();
    const textContent = extractReadableText(html, url);
    return { html, textContent, method: "playwright" };
  } finally {
    await page.close();
  }
}

async function fetchWithHttp(url: string): Promise<FetchResult> {
  const resp = await axios.get<string>(url, {
    timeout: env.PLAYWRIGHT_TIMEOUT_MS,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; EVVMonitor/1.0; +https://github.com/evv-monitor)",
    },
    responseType: "text",
  });
  const html = resp.data;
  const textContent = extractReadableText(html, url);
  return { html, textContent, method: "http" };
}

function extractReadableText(html: string, url: string): string {
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();
  return article?.textContent?.trim() ?? dom.window.document.body?.textContent?.trim() ?? "";
}
