-- CreateEnum
CREATE TYPE "KnightAge" AS ENUM ('young', 'mature', 'old');

-- CreateTable
CREATE TABLE "Knight" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "playerUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "epithet" TEXT NOT NULL DEFAULT '',
    "ultimateFate" TEXT NOT NULL DEFAULT '',
    "vigCurrent" INTEGER NOT NULL DEFAULT 0,
    "vigMax" INTEGER NOT NULL DEFAULT 0,
    "claCurrent" INTEGER NOT NULL DEFAULT 0,
    "claMax" INTEGER NOT NULL DEFAULT 0,
    "spiCurrent" INTEGER NOT NULL DEFAULT 0,
    "spiMax" INTEGER NOT NULL DEFAULT 0,
    "guardCurrent" INTEGER NOT NULL DEFAULT 0,
    "guardMax" INTEGER NOT NULL DEFAULT 0,
    "vigTraits" TEXT[] DEFAULT ARRAY['', '', '']::TEXT[],
    "claTraits" TEXT[] DEFAULT ARRAY['', '', '']::TEXT[],
    "spiTraits" TEXT[] DEFAULT ARRAY['', '', '']::TEXT[],
    "glory" INTEGER NOT NULL DEFAULT 0,
    "age" "KnightAge" NOT NULL DEFAULT 'young',
    "fatigued" BOOLEAN NOT NULL DEFAULT false,
    "exposed" BOOLEAN NOT NULL DEFAULT false,
    "exhausted" BOOLEAN NOT NULL DEFAULT false,
    "impaired" BOOLEAN NOT NULL DEFAULT false,
    "ability" TEXT NOT NULL DEFAULT '',
    "passion" TEXT NOT NULL DEFAULT '',
    "property" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weapons" JSONB NOT NULL DEFAULT '[]',
    "protectiveArticles" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Knight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Knight_campaignId_idx" ON "Knight"("campaignId");

-- CreateIndex
CREATE INDEX "Knight_playerUserId_idx" ON "Knight"("playerUserId");

-- AddForeignKey
ALTER TABLE "Knight" ADD CONSTRAINT "Knight_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Knight" ADD CONSTRAINT "Knight_playerUserId_fkey" FOREIGN KEY ("playerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
