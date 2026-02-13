import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { getUserProjectRole } from "./projectMember.service.js";
import { createActivity } from "../activity/activity.service.js";

/**
 * Create a document
 * OWNER / ADMIN only
 */
export const createDocument = async ({
  projectId,
  userId,
  title,
  content,
  type,
}) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("NOT_AUTHORIZED");
  }

  const document = await prisma.document.create({
    data: {
      title,
      content,
      type,
      projectId,
    },
  });

  //  Activity: document created
  await createActivity({
    projectId,
    userId,
    action: "DOCUMENT_CREATED",
    metadata: {
      documentId: document.id,
      title: document.title,
      type: document.type,
    },
  });

  return document;
};

/**
 * Get all documents in a project
 * Any project member
 */
export const getProjectDocuments = async ({ projectId, userId }) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role) {
    throw new Error("ACCESS_DENIED");
  }

  return prisma.document.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });
};

/**
 * Update a document
 * OWNER / ADMIN only
 * - Updates DB
 * - Emits WebSocket
 * - Creates activity
 */
export const updateDocument = async ({
  documentId,
  projectId,
  title,
  content,
  userId,
}) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("NOT_AUTHORIZED");
  }

  // 1️⃣ Update document (source of truth)
  const document = await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      content,
    },
  });

  // 2️⃣ Emit real-time update
  emitToProject(projectId, "document:updated", {
    documentId: document.id,
    updatedBy: userId,
  });

  // 3️⃣ Persist activity
  await createActivity({
    projectId,
    userId,
    action: "DOCUMENT_UPDATED",
    metadata: {
      documentId: document.id,
      title: document.title,
    },
  });

  return document;
};
