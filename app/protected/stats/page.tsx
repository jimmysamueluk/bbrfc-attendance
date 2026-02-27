"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

  const stats = data?.statistics
    ?.slice()
    .sort((a, b) => b.attendanceRate - a.attendanceRate);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Attendance Stats</h1>

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
  );
}
