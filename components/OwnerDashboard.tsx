"use client";

import React, { useState, useMemo } from "react";
import { Category, Portal, UserProfile } from "@/types";
import { OwnerHeader } from "@/components/OwnerHeader";
import { HeroBanner } from "@/components/HeroBanner";
import { CategorySelector } from "@/components/CategorySelector";
import { PortalCard } from "@/components/PortalCard";
import { PortalSearch } from "@/components/PortalSearch";
import { CategoryIcon } from "@/components/CategoryIcon";
import { FolderOpen, SearchX } from "lucide-react";

interface OwnerDashboardProps {
  categories: Category[];
  portals: Portal[];
  user?: UserProfile | null;
}

export function OwnerDashboard({ categories, portals, user }: OwnerDashboardProps) {
  // Default to first category (e.g. Flight)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  // Filter portals by category and search query
  const filteredPortals = useMemo(() => {
    return portals.filter((p) => {
      // Must match active category
      if (p.category_id !== selectedCategoryId) return false;

      // Must match search query if provided
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchesUrl = p.website_url.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesUrl;
      }

      return true;
    });
  }, [portals, selectedCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Top Header */}
      <OwnerHeader user={user} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Scenic Udaipur Hero Banner */}
        <HeroBanner />

        {/* Dynamic Category Selector (Horizontal row on desktop, grid on mobile) */}
        {categories.length > 0 && (
          <section aria-label="Travel Categories">
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                setSearchQuery(""); // Reset search on category change
              }}
            />
          </section>
        )}

        {/* Portal Listing Section */}
        {selectedCategory && (
          <section className="space-y-4">
            {/* Section Header & Search Field */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-cyatra-red">
                    <CategoryIcon name={selectedCategory.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-cyatra-red" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {selectedCategory.name} Booking Portals
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Open multiple {selectedCategory.name.toLowerCase()} booking portals and find the best rates for your clients.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-72 shrink-0">
                <PortalSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search portal..."
                />
              </div>
            </div>

            {/* Portal Cards Grid (2-column on desktop, 1-column on mobile) */}
            {filteredPortals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                {filteredPortals.map((portal) => (
                  <PortalCard key={portal.id} portal={portal} />
                ))}
              </div>
            ) : searchQuery ? (
              // Search empty state
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No matching portals found</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any portal matching &quot;{searchQuery}&quot; in {selectedCategory.name}.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              // Category empty state
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No portals added to this category yet.</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Portals added by the administrator will automatically appear here.
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200/60 bg-white/50 text-center">
        <p className="text-xs text-slate-400">
          C-Yatra Private Booking Portal System &bull; Authorized Access Only
        </p>
      </footer>
    </div>
  );
}
