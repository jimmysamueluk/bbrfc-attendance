"use client";

import Link from "next/link";
import { Calendar, Users, Clock, Star, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { TrainingSession } from "@/types";

interface SessionCardProps {
  session: TrainingSession;
}

export function SessionCard({ session }: SessionCardProps) {
  const presentCount =
    session.attendees?.filter((a) => a.present).length ?? 0;
  const totalCount = session.attendees?.length ?? 0;

  // Use playerAwards (multi) if available, fall back to legacy single
  const awardedPlayers =
    session.playerAwards && session.playerAwards.length > 0
      ? session.playerAwards.map((a) => a.player)
      : session.playerOfSession
      ? [session.playerOfSession]
      : [];

  return (
    <Link href={`/protected/sessions/${session.id}/attendance`}>
      <Card className="hover:shadow-md transition-shadow active:scale-[0.98]">
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>
                {formatDate(session.sessionDate)}
                {session.sessionTime && ` at ${session.sessionTime}`}
              </span>
            </div>
            <p className="font-semibold text-gray-900 truncate">
              {session.sessionType || "Training"}
            </p>
            {session.team && (
              <p className="text-sm text-gray-500">{session.team.name}</p>
            )}
            {awardedPlayers.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gold">
                <Star className="w-3 h-3 fill-gold flex-shrink-0" />
                <span className="truncate">
                  {awardedPlayers
                    .map((p) => `${p.firstName} ${p.lastName}`)
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              {session.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{session.duration} mins</span>
                </div>
              )}
              {session.description && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <StickyNote className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">
                    {session.description}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex-shrink-0">
            <Users className="w-4 h-4" />
            <span className="font-medium">
              {totalCount > 0 ? `${presentCount}/${totalCount}` : "--"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
