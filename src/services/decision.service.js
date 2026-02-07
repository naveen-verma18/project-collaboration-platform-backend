import { prisma } from "../prisma/client.js";
import { getUserProjectRole } from "./projectMember.service.js";

export const createDecision = async ({ projectId, userId, title, reason }) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("Not authorized to add decisions");
  }

  return prisma.decision.create({
    data: {
      title,
      reason,
      projectId
    }
  });
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
  