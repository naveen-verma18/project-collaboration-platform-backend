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
