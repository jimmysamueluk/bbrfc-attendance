"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { trainingApi } from "@/lib/api/training";
import { teamsApi } from "@/lib/api/teams";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: teamsApi.getAll,
  });

  const selectedTeamId = teamFilter !== "all" ? parseInt(teamFilter) : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", selectedTeamId],
    queryFn: () => trainingApi.getSessions(selectedTeamId),
    staleTime: 0,
    refetchOnMount: "always",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Training Sessions</h1>
        <Button
          size="sm"
          onClick={() => router.push("/protected/sessions/new")}
        >
          <Plus className="w-4 h-4 mr-1" />
          New Session
        </Button>
      </div>

      {teams && teams.length > 0 && (
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        >
          <option value="all">All Teams</option>
          {teams.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      ) : data?.sessions?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No training sessions yet</p>
          <p className="text-sm mt-1">Create your first session to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.sessions?.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
