import { client } from "./client";
import { Project } from "./types";

export const projects = {
    getAll: (status?: string) => client<Project[]>(`/projects${status ? `?status=${status}` : ""}`),
    getOne: (id: string) => client<Project>(`/projects/${id}`),
    create: (data: any) => client<Project>("/projects", { body: data }),
    update: (id: string, data: any) => client<Project>(`/projects/${id}`, { method: "PUT", body: data }),
    delete: (id: string) => client<any>(`/projects/${id}`, { method: "DELETE" }),

    // Progress
    getProgress: (id: string) => client<any>(`/projects/${id}/progress`),
};
