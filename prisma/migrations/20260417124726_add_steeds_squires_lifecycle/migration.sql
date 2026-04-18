-- CreateEnum
CREATE TYPE "KnightStatus" AS ENUM ('active', 'retired', 'dead');

-- AlterTable
ALTER TABLE "Knight" ADD COLUMN     "predecessorKnightId" TEXT,
ADD COLUMN     "status" "KnightStatus" NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "Steed" (
    "id" TEXT NOT NULL,
    "knightId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "age" "KnightAge" NOT NULL DEFAULT 'young',
    "vigRemaining" INTEGER NOT NULL DEFAULT 0,
    "vigMax" INTEGER NOT NULL DEFAULT 0,
    "claRemaining" INTEGER NOT NULL DEFAULT 0,
    "claMax" INTEGER NOT NULL DEFAULT 0,
    "spiRemaining" INTEGER NOT NULL DEFAULT 0,
    "spiMax" INTEGER NOT NULL DEFAULT 0,
    "guardRemaining" INTEGER NOT NULL DEFAULT 0,
    "guardMax" INTEGER NOT NULL DEFAULT 0,
    "property" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Steed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squire" (
    "id" TEXT NOT NULL,
    "knightId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "age" "KnightAge" NOT NULL DEFAULT 'young',
    "vigRemaining" INTEGER NOT NULL DEFAULT 0,
    "vigMax" INTEGER NOT NULL DEFAULT 0,
    "claRemaining" INTEGER NOT NULL DEFAULT 0,
    "claMax" INTEGER NOT NULL DEFAULT 0,
    "spiRemaining" INTEGER NOT NULL DEFAULT 0,
    "spiMax" INTEGER NOT NULL DEFAULT 0,
    "guardRemaining" INTEGER NOT NULL DEFAULT 0,
    "guardMax" INTEGER NOT NULL DEFAULT 0,
    "property" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Squire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Steed_knightId_idx" ON "Steed"("knightId");

-- CreateIndex
CREATE INDEX "Squire_knightId_idx" ON "Squire"("knightId");

-- CreateIndex
CREATE INDEX "Knight_predecessorKnightId_idx" ON "Knight"("predecessorKnightId");

-- CreateIndex
CREATE INDEX "Knight_campaignId_status_idx" ON "Knight"("campaignId", "status");

-- AddForeignKey
ALTER TABLE "Knight" ADD CONSTRAINT "Knight_predecessorKnightId_fkey" FOREIGN KEY ("predecessorKnightId") REFERENCES "Knight"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Steed" ADD CONSTRAINT "Steed_knightId_fkey" FOREIGN KEY ("knightId") REFERENCES "Knight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Squire" ADD CONSTRAINT "Squire_knightId_fkey" FOREIGN KEY ("knightId") REFERENCES "Knight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
