import { client } from "./client";

export const fileApi = {
    requestUploadUrl: async (payload: {
        projectId: string;
        documentId?: string;
        fileName: string;
        contentType: string;
        size: number;
    }) => {
        const res = await client<any>("/files/upload-url", { method: "POST", body: payload });
        return res;
    },

    requestDownloadUrl: async (fileId: string) => {
        const res = await client<any>(`/files/${fileId}/download-url`);
        return res;
    },
};
