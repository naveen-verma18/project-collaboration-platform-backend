import { PrismaClient } from "@prisma/client";
import { getUploadUrl, getDownloadUrl } from "../utils/s3.js";
import { v4 as uuidv4 } from "uuid";
import { getDocumentRole } from "./documentPermission.service.js";

const prisma = new PrismaClient();

export const requestUpload = async (projectId, documentId, userId, fileName, contentType, size) => {
    console.log("FileService.requestUpload called", {
        projectId,
        documentId,
        userId,
        fileName,
        contentType,
        size,
    });

    // 1. Verify Project Membership
    const member = await prisma.projectMember.findFirst({
        where: {
            projectId,
            userId,
        },
    });

    if (!member) {
        const error = new Error("User is not a member of this project.");
        error.status = 403;
        throw error;
    }

    // 2. Verify Document Permission (If documentId is provided)
    if (documentId) {
        const role = await getDocumentRole(documentId, userId);

        if (role !== "EDITOR") {
            const error = new Error("Only users with EDITOR permission can upload files to this document.");
            error.status = 403;
            throw error;
        }
    } else {
        // If no documentId, allow any project member for project-level files.
        // Business rule: "Only EDITOR can upload" applies to document-specific uploads.
    }

    // 3. Generate a unique key for S3
    const key = `projects/${projectId}/${uuidv4()}-${fileName}`;

    // 4. Get pre-signed URL
    try {
        const uploadUrl = await getUploadUrl(key, contentType);

        // 5. Create file record in DB
        const file = await prisma.file.create({
            data: {
                name: fileName,
                key,
                url: "",
                size,
                type: contentType,
                projectId,
                documentId: documentId || null,
                uploadedBy: userId,
            },
        });

        console.log("FileService.requestUpload success", { fileId: file.id });

        return {
            uploadUrl,
            key: file.id,
            fileId: file.id,
        };
    } catch (err) {
        console.error("S3/DB Error in requestUpload:", err);
        const error = new Error("Failed to generate upload URL or create file record.");
        error.status = 500;
        throw error;
    }
};

export const getFileDownloadUrl = async (fileId) => {
    const file = await prisma.file.findUnique({
        where: { id: fileId },
    });

    if (!file) {
        const error = new Error("File not found");
        error.status = 404;
        throw error;
    }

    try {
        const downloadUrl = await getDownloadUrl(file.key);
        return downloadUrl;
    } catch (err) {
        console.error("S3 Error in getFileDownloadUrl:", err);
        const error = new Error("Failed to generate download URL.");
        error.status = 500;
        throw error;
    }
};
