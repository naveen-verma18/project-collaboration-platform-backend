-- CreateTable
CREATE TABLE "ProjectGoal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectGoal_projectId_idx" ON "ProjectGoal"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectGoal" ADD CONSTRAINT "ProjectGoal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectGoal" ADD CONSTRAINT "ProjectGoal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
