-- CreateEnum
CREATE TYPE "TaskSheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- CreateTable
CREATE TABLE "task_sheets" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "sheetNo" INTEGER NOT NULL,
    "interactionDate" TIMESTAMP(3),
    "status" "TaskSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "data" JSONB NOT NULL DEFAULT '{}',
    "submittedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "task_sheets_projectId_sheetNo_key" ON "task_sheets"("projectId", "sheetNo");

-- CreateIndex
CREATE INDEX "task_sheets_clientId_idx" ON "task_sheets"("clientId");

-- CreateIndex
CREATE INDEX "task_sheets_consultantId_idx" ON "task_sheets"("consultantId");

-- CreateIndex
CREATE INDEX "task_sheets_status_idx" ON "task_sheets"("status");

-- AddForeignKey
ALTER TABLE "task_sheets" ADD CONSTRAINT "task_sheets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_sheets" ADD CONSTRAINT "task_sheets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_sheets" ADD CONSTRAINT "task_sheets_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_sheets" ADD CONSTRAINT "task_sheets_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
