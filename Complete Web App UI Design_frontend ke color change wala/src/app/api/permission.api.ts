import { client } from "./client";

export const permissionApi = {
    getRole: async (documentId: string) => {
        const res = await client<any>(`/documents/${documentId}/role`);
        return res;
    },

    getPermissions: async (documentId: string) => {
        const res = await client<any[]>(`/documents/${documentId}/permissions`);
        return res;
    },

    setRole: async (documentId: string, userId: string, role: string) => {
        const res = await client<any>(`/documents/${documentId}/permissions/${userId}`, { method: "PUT", body: { role } });
        return res;
    },
};
