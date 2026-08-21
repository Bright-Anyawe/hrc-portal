-- Convert currency default from USD to GHS (Cedis)
ALTER TABLE "payments" ALTER COLUMN "currency" SET DEFAULT 'GHS';
UPDATE "payments" SET "currency" = 'GHS' WHERE "currency" = 'USD';
