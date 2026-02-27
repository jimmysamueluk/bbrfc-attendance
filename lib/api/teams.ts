import apiClient from "./client";
import type { Team } from "@/types";

export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    const { data } = await apiClient.get("/teams");
    return data.teams || data;
  },
};
