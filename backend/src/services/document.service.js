import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { getUserProjectRole } from "./projectMember.service.js";
import { createActivity } from "./activity.service.js";

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
      // Tiptap collaborative editor expects an empty yjs compatible structure or empty string
      // default we can leave as empty string or a base HTML paragraph
      content: content || "<p></p>",
      type,
      projectId,
      version: 1, // initial version
    },
  });

  // Assign EDITOR permission to the creator
  await prisma.documentPermission.create({
    data: {
      documentId: document.id,
      userId,
      role: "EDITOR",
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
 * Update a document
 * OWNER / ADMIN only
 */
export const updateDocument = async ({
  documentId,
  title,
  content,
  userId,
}) => {
  const existing = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!existing) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  const role = await getUserProjectRole(existing.projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("NOT_AUTHORIZED");
  }

  const updatedDocument = await prisma.document.update({
    where: { id: documentId },
    data: {
      title,
      content,
      version: {
        increment: 1,
      },
    },
  });

  emitToProject(existing.projectId, "document:updated", {
    success: true,
    data: {
      documentId: updatedDocument.id,
      updatedBy: userId,
      version: updatedDocument.version,
    },
    error: null,
  });

  await createActivity({
    projectId: existing.projectId,
    userId,
    action: "DOCUMENT_UPDATED",
    metadata: {
      documentId: updatedDocument.id,
      title: updatedDocument.title,
    },
  });

  return updatedDocument;
};

/**
 * Delete a document
 * OWNER / ADMIN only
 */
export const deleteDocument = async ({ documentId, userId }) => {
  const existing = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!existing) {
    throw new Error("DOCUMENT_NOT_FOUND");
  }

  const role = await getUserProjectRole(existing.projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("NOT_AUTHORIZED");
  }

  await prisma.document.delete({
    where: { id: documentId },
  });

  await createActivity({
    projectId: existing.projectId,
    userId,
    action: "DOCUMENT_DELETED",
    metadata: {
      documentId: existing.id,
      title: existing.title,
    },
  });
};