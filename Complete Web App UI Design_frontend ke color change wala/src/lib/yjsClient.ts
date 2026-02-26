import * as Y from "yjs";
import { io, Socket } from "socket.io-client";
import * as awarenessProtocol from "y-protocols/awareness";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let socket: Socket | null = null;

// Keep one Y.Doc and Awareness instance per document in this tab
const docs = new Map<string, Y.Doc>();
const awarenessMap = new Map<string, awarenessProtocol.Awareness>();

export const initYDoc = (projectId: string, documentId: string, userId: string) => {
    if (!socket) {
        const token = localStorage.getItem("token");
        console.log("YjsClient: initializing socket connection", {
            SOCKET_URL,
            hasToken: !!token,
        });

        socket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            console.log("YjsClient: socket connected", { socketId: socket?.id });
        });

        socket.on("connect_error", (err) => {
            console.error("YjsClient: socket connect_error", err.message);
        });
    }

    const docKey = `${projectId}:${documentId}`;

    let ydoc = docs.get(docKey);
    if (!ydoc) {
        ydoc = new Y.Doc();
        docs.set(docKey, ydoc);
        console.log("YjsClient: created new Y.Doc for", { projectId, documentId });
    }

    let awareness = awarenessMap.get(docKey);
    if (!awareness) {
        awareness = new awarenessProtocol.Awareness(ydoc);
        awarenessMap.set(docKey, awareness);
    }

    const connect = (onRoleReceived: (role: "EDITOR" | "COMMENTER" | "VIEWER") => void) => {
        if (!socket) {
            console.error("YjsClient: connect called without active socket");
            return;
        }

        console.log("YjsClient: joining document room", {
            projectId,
            documentId,
            userId,
        });

        // Avoid stacking duplicate listeners when reconnecting
        socket.off("document:joined");
        socket.off("document:error");
        socket.off("document:initial");
        socket.off("document:sync-response");
        socket.off("document:sync-update");
        socket.off("document:awareness-update");

        socket.emit("document:join", projectId, documentId);

        socket.on("document:joined", ({ role }) => {
            console.log("YjsClient: document:joined", { role, projectId, documentId });
            onRoleReceived(role);
        });

        socket.on("document:initial", (payload: { update: number[]; hasSnapshot: boolean }) => {
            const { update, hasSnapshot } = payload;
            console.log("YjsClient: document:initial", {
                bytes: update.length,
                hasSnapshot,
                projectId,
                documentId,
            });
            Y.applyUpdate(ydoc!, new Uint8Array(update), "remote");
            console.log("YjsClient: initial snapshot applied", {
                projectId,
                documentId,
            });

            const stateVector = Y.encodeStateVector(ydoc!);
            console.log("YjsClient: sending sync-request", {
                projectId,
                documentId,
                stateVectorLength: stateVector.length,
            });
            socket!.emit("document:sync-request", projectId, documentId, Array.from(stateVector));
        });

        socket.on("document:error", (payload: { message?: string }) => {
            console.error("YjsClient: document:error", payload);
            onRoleReceived("VIEWER");
        });

        socket.on("document:sync-response", ({ step, data }: { step: number; data: number[] }) => {
            console.log("YjsClient: document:sync-response", {
                step,
                bytes: data.length,
                projectId,
                documentId,
            });

            if (step === 1) {
                const update = Y.encodeStateAsUpdate(ydoc!, new Uint8Array(data));
                console.log("YjsClient: sending sync-step (step1->update)", {
                    updateBytes: update.length,
                });
                socket!.emit("document:sync-step", projectId, documentId, Array.from(update));
            } else if (step === 2) {
                Y.applyUpdate(ydoc!, new Uint8Array(data), "remote");
                console.log("YjsClient: applied sync step 2 update", {
                    updateBytes: data.length,
                });
            }
        });

        socket.on("document:sync-update", (updateData: number[]) => {
            console.log("YjsClient: document:sync-update (incoming)", {
                bytes: updateData.length,
            });
            Y.applyUpdate(ydoc!, new Uint8Array(updateData), "remote");
        });

        socket.on("document:awareness-update", (updateData: number[]) => {
            awarenessProtocol.applyAwarenessUpdate(
                awareness!,
                new Uint8Array(updateData),
                "remote"
            );
        });

        ydoc!.on("update", (update, origin) => {
            if (origin !== "remote" && socket) {
                console.log("YjsClient: local Y.Doc update -> emitting", {
                    bytes: update.length,
                    projectId,
                    documentId,
                });
                socket.emit("document:sync-step", projectId, documentId, Array.from(update));
            }
        });

        awareness!.on(
            "update",
            ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
                const changedClients = added.concat(updated).concat(removed);
                const update = awarenessProtocol.encodeAwarenessUpdate(awareness!, changedClients);
                if (socket) {
                    socket.emit("document:awareness-step", projectId, documentId, Array.from(update));
                }
            }
        );
    };

    const disconnect = () => {
        console.log("YjsClient: editor unmounted for", { projectId, documentId });
    };

    return { doc: ydoc, awareness, connect, disconnect };
};