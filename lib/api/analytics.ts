import apiClient from "./client";

// All analytics calls are fire-and-forget — never block the UI
function fireAndForget(fn: () => Promise<any>) {
  fn().catch(() => {}); // silently ignore analytics errors
}

export const analyticsApi = {
  startSession: async (): Promise<{ sessionId: string; id: number }> => {
    const { data } = await apiClient.post("/analytics/session/start");
    return data;
  },

  endSession: (sessionId: string) => {
    fireAndForget(() => apiClient.post("/analytics/session/end", { sessionId }));
  },

  trackPageView: (page: string) => {
    fireAndForget(() => apiClient.post("/analytics/page-view", { page }));
  },

  trackFeature: (featureName: string) => {
    fireAndForget(() =>
      apiClient.post("/analytics/feature-usage", { featureName })
    );
  },

  trackEvent: (sessionId: string, eventType: string, eventName: string, page?: string, metadata?: any) => {
    fireAndForget(() =>
      apiClient.post("/analytics/event", {
        sessionId,
        eventType,
        eventName,
        page,
        metadata,
      })
    );
  },

  getDashboard: async (): Promise<AnalyticsDashboard> => {
    const { data } = await apiClient.get("/analytics/dashboard");
    return data;
  },
};

export interface AnalyticsDashboard {
  totalUsers: number;
  activeSessions: number;
  topFeatures: Array<{
    featureName: string;
    _sum: { usageCount: number | null; totalDuration: number | null };
  }>;
  topPages: Array<{
    page: string;
    _sum: { visitCount: number | null; totalDuration: number | null };
  }>;
  recentErrors: Array<{
    id: number;
    errorType: string;
    errorMessage: string;
    page: string | null;
    timestamp: string;
    user: { firstName: string; lastName: string; email: string } | null;
  }>;
  userActivity: Array<{
    userId: number;
    _count: { id: number };
    user: { id: number; firstName: string; lastName: string; role: string } | null;
  }>;
  deviceStats: Array<{
    deviceType: string | null;
    _count: { id: number };
  }>;
}
