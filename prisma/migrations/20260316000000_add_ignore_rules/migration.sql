-- CreateTable
CREATE TABLE "ignore_rules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "urlId" INTEGER NOT NULL,
    "pattern" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sampleLine" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ignore_rules_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "watched_urls" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ignore_rules_urlId_idx" ON "ignore_rules"("urlId");
