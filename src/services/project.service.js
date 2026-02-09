import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { createActivity } from "../activity/activity.service.js";

/**
 * Create a new project
 */
export const createProject = async ({ userId, name, description }) => {
  if (!name || name.trim() === "") {
    throw new Error("PROJECT_NAME_REQUIRED");
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  // 🔔 Activity: project created
  await createActivity({
    projectId: project.id,
    userId,
    action: "PROJECT_CREATED",
    metadata: {
      name: project.name,
    },
  });

  return project;
};

/**
 * Get projects for a user
 */
export const getMyProjects = async (userId) => {
  return prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Get project by ID (with access check)
 */
export const getProjectById = async ({ projectId, userId }) => {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
  });
};

/**
 * Update project (OWNER only)
 */
export const updateProject = async ({
  projectId,
  ownerId,
  name,
  description,
  status,
}) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (description !== undefined) dataToUpdate.description = description;
  if (status !== undefined) dataToUpdate.status = status;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("NO_FIELDS_TO_UPDATE");
  }

  return prisma.project.update({
    where: { id: projectId },
    data: dataToUpdate,
  });
};

/**
 * Delete project (OWNER only)
 */
export const deleteProject = async ({ projectId, ownerId }) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
};

/**
 * Update project status
 * - Updates DB
 * - Emits WebSocket
 * - Creates activity
 */
export const updateProjectStatus = async (
  projectId,
  newStatus,
  userId
) => {
  // 1️⃣ Update DB
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { status: newStatus },
  });

  // 2️⃣ Emit real-time event
  emitToProject(projectId, "project:statusChanged", {
    projectId,
    status: newStatus,
    changedBy: userId,
  });

  // 3️⃣ Persist activity
  await createActivity({
    projectId,
    userId,
    action: "PROJECT_STATUS_CHANGED",
    metadata: {
      status: newStatus,
    },
  });

  return project;
};
