"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Users,
  CalendarDays,
  Shield,
  ShieldAlert,
  Star,
  TrendingUp,
  Minus,
  TrendingDown,
} from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { useAuthStore } from "@/lib/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const periods = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-metrics", days],
    queryFn: () => adminApi.getMetrics(days),
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">Access Denied</p>
        <p className="text-sm mt-1">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Period selector */}
      <div className="flex gap-2">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => setDays(period.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              days === period.value
                ? "bg-burgundy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No data available</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="text-center py-4">
                <Users className="w-5 h-5 mx-auto text-burgundy mb-1" />
                <p className="text-2xl font-bold text-gray-900">
                  {data.overview.totalPlayers}
                </p>
                <p className="text-xs text-gray-500">Total Players</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <CalendarDays className="w-5 h-5 mx-auto text-burgundy mb-1" />
                <p className="text-2xl font-bold text-gray-900">
                  {data.overview.totalSessions}
                </p>
                <p className="text-xs text-gray-500">Total Sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <Shield className="w-5 h-5 mx-auto text-green-600 mb-1" />
                <p className="text-2xl font-bold text-green-600">
                  {data.overview.registeredPlayers}
                </p>
                <p className="text-xs text-gray-500">Registered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center py-4">
                <ShieldAlert className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-2xl font-bold text-red-500">
                  {data.overview.unregisteredPlayers}
                </p>
                <p className="text-xs text-gray-500">Not Registered</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardContent className="space-y-2">
              <h2 className="font-semibold text-gray-900">Recent Activity</h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sessions (last 7 days)</span>
                <span className="font-medium">{data.recentActivity.sessionsLast7Days}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sessions (last 30 days)</span>
                <span className="font-medium">{data.recentActivity.sessionsLast30Days}</span>
              </div>
            </CardContent>
          </Card>

          {/* Team Breakdown */}
          {data.teamBreakdown.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">Team Breakdown</h2>
              <p className="text-xs text-gray-400">
                Sessions and attendance in the last {days} days
              </p>
              <div className="space-y-2">
                {data.teamBreakdown.map((tb) => {
                  const rateColor =
                    tb.avgAttendanceRate >= 75
                      ? "text-green-600"
                      : tb.avgAttendanceRate >= 50
                      ? "text-yellow-600"
                      : tb.avgAttendanceRate > 0
                      ? "text-red-600"
                      : "text-gray-400";
                  return (
                    <Card key={tb.team.id}>
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{tb.team.name}</p>
                          <p className="text-xs text-gray-500">
                            {tb.playerCount} players · {tb.sessionCount} sessions
                          </p>
                        </div>
                        <div className={cn("font-bold text-lg", rateColor)}>
                          {tb.sessionCount > 0 ? `${tb.avgAttendanceRate}%` : "—"}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Attendees */}
          {data.topAttendees.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">Top Attendees</h2>
              <div className="space-y-2">
                {data.topAttendees.map((entry, index) => {
                  const rate = entry.attendanceRate;
                  const RateIcon =
                    rate >= 75 ? TrendingUp : rate >= 50 ? Minus : TrendingDown;
                  const rateColor =
                    rate >= 75
                      ? "text-green-600"
                      : rate >= 50
                      ? "text-yellow-600"
                      : "text-red-600";
                  return (
                    <Card
                      key={entry.player.id}
                      className={cn(index === 0 && "border-burgundy/30 bg-burgundy/5")}
                    >
                      <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                              index === 0
                                ? "bg-burgundy text-white"
                                : "bg-gray-100 text-gray-500"
                            )}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {entry.player.firstName} {entry.player.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {entry.sessionsAttended} of {entry.totalSessions} sessions
                            </p>
                          </div>
                        </div>
                        <div className={cn("flex items-center gap-1 font-bold", rateColor)}>
                          <RateIcon className="w-4 h-4" />
                          {rate}%
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Award Winners */}
          {data.topAwardWinners.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">Top Award Winners</h2>
              <div className="space-y-2">
                {data.topAwardWinners.map((entry, index) => (
                  <Card
                    key={entry.player.id}
                    className={cn(index === 0 && "border-gold/50 bg-gold/5")}
                  >
                    <CardContent className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                            index === 0
                              ? "bg-gold text-white"
                              : index === 1
                              ? "bg-gray-300 text-white"
                              : index === 2
                              ? "bg-amber-700 text-white"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {index + 1}
                        </span>
                        <p className="font-medium text-gray-900">
                          {entry.player.firstName} {entry.player.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-gold font-bold">
                        <Star className="w-4 h-4 fill-gold" />
                        {entry.awardCount}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
