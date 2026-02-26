import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDocumentRole = async (documentId, userId) => {
    // 1. Check for specific document permission
    const docPerm = await prisma.documentPermission.findUnique({
        where: {
            documentId_userId: { documentId, userId }
        }
    });

    if (docPerm) {
        return docPerm.role;
    }

    // 2. Inherit from project
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { projectId: true }
    });

    if (!document) return null;

    const projectMember = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: { userId, projectId: document.projectId }
        }
    });

    if (!projectMember) return null;

    // Map project roles to document roles
    if (projectMember.role === 'OWNER' || projectMember.role === 'ADMIN') {
        return 'EDITOR';
    }

    return 'VIEWER'; // Default for project members
};

export const getAllDocumentPermissions = async (documentId) => {
    return await prisma.documentPermission.findMany({
        where: { documentId },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            }
        }
    });
};

export const setDocumentPermission = async (documentId, userId, role) => {
    return await prisma.documentPermission.upsert({
        where: {
            documentId_userId: { documentId, userId }
        },
        update: { role },
        create: { documentId, userId, role }
    });
};
