"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { teamsApi } from "@/lib/api/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const playerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().optional(),
  teamId: z.string().optional(),
});

type PlayerForm = z.infer<typeof playerSchema>;

const positions = [
  { value: "Loosehead Prop", label: "Loosehead Prop" },
  { value: "Hooker", label: "Hooker" },
  { value: "Tighthead Prop", label: "Tighthead Prop" },
  { value: "Lock", label: "Lock" },
  { value: "Blindside Flanker", label: "Blindside Flanker" },
  { value: "Openside Flanker", label: "Openside Flanker" },
  { value: "Number 8", label: "Number 8" },
  { value: "Scrum Half", label: "Scrum Half" },
  { value: "Fly Half", label: "Fly Half" },
  { value: "Inside Centre", label: "Inside Centre" },
  { value: "Outside Centre", label: "Outside Centre" },
  { value: "Left Wing", label: "Left Wing" },
  { value: "Right Wing", label: "Right Wing" },
  { value: "Full Back", label: "Full Back" },
];

export default function AddPlayerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: teamsApi.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlayerForm>({
    resolver: zodResolver(playerSchema),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.registerPlayer,
    onSuccess: (data) => {
      setSuccess(`${data.firstName || "Player"} added successfully!`);
      setError("");
      reset();
      queryClient.invalidateQueries({ queryKey: ["players"] });
      setTimeout(() => setSuccess(""), 3000);
    },
    onError: (err: any) => {
      const data = err.response?.data;
      const message = data?.error
        || data?.errors?.map((e: any) => e.msg).join(", ")
        || "Failed to add player";
      setError(message);
      setSuccess("");
    },
  });

  const onSubmit = (data: PlayerForm) => {
    const email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}.${Date.now()}@bbrfc.player`;
    createMutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      password: "player123",
      position: data.position || undefined,
      teamId: data.teamId ? parseInt(data.teamId) : undefined,
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
        <h1 className="text-xl font-bold text-gray-900">Add Player</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <Input
          id="firstName"
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          id="lastName"
          label="Last Name"
          placeholder="Smith"
          error={errors.lastName?.message}
          {...register("lastName")}
        />

        <Select
          id="position"
          label="Position (optional)"
          placeholder="Select position"
          options={positions}
          {...register("position")}
        />

        {teams && teams.length > 0 && (
          <Select
            id="teamId"
            label="Team (optional)"
            placeholder="Select team"
            options={teams.map((t) => ({
              value: String(t.id),
              label: t.name + (t.ageGroup ? ` (${t.ageGroup})` : ""),
            }))}
            {...register("teamId")}
          />
        )}

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full"
          size="lg"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Player"
          )}
        </Button>
      </form>
    </div>
  );
}
