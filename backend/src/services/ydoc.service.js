import * as Y from "yjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SNAPSHOT_THRESHOLD = 50;

export class YDocService {
    /**
     * Load a Y.Doc from the database by retrieving the latest snapshot
     * and subsequently applying any incremental updates.
     */
    static async loadDocument(documentId) {
        const ydoc = new Y.Doc();

        try {
            const snapshot = await prisma.documentSnapshot.findFirst({
                where: { documentId },
                orderBy: { version: "desc" },
            });

            if (snapshot) {
                console.log("[YDocService] Loading snapshot", {
                    documentId,
                    version: snapshot.version,
                });
                Y.applyUpdate(ydoc, new Uint8Array(snapshot.state));
            } else {
                console.log("[YDocService] No snapshot found for document", {
                    documentId,
                });

                // Initialize Y.Doc from existing document.content when no snapshot exists
                const docRecord = await prisma.document.findUnique({
                    where: { id: documentId },
                    select: { content: true },
                });

                if (docRecord && docRecord.content) {
                    const yText = ydoc.getText("content");
                    yText.insert(0, docRecord.content);

                    console.log("[YDocService] Initialized Y.Doc from document.content", {
                        documentId,
                        length: docRecord.content.length,
                    });

                    // Create initial snapshot from this state so future loads use snapshots
                    const initialState = Y.encodeStateAsUpdate(ydoc);
                    await prisma.documentSnapshot.create({
                        data: {
                            documentId,
                            version: 1,
                            state: Buffer.from(initialState),
                        },
                    });

                    console.log("[YDocService] Snapshot created from existing content", {
                        documentId,
                        version: 1,
                    });
                }
            }

            const updates = await prisma.documentUpdate.findMany({
                where: { documentId },
                orderBy: { createdAt: "asc" },
            });

            if (updates.length > 0) {
                console.log("[YDocService] Applying incremental updates", {
                    documentId,
                    count: updates.length,
                });
            }

            updates.forEach((up) => {
                Y.applyUpdate(ydoc, new Uint8Array(up.update));
            });
        } catch (error) {
            console.error("Error loading Y.Doc for document:", documentId, error);
        }

        return ydoc;
    }

    /**
     * Save an incremental update to the DB.
     * If there are too many updates, compress them into a snapshot.
     */
    static async saveUpdate(documentId, updateBuffer) {
        try {
            // Save incremental update
            await prisma.documentUpdate.create({
                data: {
                    documentId,
                    update: Buffer.from(updateBuffer),
                }
            });

            // Check if we need to snapshot
            const updateCount = await prisma.documentUpdate.count({
                where: { documentId }
            });

            if (updateCount >= SNAPSHOT_THRESHOLD) {
                const version = await this.createSnapshot(documentId);
                console.log("[YDocService] Snapshot saved (threshold reached)", {
                    documentId,
                    version,
                });
            }
        } catch (error) {
            console.error("Error saving update for document:", documentId, error);
        }
    }

    /**
     * Compact all updates into a single snapshot and clear old updates.
     */
    static async createSnapshot(documentId) {
        try {
            const ydoc = await this.loadDocument(documentId);
            const stateVector = Y.encodeStateAsUpdate(ydoc);

            const latestSnapshot = await prisma.documentSnapshot.findFirst({
                where: { documentId },
                orderBy: { version: 'desc' }
            });

            const nextVersion = latestSnapshot ? latestSnapshot.version + 1 : 1;

            // We process this in a transaction to prevent race conditions as much as possible
            const cutoffTime = new Date();

            await prisma.$transaction([
                prisma.documentSnapshot.create({
                    data: {
                        documentId,
                        version: nextVersion,
                        state: Buffer.from(stateVector)
                    }
                }),
                prisma.documentUpdate.deleteMany({
                    where: {
                        documentId,
                        createdAt: { lte: cutoffTime }
                    }
                })
            ]);

            return nextVersion;
        } catch (error) {
            console.error("Error creating snapshot for document:", documentId, error);
        }
    }

    /**
     * Get sync step 1 (state vector) to send to a client requesting sync
     */
    static getSyncStep1(ydoc) {
        return Y.encodeStateVector(ydoc);
    }

    /**
     * Get sync step 2 (update missing on client) based on client's state vector
     */
    static getSyncStep2(ydoc, clientStateVector) {
        return Y.encodeStateAsUpdate(ydoc, new Uint8Array(clientStateVector));
    }
}
