import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/db";
import { computeDiff } from "../changes/detector";

function parseId(raw: unknown): number | null {
  const n = parseInt(String(raw), 10);
  return isNaN(n) ? null : n;
}

export const router = Router();

// NOTE: Token-based authentication should be added before any public exposure.
// All endpoints are currently unauthenticated for internal/dev use only.

// ---------------------------------------------------------------------------
// GET /stats — dashboard summary
// ---------------------------------------------------------------------------
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [totalUrls, activeUrls, pendingUrls, errorPaused, totalChanges, totalRuns] =
      await Promise.all([
        prisma.watchedUrl.count(),
        prisma.watchedUrl.count({ where: { status: "active" } }),
        prisma.watchedUrl.count({ where: { status: "pending_review" } }),
        prisma.watchedUrl.count({ where: { status: "error_paused" } }),
        prisma.changeEvent.count(),
        prisma.discoveryRun.count(),
      ]);

    const recentChanges = await prisma.changeEvent.count({
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });

    res.json({
      totalUrls,
      activeUrls,
      pendingUrls,
      errorPaused,
      totalChanges,
      recentChanges,
      totalRuns,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// GET /discovery-runs — list discovery run history
// ---------------------------------------------------------------------------
router.get("/discovery-runs", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10), 200);

    const runs = await prisma.discoveryRun.findMany({
      take: limit,
      orderBy: { ranAt: "desc" },
    });

    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch discovery runs", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// GET /watchlist — list all watched URLs
// ---------------------------------------------------------------------------
router.get("/watchlist", async (_req: Request, res: Response) => {
  try {
    const urls = await prisma.watchedUrl.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        source: true,
        status: true,
        intervalMinutes: true,
        tags: true,
        consecutiveFailures: true,
        lastCheckedAt: true,
        createdAt: true,
      },
    });

    const result = urls.map((u) => ({
      ...u,
      tags: JSON.parse(u.tags),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch watchlist", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// POST /watchlist — add a new URL
// ---------------------------------------------------------------------------
const createSchema = z.object({
  url: z.string().url(),
  tags: z.record(z.string()).optional().default({}),
  interval_minutes: z.number().int().positive().optional(),
});

router.post("/watchlist", async (req: Request, res: Response) => {
  try {
    const body = createSchema.parse(req.body);

    const existing = await prisma.watchedUrl.findUnique({
      where: { url: body.url },
    });
    if (existing) {
      res.status(409).json({ error: "URL already exists", id: existing.id });
      return;
    }

    const entry = await prisma.watchedUrl.create({
      data: {
        url: body.url,
        source: "manual",
        status: "active",
        intervalMinutes: body.interval_minutes ?? 60,
        tags: JSON.stringify(body.tags),
      },
    });

    res.status(201).json({ id: entry.id, url: entry.url, status: entry.status });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    res.status(500).json({ error: "Failed to create entry", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// PATCH /watchlist/:id — update tags, interval, or status
// ---------------------------------------------------------------------------
const updateSchema = z.object({
  tags: z.record(z.string()).optional(),
  interval_minutes: z.number().int().positive().optional(),
  status: z.enum(["active", "paused", "pending_review"]).optional(),
});

router.patch("/watchlist/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const body = updateSchema.parse(req.body);
    const data: Record<string, unknown> = {};

    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    if (body.interval_minutes !== undefined) data.intervalMinutes = body.interval_minutes;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "active") data.consecutiveFailures = 0;
    }

    const updated = await prisma.watchedUrl.update({ where: { id }, data });
    res.json({
      id: updated.id,
      url: updated.url,
      status: updated.status,
      intervalMinutes: updated.intervalMinutes,
      tags: JSON.parse(updated.tags),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    res.status(500).json({ error: "Failed to update entry", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// DELETE /watchlist/:id — remove a URL
// ---------------------------------------------------------------------------
router.delete("/watchlist/:id", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    await prisma.watchedUrl.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entry", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// POST /watchlist/:id/approve — promote discovered URL to active monitoring
// ---------------------------------------------------------------------------
router.post("/watchlist/:id/approve", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const entry = await prisma.watchedUrl.findUnique({ where: { id } });
    if (!entry) {
      res.status(404).json({ error: "URL not found" });
      return;
    }
    if (entry.status !== "pending_review") {
      res.status(400).json({
        error: `URL status is '${entry.status}', expected 'pending_review'`,
      });
      return;
    }

    const updated = await prisma.watchedUrl.update({
      where: { id },
      data: { status: "active" },
    });

    res.json({ id: updated.id, url: updated.url, status: updated.status });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve URL", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// GET /changes — list recent change events
// ---------------------------------------------------------------------------
router.get("/changes", async (req: Request, res: Response) => {
  try {
    const { tag, state, from, to, limit } = req.query;

    const where: Record<string, unknown> = {};
    const urlWhere: Record<string, unknown> = {};

    if (state) {
      urlWhere.tags = { contains: `"state":"${state}"` };
    }
    if (tag) {
      urlWhere.tags = { contains: String(tag) };
    }
    if (Object.keys(urlWhere).length > 0) {
      where.watchedUrl = urlWhere;
    }

    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(String(from));
    if (to) dateFilter.lte = new Date(String(to));
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    const events = await prisma.changeEvent.findMany({
      where,
      take: Math.min(parseInt(String(limit ?? "50"), 10), 200),
      orderBy: { createdAt: "desc" },
      include: {
        watchedUrl: {
          select: { url: true, tags: true, source: true },
        },
      },
    });

    const result = events.map((e) => ({
      id: e.id,
      url: e.watchedUrl.url,
      source: e.watchedUrl.source,
      tags: JSON.parse(e.watchedUrl.tags),
      changeScore: e.changeScore,
      summary: e.summary,
      diffPreview: e.diffPreview,
      notifiedAt: e.notifiedAt,
      createdAt: e.createdAt,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch changes", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// GET /changes/:id/diff — full diff for a change event
// ---------------------------------------------------------------------------
router.get("/changes/:id/diff", async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const event = await prisma.changeEvent.findUnique({
      where: { id },
      include: {
        oldSnapshot: { select: { textContent: true, fetchedAt: true } },
        newSnapshot: { select: { textContent: true, fetchedAt: true } },
        watchedUrl: { select: { url: true, tags: true } },
      },
    });

    if (!event) {
      res.status(404).json({ error: "Change event not found" });
      return;
    }

    const fullDiff = computeDiff(
      event.oldSnapshot.textContent ?? "",
      event.newSnapshot.textContent ?? ""
    );

    res.json({
      id: event.id,
      url: event.watchedUrl.url,
      tags: JSON.parse(event.watchedUrl.tags),
      changeScore: event.changeScore,
      summary: event.summary,
      oldSnapshotDate: event.oldSnapshot.fetchedAt,
      newSnapshotDate: event.newSnapshot.fetchedAt,
      diff: fullDiff,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch diff", detail: String(err) });
  }
});
