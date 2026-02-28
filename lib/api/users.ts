import apiClient from "./client";
import type { User } from "@/types";

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get("/users");
    return data.users || data;
  },

  getPlayers: async (): Promise<User[]> => {
    const users = await usersApi.getAll();
    return users.filter((u) => u.role === "player");
  },

  registerPlayer: async (player: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    position?: string;
    teamId?: number;
  }): Promise<User> => {
    const { data } = await apiClient.post("/auth/register", {
      ...player,
      role: "player",
    });
    return data.user || data;
  },

  toggleRegistration: async (userId: number): Promise<User> => {
    const { data } = await apiClient.patch(`/users/${userId}/registration`);
    return data.user;
  },

  bulkRegister: async (
    players: { firstName: string; lastName: string; position?: string }[],
    teamId?: number
  ): Promise<{ created: number; failed: string[] }> => {
    const { data } = await apiClient.post("/users/bulk-register", {
      players,
      teamId,
    });
    return data;
  },
};
