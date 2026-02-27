"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, TrendingDown, Minus, Trophy, Star } from "lucide-react";
import { trainingApi } from "@/lib/api/training";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const periods = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
];

export default function StatsPage() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["attendance-stats", days],
    queryFn: () => trainingApi.getAttendanceStats(days),
  });

  const { data: posData, isLoading: posLoading } = useQuery({
    queryKey: ["player-of-session-stats"],
    queryFn: () => trainingApi.getPlayerOfSessionStats(365),
  });

  const stats = data?.statistics
    ?.slice()
    .sort((a, b) => b.attendanceRate - a.attendanceRate);

  const leaderboard = posData?.leaderboard;

  return (
    <div className="space-y-6">
      {/* Player of the Session Leaderboard */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gold" />
          <h1 className="text-xl font-bold text-gray-900">Trainer of the Season</h1>
        </div>

        {posLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <p className="text-sm text-gray-500">
            No Player of the Session awards yet
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <Card
                key={entry.player.id}
                className={cn(
                  index === 0 && "border-gold/50 bg-gold/5"
                )}
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
        )}
      </div>

      {/* Attendance Stats */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-gray-900">Attendance Stats</h2>

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

        {data?.period && (
          <p className="text-sm text-gray-500">
            {data.period.totalSessions} sessions in period
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
          </div>
        ) : !stats || stats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No attendance data yet</p>
            <p className="text-sm mt-1">
              Record attendance for training sessions to see stats here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.map((stat) => {
              const rate = stat.attendanceRate;
              const RateIcon =
                rate >= 75 ? TrendingUp : rate >= 50 ? Minus : TrendingDown;
              const rateColor =
                rate >= 75
                  ? "text-green-600"
                  : rate >= 50
                  ? "text-yellow-600"
                  : "text-red-600";

              return (
                <Card key={stat.player.id}>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {stat.player.firstName} {stat.player.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stat.attendedSessions} of {stat.totalSessions} sessions
                      </p>
                    </div>
                    <div className={cn("flex items-center gap-1.5 font-bold text-lg", rateColor)}>
                      <RateIcon className="w-4 h-4" />
                      {rate}%
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
