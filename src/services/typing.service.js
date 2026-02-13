class TypingService {
    constructor() {
      // Map<projectId, Map<documentId, Map<userId, timeoutId>>>
      this.projects = new Map();
    }
  
    startTyping(projectId, documentId, userId) {}
  
    stopTyping(projectId, documentId, userId) {}
  
    removeUserFromAllDocuments(userId) {}
  
    getTypingUsers(projectId, documentId) {}

    startTyping(projectId, documentId, userId) {
        // Ensure project exists
        if (!this.projects.has(projectId)) {
          this.projects.set(projectId, new Map());
        }
      
        const projectMap = this.projects.get(projectId);
      
        // Ensure document exists
        if (!projectMap.has(documentId)) {
          projectMap.set(documentId, new Map());
        }
      
        const documentMap = projectMap.get(documentId);
      
        // If user already typing → reset timeout only
        if (documentMap.has(userId)) {
          const oldTimeout = documentMap.get(userId);
          clearTimeout(oldTimeout);
      
          const newTimeout = this.createTimeout(projectId, documentId, userId);
          documentMap.set(userId, newTimeout);
      
          return { changed: false };
        }
      
        // User not typing → add them
        const timeout = this.createTimeout(projectId, documentId, userId);
        documentMap.set(userId, timeout);
      
        return { changed: true };
      }

      createTimeout(projectId, documentId, userId) {
        return setTimeout(() => {
          this.stopTyping(projectId, documentId, userId);
        }, 3000);
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
      
        const timeout = documentMap.get(userId);
        clearTimeout(timeout);
      
        documentMap.delete(userId);
      
        // Cleanup empty document
        if (documentMap.size === 0) {
          projectMap.delete(documentId);
        }
      
        // Cleanup empty project
        if (projectMap.size === 0) {
          this.projects.delete(projectId);
        }
      
        return { changed: true };
      }


      getTypingUsers(projectId, documentId) {
        if (!this.projects.has(projectId)) {
          return [];
        }
      
        const projectMap = this.projects.get(projectId);
      
        if (!projectMap.has(documentId)) {
          return [];
        }
      
        const documentMap = projectMap.get(documentId);
      
        return Array.from(documentMap.keys());
      }

      removeUserFromAllDocuments(userId) {
        const updates = [];
      
        for (const [projectId, projectMap] of this.projects.entries()) {
          for (const [documentId, documentMap] of projectMap.entries()) {
            if (documentMap.has(userId)) {
              const timeout = documentMap.get(userId);
              clearTimeout(timeout);
      
              documentMap.delete(userId);
      
              updates.push({ projectId, documentId });
      
              if (documentMap.size === 0) {
                projectMap.delete(documentId);
              }
            }
          }
      
          if (projectMap.size === 0) {
            this.projects.delete(projectId);
          }
        }
      
        return updates;
      }
  }
  
  export default TypingService;