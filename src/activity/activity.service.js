import prisma from "../prisma/client.js";

/**
 * Create a project activity record
 * This should be called ONLY after a successful domain action
 */
export const createActivity = async ({
  projectId,
  userId,
  action,
  metadata = {},
}) => {
  return prisma.projectActivity.create({
    data: {
      projectId,
      userId,
      action,
      metadata,
    },
  });
};
