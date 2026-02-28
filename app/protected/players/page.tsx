"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, Upload, ShieldCheck, ShieldAlert } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const filters = ["All", "Registered", "Not Registered"] as const;
type Filter = (typeof filters)[number];

export default function PlayersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("All");

  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: usersApi.getPlayers,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const toggleMutation = useMutation({
    mutationFn: (userId: number) => usersApi.toggleRegistration(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  const filtered = players?.filter((p) => {
    if (filter === "Registered") return p.registered;
    if (filter === "Not Registered") return !p.registered;
    return true;
  });

  const registeredCount = players?.filter((p) => p.registered).length ?? 0;
  const unregisteredCount = (players?.length ?? 0) - registeredCount;

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

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === f
                ? "bg-burgundy text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {players && (
        <p className="text-sm text-gray-500">
          {registeredCount} registered · {unregisteredCount} not registered · {players.length} total
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">
            {filter === "All" ? "No players yet" : `No ${filter.toLowerCase()} players`}
          </p>
          {filter === "All" && (
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
