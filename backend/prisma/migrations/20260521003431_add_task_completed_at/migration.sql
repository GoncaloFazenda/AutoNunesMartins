-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Task_status_completedAt_idx" ON "Task"("status", "completedAt");
