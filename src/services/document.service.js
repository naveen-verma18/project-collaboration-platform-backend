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
      version: 1, // initial version
    },
  });

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
 * Update document using Optimistic Concurrency Control (OCC)
 * OWNER / ADMIN only
 */
export const updateDocument = async ({
  documentId,
  projectId,
  title,
  content,
  userId,
  version,
}) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("NOT_AUTHORIZED");
  }

  // 🔐 Atomic update (id + version must match)
  const result = await prisma.document.updateMany({
    where: {
      id: documentId,
      version: version,
    },
    data: {
      title,
      content,
      version: {
        increment: 1,
      },
    },
  });

  // ❌ Conflict or missing document
  if (result.count === 0) {
    const latest = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!latest) {
      throw new Error("DOCUMENT_NOT_FOUND");
    }

    return {
      conflict: true,
      latestContent: latest.content,
      latestTitle: latest.title,
      latestVersion: latest.version,
    };
  }

  // ✅ Fetch updated document
  const updatedDocument = await prisma.document.findUnique({
    where: { id: documentId },
  });

  // Emit standardized real-time update
  emitToProject(projectId, "document:updated", {
    success: true,
    data: {
      documentId: updatedDocument.id,
      updatedBy: userId,
      version: updatedDocument.version,
    },
    error: null,
  });

  // Log activity
  await createActivity({
    projectId,
    userId,
    action: "DOCUMENT_UPDATED",
    metadata: {
      documentId: updatedDocument.id,
      title: updatedDocument.title,
    },
  });

  return {
    conflict: false,
    document: updatedDocument,
  };
};