let ioInstance = null;

/**
 * Called once from server.js
 * Stores the Socket.IO instance
 */
export const initSocket = (io) => {
  ioInstance = io;
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
