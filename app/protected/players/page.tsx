"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Upload, ShieldCheck, ShieldAlert } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { teamsApi } from "@/lib/api/teams";
import { analyticsApi } from "@/lib/api/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const regFilters = ["All", "Registered", "Not Registered"] as const;
type RegFilter = (typeof regFilters)[number];

export default function PlayersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [regFilter, setRegFilter] = useState<RegFilter>("All");
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: usersApi.getPlayers,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: teamsApi.getAll,
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: number) => usersApi.toggleRegistration(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      analyticsApi.trackFeature("toggle_registration");
    },
  });

  const filtered = players?.filter((p) => {
    if (regFilter === "Registered" && !p.registered) return false;
    if (regFilter === "Not Registered" && p.registered) return false;
    if (teamFilter === "none" && p.teamId) return false;
    if (teamFilter !== "all" && teamFilter !== "none" && p.teamId !== parseInt(teamFilter)) return false;
    return true;
  });

  const registeredCount = filtered?.filter((p) => p.registered).length ?? 0;
  const unregisteredCount = (filtered?.length ?? 0) - registeredCount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Players</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/protected/players/bulk")}
          >
            <Upload className="w-4 h-4 mr-1" />
            Bulk Add
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/protected/players/new")}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Team filter */}
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
          <option value="none">No Team</option>
        </select>
      )}

      {/* Registration filter */}
      <div className="flex gap-2">
        {regFilters.map((f) => (
          <button
            key={f}
            onClick={() => setRegFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              regFilter === f
                ? "bg-burgundy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered && (
        <p className="text-sm text-gray-500">
          {registeredCount} registered · {unregisteredCount} not registered · {filtered.length} total
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">
            {regFilter === "All" && teamFilter === "all"
              ? "No players yet"
              : "No matching players"}
          </p>
          {regFilter === "All" && teamFilter === "all" && (
            <p className="text-sm mt-1">Add players to get started</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered
            .sort((a, b) => a.lastName.localeCompare(b.lastName))
            .map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onToggle={() => toggleMutation.mutate(player.id)}
                toggling={toggleMutation.isPending}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  onToggle,
  toggling,
}: {
  player: User;
  onToggle: () => void;
  toggling: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="font-medium text-gray-900">
            {player.firstName} {player.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {player.position || "No position"}
            {player.team && ` · ${player.team.name}`}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={toggling}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            player.registered
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          )}
        >
          {player.registered ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              Registered
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              Not Registered
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}
