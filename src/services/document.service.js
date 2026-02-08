import { prisma } from "../prisma/client.js";
import { getUserProjectRole } from "./projectMember.service.js";

export const createDocument = async ({
  projectId,
  userId,
  title,
  content,
  type
}) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("Not authorized to create documents");
  }

  return prisma.document.create({
    data: {
      title,
      content,
      type,
      projectId
    }
  });
};



export const getProjectDocuments = async ({ projectId, userId }) => {
    const role = await getUserProjectRole(projectId, userId);
  
    if (!role) {
      throw new Error("Access denied");
    }
  
    return prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    });
  };

  

  import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";

/**
 * Update a document
 * - Saves to DB
 * - Emits real-time update event
 */
export const updateDocument = async (
  documentId,
  title,
  content,
  userId
) => {
  // 1️⃣ Update document in DB
  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      content,
    },
  });

  // 2️⃣ Emit WebSocket event AFTER DB success
  emitToProject(document.projectId, "document:updated", {
    documentId: document.id,
    projectId: document.projectId,
    updatedBy: userId,
  });

  return document;
};
