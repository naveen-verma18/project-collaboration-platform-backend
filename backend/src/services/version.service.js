import { PrismaClient } from "@prisma/client";
import * as Y from "yjs";
import { YDocService } from "./ydoc.service.js";

const prisma = new PrismaClient();

export const getDocumentVersions = async (documentId) => {
    const snapshots = await prisma.documentSnapshot.findMany({
        where: { documentId },
        orderBy: { version: 'desc' },
        select: {
            id: true,
            version: true,
            createdAt: true,
        }
    });
    return snapshots;
};

export const restoreDocumentVersion = async (documentId, version) => {
    // 1. Get the snapshot for that version
    const snapshot = await prisma.documentSnapshot.findFirst({
        where: { documentId, version },
    });

    if (!snapshot) {
        throw new Error("Version mismatch: Snapshot not found");
    }

    // 2. We could just delete all updates after this snapshot, 
    // but in collaborative environments, it's safer to "revert" 
    // by applying a negative update or just broadcasting the state.
    // However, for Yjs, we'll just set the current state to this snapshot.

    // In our simplified persistence model, we can delete all updates 
    // and create a new update that contains the snapshot state.

    await prisma.$transaction([
        prisma.documentUpdate.deleteMany({
            where: { documentId }
        }),
        prisma.documentUpdate.create({
            data: {
                documentId,
                update: snapshot.state,
            }
        })
    ]);

    // Note: The YDocManager/Socket layer should be notified to reload the doc from DB
    // or we can manually emit a sync update to all clients.
    return { success: true, version };
};
