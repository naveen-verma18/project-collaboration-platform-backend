import prisma from "../prisma/client.js";

export async function createProject({ userId, name, description }) {
  if (!name || name.trim() === "") {
    throw new Error("Project name is required");
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

  return project;
}

export async function getMyProjects(userId) {
  return prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function getProjectById({ projectId, userId }) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
  });

  return project;
}
import prisma from "../prisma/client.js";



/**
 * Update a project
 * Only the project OWNER is allowed
 */
export async function updateProject({
  projectId,
  ownerId,
  name,
  description,
  status,
}) {
  // 1. Verify project exists AND requester is owner
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: ownerId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  // 2. Validate update data
  const dataToUpdate = {};

  if (name !== undefined) dataToUpdate.name = name;
  if (description !== undefined) dataToUpdate.description = description;
  if (status !== undefined) dataToUpdate.status = status;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new Error("NO_FIELDS_TO_UPDATE");
  }

  // 3. Perform update
  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: dataToUpdate,
  });

  return updatedProject;
}



/**
 * Delete a project
 * Only the project OWNER is allowed
 */
export async function deleteProject({ projectId, ownerId }) {
  // 1. Verify project exists AND requester is owner
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: ownerId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  // 2. Delete project
  // Related members will be handled by DB constraints or cascade later
  await prisma.project.delete({
    where: { id: projectId },
  });

  return;
}
