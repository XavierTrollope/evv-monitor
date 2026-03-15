import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { env } from "../lib/config";
import { logger } from "../lib/logger";
import { prisma } from "../lib/db";

interface RoutingRule {
  match: { tag: string; value: string };
  channel: string;
}

interface SlackRoutingConfig {
  defaultChannel: string;
  rules: RoutingRule[];
}

interface Tags {
  state?: string;
  aggregator_name?: string;
  url_type?: string;
  source?: string;
  [key: string]: string | undefined;
}

const RATE_LIMIT_MS = 60 * 60 * 1000; // 1 hour per URL

const lastNotifiedMap = new Map<number, number>();

function loadRoutingConfig(): SlackRoutingConfig {
  const configPath = path.resolve(
    __dirname,
    "../../config/slack-routing.json"
  );
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    return { defaultChannel: "#evv-alerts", rules: [] };
  }
}

function resolveChannel(tags: Tags, source: string): string {
  const config = loadRoutingConfig();
  const mergedTags: Tags = { ...tags, source };

  for (const rule of config.rules) {
    const tagValue = mergedTags[rule.match.tag];
    if (tagValue && tagValue === rule.match.value) {
      return rule.channel;
    }
  }
  return config.defaultChannel;
}

function buildChangeBlocks(params: {
  url: string;
  source: string;
  tags: Tags;
  changeScore: number;
  summary: string;
  diffPreview: string;
  changeEventId: number;
  timestamp: string;
}): object[] {
  const tagParts: string[] = [];
  if (params.tags.state) tagParts.push(`State: ${params.tags.state}`);
  if (params.tags.aggregator_name)
    tagParts.push(`Aggregator: ${params.tags.aggregator_name}`);
  if (params.tags.url_type) tagParts.push(`Type: ${params.tags.url_type}`);

  const diffViewUrl = env.DIFF_VIEWER_BASE_URL
    ? `${env.DIFF_VIEWER_BASE_URL}/${params.changeEventId}/diff`
    : params.url;

  return [
    {
      type: "header",
      text: { type: "plain_text", text: "🔔 EVV Page Change Detected" },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*URL:*\n<${params.url}|${truncate(params.url, 60)}>` },
        { type: "mrkdwn", text: `*Source:*\n${params.source}` },
        { type: "mrkdwn", text: `*Tags:*\n${tagParts.join(", ") || "none"}` },
        { type: "mrkdwn", text: `*Changed:*\n${params.timestamp}` },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary:* ${params.summary} (score: ${params.changeScore}%)`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\`\`\`\n${truncate(params.diffPreview, 2900)}\n\`\`\``,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View full diff" },
          url: diffViewUrl,
        },
      ],
    },
  ];
}

function buildErrorBlocks(url: string, failures: number): object[] {
  return [
    {
      type: "header",
      text: { type: "plain_text", text: "⚠️ EVV URL Monitoring Paused" },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `URL <${url}|${truncate(url, 60)}> has failed *${failures}* consecutive times and has been paused.\nManually re-enable via \`PATCH /watchlist/:id\` with \`{ "status": "active" }\`.`,
      },
    },
  ];
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

async function postToSlack(
  blocks: object[],
  channel?: string
): Promise<boolean> {
  if (!env.SLACK_WEBHOOK_URL) {
    logger.warn("SLACK_WEBHOOK_URL not configured — skipping notification");
    return false;
  }

  const payload: Record<string, unknown> = { blocks };
  if (channel) payload.channel = channel;

  try {
    await axios.post(env.SLACK_WEBHOOK_URL, payload, { timeout: 10000 });
    return true;
  } catch (err) {
    logger.error({ err, channel }, "Failed to send Slack notification");
    return false;
  }
}

export async function notifyChange(changeEventId: number): Promise<void> {
  const event = await prisma.changeEvent.findUnique({
    where: { id: changeEventId },
    include: { watchedUrl: true },
  });
  if (!event) {
    logger.warn({ changeEventId }, "Change event not found for notification");
    return;
  }

  const urlId = event.urlId;
  const lastNotified = lastNotifiedMap.get(urlId) ?? 0;
  if (Date.now() - lastNotified < RATE_LIMIT_MS) {
    logger.info(
      { urlId, changeEventId },
      "Rate-limited: skipping duplicate notification"
    );
    return;
  }

  const tags: Tags = JSON.parse(event.watchedUrl.tags);
  const channel = resolveChannel(tags, event.watchedUrl.source);

  const blocks = buildChangeBlocks({
    url: event.watchedUrl.url,
    source: event.watchedUrl.source,
    tags,
    changeScore: event.changeScore,
    summary: event.summary,
    diffPreview: event.diffPreview,
    changeEventId: event.id,
    timestamp: event.createdAt.toISOString(),
  });

  const sent = await postToSlack(blocks, channel);
  if (sent) {
    lastNotifiedMap.set(urlId, Date.now());
    await prisma.changeEvent.update({
      where: { id: changeEventId },
      data: { notifiedAt: new Date() },
    });
  }
}

export async function notifyErrorPaused(
  urlId: number,
  url: string,
  consecutiveFailures: number
): Promise<void> {
  const blocks = buildErrorBlocks(url, consecutiveFailures);
  await postToSlack(blocks);
  logger.warn({ urlId, url, consecutiveFailures }, "Sent error_paused alert");
}
