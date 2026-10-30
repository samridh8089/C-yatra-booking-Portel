"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { Portal } from "@/types";
import { PortalLogo } from "@/components/PortalLogo";

interface PortalCardProps {
  portal: Portal;
}

export function PortalCard({ portal }: PortalCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Open in new tab securely
    window.open(portal.website_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.open(portal.website_url, "_blank", "noopener,noreferrer");
        }
      }}
      className="group relative flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-200 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0 pr-3">
        {/* Portal Logo */}
        <PortalLogo
          name={portal.name}
          logoUrl={portal.logo_url}
          websiteUrl={portal.website_url}
          size="md"
        />

        {/* Portal Details */}
        <div className="min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight group-hover:text-cyatra-red transition-colors">
            {portal.name}
          </h4>
          {portal.description && (
            <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
              {portal.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="shrink-0">
        <a
          href={portal.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-cyatra-red hover:bg-cyatra-redHover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-95"
        >
          {/* Mobile button label */}
          <span className="sm:hidden">Open</span>
          {/* Desktop button label */}
          <span className="hidden sm:inline">Open Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
