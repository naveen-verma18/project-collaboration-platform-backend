
import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { createActivity } from "./activity.service.js";

export const createGoal = async ({ projectId, title, description, userId }) => {
  const goal = await prisma.projectGoal.create({
    data: {
      projectId,
      title,
      description,
      isCompleted: false,
      createdById: userId
    }
  });

  emitToProject(projectId, "goal:created", goal);

  await createActivity({
    projectId,
    userId,
    action: "GOAL_CREATED",
    metadata: { goalId: goal.id, title: goal.title }
  });

  return goal;
};

export const getGoals = async (projectId) => {
  return await prisma.projectGoal.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" }
  });
};

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
