-- CreateTable
CREATE TABLE "ignore_rules" (
    "id" SERIAL NOT NULL,
    "urlId" INTEGER NOT NULL,
    "pattern" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sampleLine" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ignore_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ignore_rules_urlId_idx" ON "ignore_rules"("urlId");

-- AddForeignKey
ALTER TABLE "ignore_rules" ADD CONSTRAINT "ignore_rules_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "watched_urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
