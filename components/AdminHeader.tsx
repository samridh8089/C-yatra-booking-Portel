"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Layers, Globe, LogOut, ExternalLink, Shield } from "lucide-react";
import { CyatraLogo } from "@/components/CyatraLogo";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continue
    }
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Layers,
      active: pathname.startsWith("/admin/categories"),
    },
    {
      name: "Manage Portals",
      href: "/admin/portals",
      icon: Globe,
      active: pathname.startsWith("/admin/portals"),
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Admin Badge */}
        <div className="flex items-center gap-3">
          <Link href="/admin/portals" className="flex items-center gap-2">
            <CyatraLogo className="h-9 sm:h-10 w-auto" width={150} height={75} priority />
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-cyatra-red" />
            Admin Interface
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  item.active
                    ? "bg-cyatra-red text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: View Owner Dashboard & Logout */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            title="View Owner Dashboard"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <span>View Owner Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out of admin"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
