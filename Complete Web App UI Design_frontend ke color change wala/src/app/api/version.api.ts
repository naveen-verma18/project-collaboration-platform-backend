import { client } from "./client";

export const versionApi = {
    getVersions: async (documentId: string) => {
        const res = await client<any[]>(`/documents/${documentId}/versions`);
        return res;
    },

    restoreVersion: async (documentId: string, version: number) => {
        const res = await client<any>(`/documents/${documentId}/restore/${version}`, { method: "POST" });
        return res;
    },
};
