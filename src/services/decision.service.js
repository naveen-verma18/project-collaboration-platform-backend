import { prisma } from "../prisma/client.js";
import { getUserProjectRole } from "./projectMember.service.js";
import { emitToProject } from "../socket/socket.js";

/**
 * Create a new decision
 * - Saves to DB
 * - Emits real-time event
 */
export const createDecision = async (
  projectId,
  title,
  reason,
  userId
) => {
  // 1️⃣ Save decision in DB
  const decision = await prisma.decision.create({
    data: {
      title,
      reason,
      projectId,
      createdBy: userId, // if you store this
    },
  });

  // 2️⃣ Emit WebSocket event AFTER DB success
  emitToProject(projectId, "decision:added", {
    decisionId: decision.id,
    projectId,
    title: decision.title,
    createdBy: userId,
  });

  // 3️⃣ Return created decision
  return decision;
};



export const getProjectDecisions = async ({ projectId, userId }) => {
    const role = await getUserProjectRole(projectId, userId);
  
    if (!role) {
      throw new Error("Access denied");
    }
  
    return prisma.decision.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    });
  };
  