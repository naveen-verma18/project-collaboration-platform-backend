import PresenceService from "./services/presence.services.js";
let ioInstance = null;

const presenceService = new PresenceService();

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



