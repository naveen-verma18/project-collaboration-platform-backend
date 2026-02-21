import prisma from "../prisma/client.js";
import { createActivity } from "./activity.service.js";
import { getUserProjectRole } from "./projectMember.service.js";

export const createInvitation = async ({ projectId, ownerId, email }) => {
  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // Check if already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId,
      },
    },
  });

  if (existingMember) {
    throw new Error("ALREADY_MEMBER");
  }

  // Check if there is already a pending invitation
  const existingInvitation = await prisma.projectInvitation.findFirst({
    where: {
      projectId,
      invitedUserId: user.id,
      status: "PENDING",
    },
  });

  if (existingInvitation) {
    return existingInvitation;
  }

  const invitation = await prisma.projectInvitation.create({
    data: {
      projectId,
      invitedUserId: user.id,
      invitedBy: ownerId,
      status: "PENDING",
    },
  });

  await createActivity({
    projectId,
    userId: ownerId,
    action: "INVITATION_CREATED",
    metadata: {
      invitationId: invitation.id,
      invitedUserId: user.id,
      email: user.email,
    },
  });

  return invitation;
};

export const getMyInvitations = async ({ userId }) => {
  return prisma.projectInvitation.findMany({
    where: {
      invitedUserId: userId,
      status: "PENDING",
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      invitedByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const acceptInvitation = async ({ invitationId, userId }) => {
  const invitation = await prisma.projectInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  if (invitation.invitedUserId !== userId) {
    throw new Error("ACCESS_DENIED");
  }

  if (invitation.status !== "PENDING") {
    return invitation;
  }

  // Ensure project still exists
  const project = await prisma.project.findUnique({
    where: { id: invitation.projectId },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  // Ensure not already a member
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId: invitation.projectId,
      },
    },
  });

  if (!existingMember) {
    await prisma.projectMember.create({
      data: {
        userId,
        projectId: invitation.projectId,
        role: "MEMBER",
      },
    });
  }

  const updatedInvitation = await prisma.projectInvitation.update({
    where: { id: invitationId },
    data: {
      status: "ACCEPTED",
    },
  });

  await createActivity({
    projectId: invitation.projectId,
    userId,
    action: "INVITATION_ACCEPTED",
    metadata: {
      invitationId,
    },
  });

  return updatedInvitation;
};

export const rejectInvitation = async ({ invitationId, userId }) => {
  const invitation = await prisma.projectInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new Error("INVITATION_NOT_FOUND");
  }

  if (invitation.invitedUserId !== userId) {
    throw new Error("ACCESS_DENIED");
  }

  if (invitation.status !== "PENDING") {
    return invitation;
  }

  const updatedInvitation = await prisma.projectInvitation.update({
    where: { id: invitationId },
    data: {
      status: "REJECTED",
    },
  });

  await createActivity({
    projectId: invitation.projectId,
    userId,
    action: "INVITATION_REJECTED",
    metadata: {
      invitationId,
    },
  });

  return updatedInvitation;
};

