"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerToggleCardProps {
  playerId: number;
  firstName: string;
  lastName: string;
  position?: string | null;
  present: boolean;
  onToggle: (playerId: number) => void;
}

export function PlayerToggleCard({
  playerId,
  firstName,
  lastName,
  position,
  present,
  onToggle,
}: PlayerToggleCardProps) {
  return (
    <button
      onClick={() => onToggle(playerId)}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all active:scale-[0.98] min-h-[56px]",
        present
          ? "border-green-500 bg-green-50"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="text-left">
        <p className="font-medium text-gray-900">
          {firstName} {lastName}
        </p>
        {position && (
          <p className="text-xs text-gray-500">{position}</p>
        )}
      </div>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          present ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
        )}
      >
        {present ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </div>
    </button>
  );
}
