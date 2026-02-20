import { client } from "./client";

export const auth = {
    login: (data: any) => client("/login", { body: data }),
    register: (data: any) => client("/signup", { body: data }),
};
