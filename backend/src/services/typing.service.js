class TypingService {
    constructor() {
      // Map<projectId, Map<documentId, Map<userId, timeoutId>>>
      this.projects = new Map();
      this.TYPING_TIMEOUT = 5000; // 5 seconds
    }
  
    startTyping(projectId, documentId, userId) {
      if (!this.projects.has(projectId)) {
        this.projects.set(projectId, new Map());
      }
  
      const projectMap = this.projects.get(projectId);
  
      if (!projectMap.has(documentId)) {
        projectMap.set(documentId, new Map());
      }
  
      const documentMap = projectMap.get(documentId);
  
      // If already typing → reset timer
      if (documentMap.has(userId)) {
        clearTimeout(documentMap.get(userId));
      }
  
      const timeoutId = setTimeout(() => {
        this.stopTyping(projectId, documentId, userId);
      }, this.TYPING_TIMEOUT);
  
      documentMap.set(userId, timeoutId);
  
      return { changed: true };
    }
  
    stopTyping(projectId, documentId, userId) {
      if (!this.projects.has(projectId)) {
        return { changed: false };
      }
  
      const projectMap = this.projects.get(projectId);
  
      if (!projectMap.has(documentId)) {
        return { changed: false };
      }
  
      const documentMap = projectMap.get(documentId);
  
      if (!documentMap.has(userId)) {
        return { changed: false };
      }
  
      clearTimeout(documentMap.get(userId));
      documentMap.delete(userId);
  
      if (documentMap.size === 0) {
        projectMap.delete(documentId);
      }
  
      if (projectMap.size === 0) {
        this.projects.delete(projectId);
      }
  
      return { changed: true };
    }
  
    getTypingUsers(projectId, documentId) {
      if (!this.projects.has(projectId)) return [];
  
      const projectMap = this.projects.get(projectId);
  
      if (!projectMap.has(documentId)) return [];
  
      return Array.from(projectMap.get(documentId).keys());
    }
  
    removeUserFromAllDocuments(userId) {
      const updates = [];
  
      for (const [projectId, projectMap] of this.projects.entries()) {
        for (const [documentId, documentMap] of projectMap.entries()) {
          if (documentMap.has(userId)) {
            clearTimeout(documentMap.get(userId));
            documentMap.delete(userId);
            updates.push({ projectId, documentId });
          }
        }
      }
  
      return updates;
    }
  }
  
  export default TypingService;