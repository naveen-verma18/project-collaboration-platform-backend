import { client } from "./client";

/**
 * The backend /login endpoint returns { success: true, token: string }
 * at the TOP level — NOT nested inside a `data` field.
 * We model this explicitly so callers can access `.token` directly.
 */
export interface AuthLoginResponse {
    success: boolean;
    token: string;
}

export const auth = {
    // Cast through unknown to match actual backend shape (token at top level, not in data)
    login: (data: any) =>
        client("/login", { body: data }) as unknown as Promise<AuthLoginResponse>,
    register: (data: any) => client("/signup", { body: data }),
};
