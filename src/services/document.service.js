import { prisma } from "../prisma/client.js";
import { getUserProjectRole } from "./projectMember.service.js";

export const createDocument = async ({
  projectId,
  userId,
  title,
  content,
  type
}) => {
  const role = await getUserProjectRole(projectId, userId);

  if (!role || role === "MEMBER") {
    throw new Error("Not authorized to create documents");
  }

  return prisma.document.create({
    data: {
      title,
      content,
      type,
      projectId
    }
  });
};



export const getProjectDocuments = async ({ projectId, userId }) => {
    const role = await getUserProjectRole(projectId, userId);
  
    if (!role) {
      throw new Error("Access denied");
    }
  
    return prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" }
    });
  };

  

  export const updateDocument = async ({
    documentId,
    userId,
    title,
    content
  }) => {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
  
    if (!document) {
      throw new Error("Document not found");
    }
  
    const role = await getUserProjectRole(document.projectId, userId);
  
    if (!role || role === "MEMBER") {
      throw new Error("Not authorized to update document");
    }
  
    return prisma.document.update({
      where: { id: documentId },
      data: {
        title,
        content
      }
    });
  };
  