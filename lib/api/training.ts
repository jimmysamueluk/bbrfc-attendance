import apiClient from "./client";
import type { TrainingSession, AttendanceRecord, PlayerStats, PlayerOfSessionStats } from "@/types";

export const trainingApi = {
  getSessions: async (teamId?: number): Promise<{ sessions: TrainingSession[]; pagination: any }> => {
    const params: any = { limit: "50" };
    if (teamId) params.teamId = teamId;
    const { data } = await apiClient.get("/training", { params });
    return data;
  },

  getSession: async (id: number): Promise<{ session: TrainingSession }> => {
    const { data } = await apiClient.get(`/training/${id}`);
    return data;
  },

  createSession: async (session: {
    teamId?: number;
    sessionDate: string;
    sessionTime?: string;
    sessionType?: string;
    description?: string;
    duration?: number;
  }): Promise<{ session: TrainingSession }> => {
    const { data } = await apiClient.post("/training", session);
    return data;
  },

  updateSession: async (
    id: number,
    updates: { description?: string }
  ): Promise<{ session: TrainingSession }> => {
    const { data } = await apiClient.put(`/training/${id}`, updates);
    return data;
  },

  recordAttendance: async (
    sessionId: number,
    attendance: AttendanceRecord[],
    playerOfSessionIds?: number[],
    description?: string
  ): Promise<{ session: TrainingSession }> => {
    const { data } = await apiClient.post(`/training/${sessionId}/attendance`, {
      attendance,
      playerOfSessionIds: playerOfSessionIds || [],
      description,
    });
    return data;
  },

  getAttendanceStats: async (
    days: number = 30,
    teamId?: number
  ): Promise<{ statistics: PlayerStats[]; period: any }> => {
    const params: any = { days };
    if (teamId) params.teamId = teamId;
    const { data } = await apiClient.get("/training/stats/attendance", { params });
    return data;
  },

  getPlayerOfSessionStats: async (
    days: number = 365
  ): Promise<{ leaderboard: PlayerOfSessionStats[]; period: any }> => {
    const { data } = await apiClient.get("/training/stats/player-of-session", {
      params: { days },
    });
    return data;
  },
};
