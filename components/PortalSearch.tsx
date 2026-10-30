"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface PortalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PortalSearch({
  value,
  onChange,
  placeholder = "Search portal...",
  className = "",
}: PortalSearchProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          type="button"
          aria-label="Clear search"
          className="absolute right-3 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
