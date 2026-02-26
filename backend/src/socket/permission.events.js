/**
 * Handles broadcasting permission changes to connected users via Socket.IO
 */
export const broadcastPermissionUpdate = (io, documentId, userId, newRole) => {
    // Room-based broadcast: Everyone currently viewing the document gets the update
    // Clients can then adjust their local UI (e.g. enable/disable editor)
    io.to(`document:${documentId}`).emit("document:permission-update", {
        userId,
        role: newRole
    });
};

export const broadcastMemberRoleChange = (io, projectId, userId, newRole) => {
    // Notify all members of a project when a role changes
    io.to(`project:${projectId}`).emit("project:member-role-update", {
        userId,
        role: newRole
    });
};
