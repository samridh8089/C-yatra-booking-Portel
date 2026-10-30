"use client";

import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CyatraLogo } from "@/components/CyatraLogo";
import { UserProfile } from "@/types";

interface OwnerHeaderProps {
  user?: UserProfile | null;
}

export function OwnerHeader({ user }: OwnerHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue redirect
    }
    router.push("/login");
    router.refresh();
  };

  const displayName = user?.full_name || user?.email?.split("@")[0] || "Samridh Tomar";

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: C-Yatra original brand logo */}
        <div className="flex items-center">
          <Link href="/dashboard" className="transition-opacity hover:opacity-90">
            <CyatraLogo className="h-10 sm:h-12 w-auto" width={170} height={85} priority />
          </Link>
        </div>

        {/* Right: Profile & Logout Control */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-full sm:rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all select-none"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <span className="hidden sm:inline-block text-sm font-semibold text-slate-800">
              {displayName}
            </span>
            <ChevronDown className={`hidden sm:inline-block w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || "owner@c-yatra.com"}</p>
                {user?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-slate-100 text-slate-700">
                    Role: {user.role}
                  </span>
                )}
              </div>

              {/* Admin Portal link if authorized */}
              {user?.role === "admin" && (
                <div className="px-1 py-1 border-b border-slate-100">
                  <Link
                    href="/admin/portals"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                  >
                    <Shield className="w-4 h-4 text-cyatra-red" />
                    Admin Management
                  </Link>
                </div>
              )}

              <div className="px-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
