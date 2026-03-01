import apiClient from "./client";

export interface AdminMetrics {
  overview: {
    totalPlayers: number;
    totalSessions: number;
    totalTeams: number;
    registeredPlayers: number;
    unregisteredPlayers: number;
  };
  recentActivity: {
    sessionsLast7Days: number;
    sessionsLast30Days: number;
  };
  teamBreakdown: Array<{
    team: { id: number; name: string; ageGroup?: string | null };
    sessionCount: number;
    playerCount: number;
    avgAttendanceRate: number;
  }>;
  topAttendees: Array<{
    player: { id: number; firstName: string; lastName: string };
    sessionsAttended: number;
    totalSessions: number;
    attendanceRate: number;
  }>;
  topAwardWinners: Array<{
    player: { id: number; firstName: string; lastName: string };
    awardCount: number;
  }>;
}

export const adminApi = {
  getMetrics: async (days: number = 30): Promise<AdminMetrics> => {
    const { data } = await apiClient.get("/admin/metrics", {
      params: { days },
    });
    return data;
  },
};
