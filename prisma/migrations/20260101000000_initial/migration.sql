-- CreateTable
CREATE TABLE "watched_urls" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'active',
    "intervalMinutes" INTEGER NOT NULL DEFAULT 60,
    "tags" TEXT NOT NULL DEFAULT '{}',
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "watched_urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" SERIAL NOT NULL,
    "urlId" INTEGER NOT NULL,
    "htmlCompressed" BYTEA,
    "textContent" TEXT,
    "contentHash" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_events" (
    "id" SERIAL NOT NULL,
    "urlId" INTEGER NOT NULL,
    "oldSnapshotId" INTEGER NOT NULL,
    "newSnapshotId" INTEGER NOT NULL,
    "changeScore" DOUBLE PRECISION NOT NULL,
    "diffPreview" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discovery_runs" (
    "id" SERIAL NOT NULL,
    "query" TEXT NOT NULL,
    "resultsFound" INTEGER NOT NULL,
    "newUrlsCount" INTEGER NOT NULL,
    "ranAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discovery_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "watched_urls_url_key" ON "watched_urls"("url");

-- CreateIndex
CREATE INDEX "snapshots_urlId_fetchedAt_idx" ON "snapshots"("urlId", "fetchedAt");

-- CreateIndex
CREATE INDEX "change_events_urlId_createdAt_idx" ON "change_events"("urlId", "createdAt");

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "watched_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_events" ADD CONSTRAINT "change_events_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "watched_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_events" ADD CONSTRAINT "change_events_oldSnapshotId_fkey" FOREIGN KEY ("oldSnapshotId") REFERENCES "snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_events" ADD CONSTRAINT "change_events_newSnapshotId_fkey" FOREIGN KEY ("newSnapshotId") REFERENCES "snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
