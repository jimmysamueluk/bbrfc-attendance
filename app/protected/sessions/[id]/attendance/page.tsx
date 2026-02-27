"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, UserPlus, Save, CheckCheck } from "lucide-react";
import { trainingApi } from "@/lib/api/training";
import { usersApi } from "@/lib/api/users";
import { PlayerToggleCard } from "@/components/PlayerToggleCard";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { AttendanceRecord } from "@/types";

export default function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const sessionId = parseInt(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => trainingApi.getSession(sessionId),
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["players"],
    queryFn: usersApi.getPlayers,
  });

  // Initialize attendance state from existing records
  useEffect(() => {
    if (sessionData?.session?.attendees && players) {
      const existing: Record<number, boolean> = {};
      // First set all players to absent
      players.forEach((p) => {
        existing[p.id] = false;
      });
      // Then mark those with existing records
      sessionData.session.attendees.forEach((a) => {
        existing[a.playerId] = a.present;
      });
      setAttendance(existing);
    } else if (players) {
      const initial: Record<number, boolean> = {};
      players.forEach((p) => {
        initial[p.id] = false;
      });
      setAttendance(initial);
    }
  }, [sessionData, players]);

  const saveMutation = useMutation({
    mutationFn: (records: AttendanceRecord[]) =>
      trainingApi.recordAttendance(sessionId, records),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const handleToggle = (playerId: number) => {
    setAttendance((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
    setSaved(false);
  };

  const handleSelectAll = () => {
    if (!players) return;
    const allPresent = players.every((p) => attendance[p.id]);
    const updated: Record<number, boolean> = {};
    players.forEach((p) => {
      updated[p.id] = !allPresent;
    });
    setAttendance(updated);
    setSaved(false);
  };

  const handleSave = () => {
    if (!players) return;
    const records: AttendanceRecord[] = players.map((p) => ({
      playerId: p.id,
      present: attendance[p.id] ?? false,
    }));
    saveMutation.mutate(records);
  };

  const session = sessionData?.session;
  const isLoading = sessionLoading || playersLoading;
  const presentCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/protected/dashboard")}
          className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Take Attendance</h1>
          {session && (
            <p className="text-sm text-gray-500">
              {session.sessionType || "Training"} &middot;{" "}
              {formatDate(session.sessionDate)}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      ) : !players || players.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No players found</p>
          <p className="text-sm mt-1">Add players to start tracking attendance</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/protected/players/new")}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-burgundy">{presentCount}</span> of{" "}
              {players.length} present
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                <CheckCheck className="w-4 h-4 mr-1" />
                {players.every((p) => attendance[p.id]) ? "Deselect All" : "Select All"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/protected/players/new")}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {players
              .sort((a, b) => a.lastName.localeCompare(b.lastName))
              .map((player) => (
                <PlayerToggleCard
                  key={player.id}
                  playerId={player.id}
                  firstName={player.firstName}
                  lastName={player.lastName}
                  position={player.position}
                  present={attendance[player.id] ?? false}
                  onToggle={handleToggle}
                />
              ))}
          </div>

          <div className="sticky bottom-4 pt-2">
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full shadow-lg"
              size="lg"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Attendance ({presentCount}/{players.length})
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
