import { client } from "./client";
import { Goal, Decision, Document, ProjectMember, Activity } from "./types";

export const tasks = {
    getAll: (projectId: string) => client<any[]>(`/projects/${projectId}/tasks`),
    create: (projectId: string, data: any) => client<any>(`/projects/${projectId}/tasks`, { body: data }),
    update: (taskId: string, data: any) => client<any>(`/tasks/${taskId}`, { method: "PUT", body: data }),
    delete: (taskId: string) => client<any>(`/tasks/${taskId}`, { method: "DELETE" }),
};

export const goals = {
    getAll: (projectId: string) => client<Goal[]>(`/projects/${projectId}/goals`),
    create: (projectId: string, data: any) => client<Goal>(`/projects/${projectId}/goals`, { body: data }),
    complete: (goalId: string) => client<Goal>(`/goals/${goalId}/complete`, { method: "PATCH" }),
};

export const decisions = {
    getAll: (projectId: string) => client<Decision[]>(`/projects/${projectId}/decisions`),
    create: (projectId: string, data: any) => client<Decision>(`/projects/${projectId}/decisions`, { body: data }),
};

export const documents = {
    getAll: (projectId: string) => client<Document[]>(`/projects/${projectId}/documents`),
    create: (projectId: string, data: any) => client<Document>(`/projects/${projectId}/documents`, { body: data }),
    update: (documentId: string, data: any) =>
        client<Document>(`/documents/${documentId}`, { method: "PUT", body: data }),
    delete: (documentId: string) => client<void>(`/documents/${documentId}`, { method: "DELETE" }),
};

export const members = {
    getAll: (projectId: string) => client<ProjectMember[]>(`/projects/${projectId}/members`),
    invite: (projectId: string, email: string) =>
        client<any>(`/projects/${projectId}/invitations`, { body: { email } }),
    remove: (projectId: string, memberId: string) => client<any>(`/projects/${projectId}/members/${memberId}`, { method: "DELETE" }),
    changeRole: (projectId: string, memberId: string, role: string) => client<ProjectMember>(`/projects/${projectId}/members/${memberId}/role`, { method: "PATCH", body: { role } }),
};

export const activity = {
    getAll: (projectId: string) => client<Activity[]>(`/projects/${projectId}/activity`),
};

export const invitations = {
    getMy: () => client<any[]>(`/invitations`),
    accept: (id: string) => client<any>(`/invitations/${id}/accept`, { method: "PATCH" }),
    reject: (id: string) => client<any>(`/invitations/${id}/reject`, { method: "PATCH" }),
};
