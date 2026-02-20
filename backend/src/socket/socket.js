import PresenceService from "../services/presence.services.js";
import TypingService from "../services/typing.service.js";
import * as documentService from "../services/document.service.js";

let ioInstance = null;

const presenceService = new PresenceService();
const typingService = new TypingService();

export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

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
    });

    // ------------------------
    // DOCUMENT JOIN
    // ------------------------
    socket.on("document:join", (projectId, documentId) => {
      const roomName = `project:${projectId}:doc:${documentId}`;
      socket.activeDocuments.add(`${projectId}:${documentId}`);
      socket.join(roomName);
    });

    // ------------------------
    // DOCUMENT UPDATE (OCC)
    // ------------------------
    socket.on("document:update", async (data) => {
      try {
        const { projectId, documentId, title, content, version } = data;

        const result = await documentService.updateDocument({
          documentId,
          projectId,
          title,
          content,
          userId: socket.user.id,
          version,
        });

        if (result.conflict) {
          socket.emit("document:conflict", {
            success: false,
            data: null,
            error: {
              code: "VERSION_CONFLICT",
              documentId,
              latestContent: result.latestContent,
              latestTitle: result.latestTitle,
              latestVersion: result.latestVersion,
            },
          });
        }

      } catch (error) {
        socket.emit("document:error", {
          success: false,
          data: null,
          error: {
            code: "UPDATE_FAILED",
            message: error.message,
          },
        });
      }
    });

    // ------------------------
    // PRESENCE LEAVE
    // ------------------------
    socket.on("presence:leave", (projectId) => {
      const roomName = `project:${projectId}`;

      const { becameOffline } = presenceService.removeUser(
        projectId,
        socket.user.id,
        socket.id
      );

      socket.leave(roomName);

      if (becameOffline) {
        socket.to(roomName).emit("presence:offline", {
          userId: socket.user.id,
        });
      }
    });

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

      socket.activeProjects.clear();
      socket.activeDocuments.clear();

      console.log("User disconnected:", socket.id);
    });
  });
};

// Emit to project helper
export const emitToProject = (projectId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`project:${projectId}`).emit(event, payload);
};