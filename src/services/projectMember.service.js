import prisma from "../prisma/client.js";

/**
 * Add a member to a project by email
 * Only project owner is allowed to do this
 */
export async function addMemberByEmail({
  projectId,
  ownerId,
  email,
}) {
  // 1. Basic validation
  if (!email) {
    throw new Error("EMAIL_REQUIRED");
  }

  // 2. Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: ownerId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  // 3. Find target user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // 4. Prevent owner adding themselves
  if (user.id === ownerId) {
    throw new Error("CANNOT_ADD_SELF");
  }

  // 5. Prevent duplicate membership
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: projectId,
      },
    },
  });

  if (existingMember) {
    throw new Error("ALREADY_MEMBER");
  }

  // 6. Create membership
  const member = await prisma.projectMember.create({
    data: {
      userId: user.id,
      projectId: projectId,
      role: "MEMBER",
    },
  });

  return member;
}




/**
 * Remove a member from a project
 * Only the project OWNER is allowed
 */
export async function removeMember({
  projectId,
  ownerId,
  memberId,
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

  // 2. Prevent owner removing themselves
  if (memberId === ownerId) {
    throw new Error("CANNOT_REMOVE_OWNER");
  }

  // 3. Verify membership exists
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId: projectId,
      },
    },
  });

  if (!membership) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  // 4. Remove member
  await prisma.projectMember.delete({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId: projectId,
      },
    },
  });

  return;
}




/**
 * Change role of a project member
 * Only OWNER is allowed
 */
export async function changeMemberRole({
  projectId,
  ownerId,
  memberId,
  role,
}) {
  // 1. Validate role
  if (!["ADMIN", "MEMBER"].includes(role)) {
    throw new Error("INVALID_ROLE");
  }

  // 2. Verify project exists AND requester is owner
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: ownerId,
    },
  });

  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  // 3. Prevent owner changing their own role
  if (ownerId === memberId) {
    throw new Error("CANNOT_CHANGE_OWNER_ROLE");
  }

  // 4. Verify membership exists
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId: projectId,
      },
    },
  });

  if (!membership) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  // 5. Update role
  const updatedMember = await prisma.projectMember.update({
    where: {
      userId_projectId: {
        userId: memberId,
        projectId: projectId,
      },
    },
    data: {
      role: role,
    },
  });

  return updatedMember;
}
