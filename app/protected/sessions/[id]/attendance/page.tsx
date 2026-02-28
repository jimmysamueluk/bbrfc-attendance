"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  Save,
  CheckCheck,
  Star,
  StickyNote,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { trainingApi } from "@/lib/api/training";
import { usersApi } from "@/lib/api/users";
import { PlayerToggleCard } from "@/components/PlayerToggleCard";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
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
  const [playerOfSessionIds, setPlayerOfSessionIds] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [notesOpen, setNotesOpen] = useState(false);
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
      players.forEach((p) => {
        existing[p.id] = false;
      });
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

  // Initialize player of session awards from existing data
  useEffect(() => {
    if (sessionData?.session?.playerAwards) {
      setPlayerOfSessionIds(
        sessionData.session.playerAwards.map((a) => a.playerId)
      );
    } else if (sessionData?.session?.playerOfSessionId) {
      // Legacy fallback
      setPlayerOfSessionIds([sessionData.session.playerOfSessionId]);
    }
  }, [sessionData]);

  // Initialize notes from existing data
  useEffect(() => {
    if (sessionData?.session?.description) {
      setNotes(sessionData.session.description);
      setNotesOpen(true);
    }
  }, [sessionData]);

  const saveMutation = useMutation({
    mutationFn: (records: AttendanceRecord[]) =>
      trainingApi.recordAttendance(
        sessionId,
        records,
        playerOfSessionIds,
        notes || undefined
      ),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const handleToggle = (playerId: number) => {
    setAttendance((prev) => {
      const newState = { ...prev, [playerId]: !prev[playerId] };
      // If toggling off a player who has a PoS award, remove them
      if (!newState[playerId] && playerOfSessionIds.includes(playerId)) {
        setPlayerOfSessionIds((ids) => ids.filter((id) => id !== playerId));
      }
      return newState;
    });
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
    if (allPresent) setPlayerOfSessionIds([]);
    setSaved(false);
  };

  const handleTogglePoS = (playerId: number) => {
    setPlayerOfSessionIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
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
  const presentPlayers = players
    ?.filter((p) => attendance[p.id])
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

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
              {session.sessionTime && ` at ${session.sessionTime}`}
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
              <span className="font-semibold text-burgundy">{presentCount}</span>{" "}
              of {players.length} present
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                <CheckCheck className="w-4 h-4 mr-1" />
                {players.every((p) => attendance[p.id])
                  ? "Deselect All"
                  : "Select All"}
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
                  registered={player.registered}
                  present={attendance[player.id] ?? false}
                  onToggle={handleToggle}
                />
              ))}
          </div>

          {/* Player of the Session - Multi-select */}
          {presentPlayers && presentPlayers.length > 0 && (
            <div className="border-2 border-gold/30 bg-gold/5 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-gold fill-gold" />
                <h2 className="font-semibold text-gray-900">
                  Player{playerOfSessionIds.length !== 1 ? "s" : ""} of the
                  Session
                </h2>
              </div>
              <p className="text-xs text-gray-500">
                Tap to select one or more standout players
              </p>
              <div className="flex flex-wrap gap-2">
                {presentPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleTogglePoS(player.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      playerOfSessionIds.includes(player.id)
                        ? "bg-gold text-white shadow-md"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-gold"
                    )}
                  >
                    {playerOfSessionIds.includes(player.id) && (
                      <Star className="w-3 h-3 inline mr-1 fill-white" />
                    )}
                    {player.firstName} {player.lastName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session Notes */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setNotesOpen(!notesOpen)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-gray-400" />
                Session Notes
                {notes && !notesOpen && (
                  <span className="text-xs text-gray-400 truncate max-w-[150px]">
                    — {notes}
                  </span>
                )}
              </div>
              {notesOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {notesOpen && (
              <div className="px-4 pb-4">
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="E.g. Jimmy needs a new gum shield, Jack needs a new contact top..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent resize-none"
                />
              </div>
            )}
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
