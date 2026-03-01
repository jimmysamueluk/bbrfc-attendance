import { useCallback } from "react";
import { analyticsApi } from "@/lib/api/analytics";

const SESSION_KEY = "analyticsSessionId";

export function getAnalyticsSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setAnalyticsSessionId(sessionId: string) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearAnalyticsSessionId() {
  localStorage.removeItem(SESSION_KEY);
}

export function useAnalytics() {
  const trackPageView = useCallback((page: string) => {
    analyticsApi.trackPageView(page);
  }, []);

  const trackFeature = useCallback((featureName: string) => {
    analyticsApi.trackFeature(featureName);
  }, []);

  const trackEvent = useCallback(
    (eventType: string, eventName: string, page?: string, metadata?: any) => {
      const sessionId = getAnalyticsSessionId();
      if (sessionId) {
        analyticsApi.trackEvent(sessionId, eventType, eventName, page, metadata);
      }
    },
    []
  );

  return { trackPageView, trackFeature, trackEvent };
}
