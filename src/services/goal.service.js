import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";

/**
 * Complete a project goal
 * - Updates DB
 * - Emits WebSocket event AFTER success
 */
export const completeGoal = async (goalId, userId) => {
  // 1️⃣ Update database (source of truth)
  const goal = await prisma.projectGoal.update({
    where: { id: goalId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // 2️⃣ Emit real-time event AFTER DB success
  emitToProject(goal.projectId, "goal:completed", {
    goalId: goal.id,
    completedBy: userId,
  });

  // 3️⃣ Return updated goal
  return goal;
};
