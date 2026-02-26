import { YDocService } from "../services/ydoc.service.js";
import * as DocumentPermissionService from "../services/documentPermission.service.js";

/**
 * Manages Y.Doc instances in memory to minimize DB reads.
 * Handles loading from DB on first join and periodic saving.
 */
class YDocManager {
    constructor() {
        this.docs = new Map(); // Map<documentId, { doc, updatedAt }>
    }

    async getOrCreateDoc(documentId) {
        if (this.docs.has(documentId)) {
            const entry = this.docs.get(documentId);
            entry.updatedAt = Date.now();
            return entry.doc;
        }

        const doc = await YDocService.loadDocument(documentId);

        // Listen for updates to save them to DB
        doc.on("update", (update) => {
            YDocService.saveUpdate(documentId, update);
        });

        this.docs.set(documentId, { doc, updatedAt: Date.now() });
        return doc;
    }

    // Optional: periodic cleanup of inactive docs from memory
    clearInactiveDocs(maxAgeMs = 3600000) { // 1 hour
        const now = Date.now();
        for (const [id, entry] of this.docs.entries()) {
            if (now - entry.updatedAt > maxAgeMs) {
                entry.doc.destroy();
                this.docs.delete(id);
            }
        }
    }
}

const manager = new YDocManager();

// Bridge functions for socket.js
export const getActiveDoc = async (documentId) => {
    return await manager.getOrCreateDoc(documentId);
};

export const registerUserToDoc = async (socketId, documentId, userId) => {
    // Get role from DB/inheritance
    const role = await DocumentPermissionService.getDocumentRole(documentId, userId);

    console.log("YDocManager.registerUserToDoc", {
        socketId,
        documentId,
        userId,
        role,
    });

    if (!role) {
        const error = new Error("ACCESS_DENIED");
        error.status = 403;
        throw error;
    }

    return role;
};

export const unregisterUserFromDoc = (socketId, documentId) => {
    // Potentially handle awareness cleanup if not handled by Yjs provider
    console.log(`User ${socketId} unregistered from document ${documentId}`);
};
