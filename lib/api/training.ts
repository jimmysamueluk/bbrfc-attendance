import apiClient from "./client";
import type { TrainingSession, AttendanceRecord, PlayerStats } from "@/types";

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
    sessionType?: string;
    description?: string;
    duration?: number;
  }): Promise<{ session: TrainingSession }> => {
    const { data } = await apiClient.post("/training", session);
    return data;
  },

  recordAttendance: async (
    sessionId: number,
    attendance: AttendanceRecord[]
  ): Promise<{ session: TrainingSession }> => {
    const { data } = await apiClient.post(`/training/${sessionId}/attendance`, {
      attendance,
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
};
