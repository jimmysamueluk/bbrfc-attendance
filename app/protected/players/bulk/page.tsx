"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ParsedPlayer {
  firstName: string;
  lastName: string;
  position?: string;
}

export default function BulkUploadPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedPlayer[] | null>(null);
  const [result, setResult] = useState<{ created: number; failed: string[] } | null>(null);

  const parsePlayers = () => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const players: ParsedPlayer[] = [];
    for (const line of lines) {
      // Support "FirstName LastName" or "FirstName LastName, Position"
      const commaIdx = line.indexOf(",");
      let namePart = line;
      let position: string | undefined;

      if (commaIdx > -1) {
        namePart = line.substring(0, commaIdx).trim();
        position = line.substring(commaIdx + 1).trim() || undefined;
      }

      const parts = namePart.split(/\s+/);
      if (parts.length >= 2) {
        const firstName = parts[0];
        const lastName = parts.slice(1).join(" ");
        players.push({ firstName, lastName, position });
      } else if (parts.length === 1) {
        players.push({ firstName: parts[0], lastName: "" });
      }
    }

    setParsed(players);
  };

  const uploadMutation = useMutation({
    mutationFn: (players: ParsedPlayer[]) => usersApi.bulkRegister(players),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });

  const handleUpload = () => {
    if (!parsed || parsed.length === 0) return;
    uploadMutation.mutate(parsed);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/protected/players")}
          className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bulk Add Players</h1>
          <p className="text-sm text-gray-500">Paste a list of player names</p>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">
                  {result.created} player{result.created !== 1 ? "s" : ""} added
                  successfully
                </p>
              </div>
            </CardContent>
          </Card>

          {result.failed.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    {result.failed.length} failed:
                  </p>
                  <ul className="text-sm text-red-600 mt-1">
                    {result.failed.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setText("");
                setParsed(null);
                setResult(null);
              }}
            >
              Add More
            </Button>
            <Button onClick={() => router.push("/protected/players")}>
              View Players
            </Button>
          </div>
        </div>
      ) : !parsed ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player Names
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`One player per line:\n\nJohn Smith\nJane Doe, Prop\nMike Jones, Scrum Half`}
              rows={12}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Format: FirstName LastName or FirstName LastName, Position
            </p>
          </div>

          <Button
            onClick={parsePlayers}
            disabled={!text.trim()}
            className="w-full"
          >
            Preview Players
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 font-medium">
            {parsed.length} player{parsed.length !== 1 ? "s" : ""} to add:
          </p>

          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {parsed.map((p, i) => (
              <Card key={i}>
                <CardContent className="py-2 px-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {p.firstName} {p.lastName}
                  </span>
                  {p.position && (
                    <span className="text-xs text-gray-500">{p.position}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setParsed(null)}
            >
              Back to Edit
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add {parsed.length} Players
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
