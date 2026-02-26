import * as Y from "yjs";
import jwt from "jsonwebtoken";
import PresenceService from "../services/presence.services.js";
import TypingService from "../services/typing.service.js";
import * as documentService from "../services/document.service.js";
import { getActiveDoc, registerUserToDoc, unregisterUserFromDoc } from "./ydoc.manager.js";
import { YDocService } from "../services/ydoc.service.js";

let ioInstance = null;

const presenceService = new PresenceService();
const typingService = new TypingService();

export const initSocket = (io) => {
  ioInstance = io;

  // ------------------------
  // SOCKET AUTH MIDDLEWARE
  // ------------------------
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      console.error("Socket Auth Error: No token provided");
      return next(new Error("Unauthorized: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
      };
      console.log(`Socket Auth Success: User ${socket.user.id} (${socket.id})`);
      next();
    } catch (err) {
      console.error("Socket Auth Error: Invalid token", err.message);
      next(new Error("Unauthorized: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`✅ User ${socket.user.id} connected (socket ${socket.id})`);

    socket.activeProjects = new Set();
    socket.activeDocuments = new Set();

    // ------------------------
    // PRESENCE JOIN
    // ------------------------
    socket.on("presence:join", (projectId) => {
      const roomName = `project:${projectId}`;
      socket.activeProjects.add(projectId);
      socket.join(roomName);

      const { becameOnline } = presenceService.addUser(
        projectId,
        socket.user.id,
        socket.id
      );

      const onlineUsers = presenceService.getOnlineUsers(projectId);
      socket.emit("presence:list", onlineUsers);

      if (becameOnline) {
        socket.to(roomName).emit("presence:online", {
          userId: socket.user.id,
        });
      }
      console.log(`User ${socket.user.id} joined presence room: ${roomName}`);
    });

    // ------------------------
    // DOCUMENT JOIN
    // ------------------------
    socket.on("document:join", async (projectId, documentId) => {
      const roomName = `project:${projectId}:doc:${documentId}`;
      socket.join(roomName);
    
      try {
        const role = await registerUserToDoc(socket.id, documentId, socket.user.id);
        socket.emit("document:joined", { role });
    
        const ydoc = await getActiveDoc(documentId);
        const initialUpdate = Y.encodeStateAsUpdate(ydoc);
    
        console.log("[Socket] Sending initial Y.Doc state", {
          documentId,
          bytes: initialUpdate.length,
        });
    
        socket.emit("document:initial", {
          update: Array.from(initialUpdate),
          hasSnapshot: initialUpdate.length > 2,
        });
    
      } catch (err) {
        console.error("Join error:", err);
      }
    });

    // ------------------------
    // DOCUMENT SYNC (Y.js CRDT)
    // ------------------------
    socket.on("document:sync-request", async (projectId, documentId, clientStateVector) => {
      console.log(`Sync Request from ${socket.user.id} for doc ${documentId}`);
      const ydoc = await getActiveDoc(documentId);

      try {
        if (!clientStateVector || clientStateVector.length === 0) {
          // Client sends nothing or empty -> send step 1 (server state vector)
          const stateVector = YDocService.getSyncStep1(ydoc);
          socket.emit("document:sync-response", { step: 1, data: Array.from(stateVector) });
        } else {
          // Client sends their state vector -> send step 2 (missing updates)
          const update = YDocService.getSyncStep2(ydoc, new Uint8Array(clientStateVector));
          socket.emit("document:sync-response", { step: 2, data: Array.from(update) });
        }
      } catch (err) {
        console.error("Sync Error:", err);
      }
    });

    socket.on("document:sync-step", async (projectId, documentId, updateData) => {
      const roomName = `project:${projectId}:doc:${documentId}`;
      const ydoc = await getActiveDoc(documentId);
    
      try {
        const updateBuffer = new Uint8Array(updateData);
    
        // 1️⃣ Apply update to server Y.Doc (in memory)
        Y.applyUpdate(ydoc, updateBuffer);
    
        // 2️⃣ Persist update to DB
        await YDocService.saveUpdate(documentId, updateBuffer);
    
        // 3️⃣ Broadcast to other clients
        socket.to(roomName).emit(
          "document:sync-update",
          Array.from(updateBuffer)
        );
    
      } catch (err) {
        console.error("Sync Step Error:", err);
      }
    });

    // console.log("[Socket] Update applied + persisted", {
    //   documentId,
    //   bytes: updateBuffer.length,
    // });
    // ------------------------
    // TYPING START
    // ------------------------
    socket.on("typing:start", (projectId, documentId) => {
      const { changed } = typingService.startTyping(
        projectId,
        documentId,
        socket.user.id
      );

      if (changed) {
        const roomName = `project:${projectId}:doc:${documentId}`;
        const typingUsers = typingService.getTypingUsers(
          projectId,
          documentId
        );
        ioInstance.to(roomName).emit("typing:update", typingUsers);
      }
    });

    // ------------------------
    // TYPING STOP
    // ------------------------
    socket.on("typing:stop", (projectId, documentId) => {
      const { changed } = typingService.stopTyping(
        projectId,
        documentId,
        socket.user.id
      );

      if (changed) {
        const roomName = `project:${projectId}:doc:${documentId}`;
        const typingUsers = typingService.getTypingUsers(
          projectId,
          documentId
        );
        ioInstance.to(roomName).emit("typing:update", typingUsers);
      }
    });

    // ------------------------
    // DISCONNECT CLEANUP
    // ------------------------
    socket.on("disconnect", () => {
      console.log(`❌ User ${socket.user.id} disconnected (socket ${socket.id})`);

      // Presence cleanup
      const offlineTransitions =
        presenceService.removeSocketFromAllProjects(socket.id);

      for (const { projectId, userId } of offlineTransitions) {
        const roomName = `project:${projectId}`;
        socket.to(roomName).emit("presence:offline", { userId });
      }

      // Typing cleanup
      const typingUpdates =
        typingService.removeUserFromAllDocuments(socket.user.id);

      for (const { projectId, documentId } of typingUpdates) {
        const roomName = `project:${projectId}:doc:${documentId}`;
        const typingUsers = typingService.getTypingUsers(
          projectId,
          documentId
        );
        ioInstance.to(roomName).emit("typing:update", typingUsers);
      }

      // Unregister from all documents
      for (const entry of socket.activeDocuments) {
        const [proj, doc] = entry.split(":");
        unregisterUserFromDoc(socket.id, doc);
      }

      socket.activeProjects.clear();
      socket.activeDocuments.clear();
    });
  });
};

// Emit to project helper
export const emitToProject = (projectId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`project:${projectId}`).emit(event, payload);
};
