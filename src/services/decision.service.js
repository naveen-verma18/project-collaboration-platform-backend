import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { createActivity } from "../activity/activity.service.js";

/**
 * Create a new decision
 */
export const createDecision = async ({
  projectId,
  title,
  reason,
  userId,
}) => {
  // 1️⃣ Create decision in DB
  const decision = await prisma.decision.create({
    data: {
      title,
      reason,
      projectId,
    },
  });

  // 2️⃣ Emit real-time update
  emitToProject(projectId, "decision:added", {
    decisionId: decision.id,
    title: decision.title,
    createdBy: userId,
  });

  // 3️⃣ Persist activity
  await createActivity({
    projectId,
    userId,
    action: "DECISION_ADDED",
    metadata: {
      decisionId: decision.id,
      title: decision.title,
    },
  });

  // 4️⃣ Return decision
  return decision;
};
