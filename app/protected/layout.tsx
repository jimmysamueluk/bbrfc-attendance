"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { Header } from "@/components/Header";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, clearAuth, hydrate } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !user) {
      router.push("/auth/login");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (hydrated && user && user.role !== "coach" && user.role !== "admin") {
      clearAuth();
      router.push("/auth/login");
    }
  }, [hydrated, user, clearAuth, router]);

  const handleLogout = () => {
    clearAuth();
    router.push("/auth/login");
  };

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={handleLogout} />
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <NotificationPrompt />
        {children}
      </main>
    </div>
  );
}
