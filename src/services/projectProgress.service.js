import { prisma } from "../prisma/client.js";
import { getUserProjectRole } from "./projectMember.service.js";

export const getProjectProgress = async ({ projectId, userId }) => {
  // 1️⃣ Authorization: must be a project member
  const role = await getUserProjectRole(projectId, userId);

  if (!role) {
    throw new Error("Access denied");
  }

  // 2️⃣ Count total goals
  const totalGoals = await prisma.projectGoal.count({
    where: { projectId }
  });

  // 3️⃣ Count completed goals
  const completedGoals = await prisma.projectGoal.count({
    where: {
      projectId,
      isCompleted: true
    }
  });

  // 4️⃣ Calculate progress safely
  const progress =
    totalGoals === 0
      ? 0
      : Math.round((completedGoals / totalGoals) * 100);

  // 5️⃣ Return derived data
  return {
    totalGoals,
    completedGoals,
    progress
  };
};
