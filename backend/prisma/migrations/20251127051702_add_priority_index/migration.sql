-- CreateEnum
CREATE TYPE "priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "priority" "priority" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE INDEX "todos_priority_idx" ON "todos"("priority");
