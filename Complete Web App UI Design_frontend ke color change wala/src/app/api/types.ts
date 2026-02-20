export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Goal {
    id: string;
    title: string;
    description: string;
    status: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Document {
    id: string;
    title: string;
    content: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    type?: string;
}

export interface Decision {
    id: string;
    title: string;
    description: string;
    reason: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    creator?: {
        name: string;
    };
}

export interface Activity {
    id: string;
    title?: string;
    description: string;
    type: string;
    projectId: string;
    createdAt: string;
    user?: {
        name: string;
    };
}

export interface ProjectMember {
    id: string;
    projectId: string;
    userId: string;
    role: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
}
