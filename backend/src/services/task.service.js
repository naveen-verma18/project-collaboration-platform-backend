import prisma from "../prisma/client.js";
import { emitToProject } from "../socket/socket.js";
import { createActivity } from "./activity.service.js";

export const createTask = async ({ projectId, title, description, assignedTo, userId }) => {
  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      assignedTo,
      status: "TODO"
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  emitToProject(projectId, "task:created", task);

  await createActivity({
    projectId,
    userId,
    action: "TASK_CREATED",
    metadata: { taskId: task.id, title: task.title }
  });

  return task;
};

export const getTasks = async (projectId) => {
  return await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      comments: true
    },
    orderBy: { createdAt: "desc" }
  });
};

export const updateTask = async (taskId, updates, userId) => {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: updates,
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  emitToProject(task.projectId, "task:updated", task);

  if (userId) {
    await createActivity({
      projectId: task.projectId,
      userId,
      action: "TASK_UPDATED",
      metadata: { taskId: task.id, updates }
    });
  }

  return task;
};

export const deleteTask = async (taskId, userId) => {
  const task = await prisma.task.delete({
    where: { id: taskId }
  });

  emitToProject(task.projectId, "task:deleted", { taskId });

  await createActivity({
    projectId: task.projectId,
    userId,
    action: "TASK_DELETED",
    metadata: { taskId, title: task.title }
  });

  return task;
};
