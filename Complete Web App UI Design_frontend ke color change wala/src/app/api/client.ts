import { ApiResponse } from "./types";

const BASE_URL = "http://localhost:4000";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
    body?: any;
}

async function client<T>(
    endpoint: string,
    { body, ...customConfig }: FetchOptions = {}
): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            message: "An unknown error occurred",
        }));
        throw new Error(error.message || response.statusText);
    }

    // Handle empty responses (e.g. 204 No Content)
    if (response.status === 204) {
        return {} as T;
    }

    return (await response.json()) as ApiResponse<T>;
}

export { client };
