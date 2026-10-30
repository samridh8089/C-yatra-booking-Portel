"use client";

import React, { useState } from "react";
import Image from "next/image";

interface PortalLogoProps {
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PortalLogo({
  name,
  logoUrl,
  websiteUrl,
  size = "md",
  className = "",
}: PortalLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Extract domain for favicon fallback
  let domain = "";
  if (websiteUrl) {
    try {
      domain = new URL(websiteUrl).hostname.replace(/^www\./, "");
    } catch {
      domain = "";
    }
  }

  // Determine size classes
  const sizeClasses = {
    sm: "w-9 h-9 min-w-[36px]",
    md: "w-12 h-12 min-w-[48px]",
    lg: "w-14 h-14 min-w-[56px]",
  }[size];

  // Derive initials
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  // Deterministic background hue for initials badge
  const colors = [
    "bg-red-50 text-red-600 border-red-200",
    "bg-blue-50 text-blue-600 border-blue-200",
    "bg-emerald-50 text-emerald-600 border-emerald-200",
    "bg-purple-50 text-purple-600 border-purple-200",
    "bg-amber-50 text-amber-700 border-amber-200",
    "bg-indigo-50 text-indigo-600 border-indigo-200",
    "bg-teal-50 text-teal-700 border-teal-200",
  ];
  const charCodeSum = name.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const colorClass = colors[charCodeSum % colors.length];

  // Resolve best candidate logo URL
  const candidateUrl =
    !imageError && logoUrl && logoUrl.trim() !== ""
      ? logoUrl
      : domain && !imageError
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      : null;

  return (
    <div
      className={`relative rounded-xl border border-slate-100 bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-sm shrink-0 ${sizeClasses} ${className}`}
    >
      {candidateUrl && !imageError ? (
        <Image
          src={candidateUrl}
          alt={name}
          width={48}
          height={48}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <div
          className={`w-full h-full rounded-lg flex items-center justify-center font-bold text-xs tracking-wider border ${colorClass}`}
        >
          {initials || "CY"}
        </div>
      )}
    </div>
  );
}
