import PresenceService from "./services/presence.services.js";
import TypingService from "./services/typing.service.js";
let ioInstance = null;

const presenceService = new PresenceService();
const typingService = new TypingService();

/**
 * Called once from server.js
 * Stores the Socket.IO instance
 */
export const initSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // ------------------------
    // PRESENCE JOIN
    // ------------------------
    socket.on("presence:join", (projectId) => {

      const roomName = `project:${projectId}`;

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
          userId: socket.user.id
        });
      }

      socket.on("document:join", (projectId, documentId) => {

        const roomName = `project:${projectId}:doc:${documentId}`;
      
        socket.join(roomName);
      
      });
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
          userId: socket.user.id
        });
      }
    });

    // ------------------------
    // DISCONNECT
    // ------------------------
    socket.on("disconnect", () => {
      const offlineTransitions =
        presenceService.removeSocketFromAllProjects(socket.id);

      for (const { projectId, userId } of offlineTransitions) {
        const roomName = `project:${projectId}`;

        socket.to(roomName).emit("presence:offline", {
          userId
        });
      }

      console.log("User disconnected:", socket.id);
    });

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

  });
};
/**
 * Emit an event to all users in a project room
 */
export const emitToProject = (projectId, event, payload) => {
  if (!ioInstance) {
    console.warn("Socket.io not initialized");
    return;
  }

  ioInstance.to(`project:${projectId}`).emit(event, payload);
};



