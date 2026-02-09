import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { createActivity } from "../activity/activity.service.js";

/**
 * Complete a project goal
 */
export const completeGoal = async (goalId, userId) => {
  // 1️⃣ Update goal in DB (source of truth)
  const goal = await prisma.projectGoal.update({
    where: { id: goalId },
    data: {
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // 2️⃣ Emit real-time event (live collaboration)
  emitToProject(goal.projectId, "goal:completed", {
    goalId: goal.id,
    completedBy: userId,
  });

  // 3️⃣ Persist activity (history / audit)
  await createActivity({
    projectId: goal.projectId,
    userId,
    action: "GOAL_COMPLETED",
    metadata: {
      goalId: goal.id,
    },
  });

  // 4️⃣ Return updated goal
  return goal;
};
