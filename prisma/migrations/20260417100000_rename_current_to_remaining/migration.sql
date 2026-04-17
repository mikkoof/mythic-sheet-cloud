-- Rename Knight stat columns: *Current -> *Remaining
ALTER TABLE "Knight" RENAME COLUMN "vigCurrent" TO "vigRemaining";
ALTER TABLE "Knight" RENAME COLUMN "claCurrent" TO "claRemaining";
ALTER TABLE "Knight" RENAME COLUMN "spiCurrent" TO "spiRemaining";
ALTER TABLE "Knight" RENAME COLUMN "guardCurrent" TO "guardRemaining";
