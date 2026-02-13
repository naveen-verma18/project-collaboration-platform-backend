class PresenceService {
    constructor() {
      // Map<projectId, Map<userId, Set<socketId>>>
      this.projects = new Map();
    }
  
    addUser(projectId, userId, socketId) {
      // Ensure project exists
      if (!this.projects.has(projectId)) {
        this.projects.set(projectId, new Map());
      }
  
      const projectMap = this.projects.get(projectId);
  
      // Ensure user entry exists
      if (!projectMap.has(userId)) {
        projectMap.set(userId, new Set());
      }
  
      const userSockets = projectMap.get(userId);
  
      const wasOffline = userSockets.size === 0;
  
      userSockets.add(socketId);
  
      return {
        becameOnline: wasOffline
      };
    }
  
    removeUser(projectId, userId, socketId) {
      if (!this.projects.has(projectId)) {
        return { becameOffline: false };
      }
  
      const projectMap = this.projects.get(projectId);
  
      if (!projectMap.has(userId)) {
        return { becameOffline: false };
      }
  
      const userSockets = projectMap.get(userId);
  
      userSockets.delete(socketId);
  
      const becameOffline = userSockets.size === 0;
  
      if (becameOffline) {
        projectMap.delete(userId);
      }
  
      // Cleanup empty project
      if (projectMap.size === 0) {
        this.projects.delete(projectId);
      }
  
      return { becameOffline };
    }
  
    removeSocketFromAllProjects(socketId) {
      const offlineTransitions = [];
  
      for (const [projectId, projectMap] of this.projects.entries()) {
        for (const [userId, userSockets] of projectMap.entries()) {
          if (userSockets.has(socketId)) {
            userSockets.delete(socketId);
  
            if (userSockets.size === 0) {
              projectMap.delete(userId);
              offlineTransitions.push({ projectId, userId });
            }
          }
        }
  
        if (projectMap.size === 0) {
          this.projects.delete(projectId);
        }
      }
  
      return offlineTransitions;
    }
  
    getOnlineUsers(projectId) {
      if (!this.projects.has(projectId)) {
        return [];
      }
  
      return Array.from(this.projects.get(projectId).keys());
    }
  }
  export default PresenceService;
//   module.exports = PresenceService;