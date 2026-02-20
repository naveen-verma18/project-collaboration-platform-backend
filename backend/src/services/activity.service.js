import prisma from "../prisma/client.js";

/**
 * Get activities for a project
 */
export const getProjectActivities = async ({ projectId, limit = 50 }) => {
    return prisma.projectActivity.findMany({
        where: {
            projectId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};

/**
 * Create an activity log (Internal use mainly)
 */
export const createActivity = async ({ projectId, userId, action, metadata }) => {
    return prisma.projectActivity.create({
        data: {
            projectId,
            userId,
            action,
            metadata: metadata || {},
        },
    });
};
