"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { trainingApi } from "@/lib/api/training";
import { teamsApi } from "@/lib/api/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const sessionSchema = z.object({
  sessionDate: z.string().min(1, "Date is required"),
  sessionType: z.string().min(1, "Session type is required"),
  teamId: z.string().optional(),
  description: z.string().optional(),
  duration: z.string().optional(),
});

type SessionForm = z.infer<typeof sessionSchema>;

const sessionTypes = [
  { value: "Training", label: "Training" },
  { value: "Fitness", label: "Fitness" },
  { value: "Skills", label: "Skills" },
  { value: "Match Prep", label: "Match Prep" },
  { value: "Recovery", label: "Recovery" },
];

export default function NewSessionPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: teamsApi.getAll,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      sessionDate: new Date().toISOString().split("T")[0],
      sessionType: "Training",
    },
  });

  const createMutation = useMutation({
    mutationFn: trainingApi.createSession,
    onSuccess: (data) => {
      router.push(`/protected/sessions/${data.session.id}/attendance`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to create session");
    },
  });

  const onSubmit = (data: SessionForm) => {
    createMutation.mutate({
      sessionDate: new Date(data.sessionDate).toISOString(),
      sessionType: data.sessionType,
      teamId: data.teamId ? parseInt(data.teamId) : undefined,
      description: data.description || undefined,
      duration: data.duration ? parseInt(data.duration) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Session</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          id="sessionDate"
          type="date"
          label="Date"
          error={errors.sessionDate?.message}
          {...register("sessionDate")}
        />

        <Select
          id="sessionType"
          label="Session Type"
          options={sessionTypes}
          error={errors.sessionType?.message}
          {...register("sessionType")}
        />

        {teams && teams.length > 0 && (
          <Select
            id="teamId"
            label="Team (optional)"
            placeholder="All players"
            options={teams.map((t) => ({
              value: String(t.id),
              label: t.name + (t.ageGroup ? ` (${t.ageGroup})` : ""),
            }))}
            {...register("teamId")}
          />
        )}

        <Input
          id="duration"
          type="number"
          label="Duration (minutes, optional)"
          placeholder="90"
          {...register("duration")}
        />

        <Input
          id="description"
          label="Notes (optional)"
          placeholder="Session details..."
          {...register("description")}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full"
          size="lg"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create & Take Attendance"
          )}
        </Button>
      </form>
    </div>
  );
}
