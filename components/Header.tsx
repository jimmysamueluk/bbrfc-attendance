"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ClipboardList, BarChart3, Home, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/authStore";

interface HeaderProps {
  onLogout: () => void;
}

const baseNavItems = [
  { href: "/protected/dashboard", label: "Sessions", icon: Home },
  { href: "/protected/players", label: "Players", icon: Users },
  { href: "/protected/stats", label: "Stats", icon: BarChart3 },
];

export function Header({ onLogout }: HeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const navItems = user?.role === "admin"
    ? [...baseNavItems, { href: "/protected/admin", label: "Admin", icon: Settings }]
    : baseNavItems;

  return (
    <header className="bg-burgundy text-white sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/protected/dashboard" className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          <span className="font-bold text-lg">BBRFC Attendance</span>
        </Link>
        <button
          onClick={onLogout}
          className="p-2 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      <nav className="max-w-lg mx-auto px-4 pb-2 flex gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
