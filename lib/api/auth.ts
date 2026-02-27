import apiClient from "./client";
import type { LoginResponse } from "@/types";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },
};
