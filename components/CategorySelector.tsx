"use client";

import React from "react";
import { Category } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) {
  return (
    <div className="w-full">
      {/* Desktop Horizontal Row / Scrollable Row */}
      <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => {
          const isSelected = category.id === selectedCategoryId;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center min-w-[90px] lg:min-w-[100px] h-20 px-3 py-2.5 rounded-2xl border transition-all duration-150 select-none ${
                isSelected
                  ? "bg-cyatra-red border-cyatra-red text-white shadow-md shadow-red-500/20 scale-[1.02]"
                  : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50/60 shadow-sm"
              }`}
            >
              <div className="mb-1.5 flex items-center justify-center">
                <CategoryIcon
                  name={category.icon}
                  className={`w-6 h-6 ${isSelected ? "text-white" : "text-slate-800"}`}
                />
              </div>
              <span
                className={`text-xs font-semibold tracking-tight text-center truncate max-w-full ${
                  isSelected ? "text-white" : "text-slate-700"
                }`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Grid (4 columns layout as shown in the mobile reference) */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:hidden">
        {categories.map((category) => {
          const isSelected = category.id === selectedCategoryId;
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center h-[76px] p-2 rounded-2xl border transition-all duration-150 active:scale-95 select-none ${
                isSelected
                  ? "bg-cyatra-red border-cyatra-red text-white shadow-md shadow-red-500/20"
                  : "bg-white border-slate-200/80 text-slate-700 shadow-sm"
              }`}
            >
              <div className="mb-1 flex items-center justify-center">
                <CategoryIcon
                  name={category.icon}
                  className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-800"}`}
                />
              </div>
              <span
                className={`text-[11px] font-semibold tracking-tight text-center leading-tight line-clamp-1 ${
                  isSelected ? "text-white" : "text-slate-700"
                }`}
              >
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
