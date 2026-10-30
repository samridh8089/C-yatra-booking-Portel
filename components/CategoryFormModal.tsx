"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Category } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";

interface CategoryFormModalProps {
  isOpen: boolean;
  category?: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
}

const AVAILABLE_ICONS = [
  "Plane",
  "Users",
  "BedDouble",
  "Hotel",
  "Car",
  "Home",
  "Building2",
  "Store",
  "Bus",
  "Train",
  "Globe",
  "ShieldCheck",
  "Compass",
  "Luggage",
  "Palmtree",
  "MapPin",
];

export function CategoryFormModal({
  isOpen,
  category,
  onClose,
  onSave,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("Plane");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setIcon(category.icon);
      setSortOrder(category.sort_order);
      setIsActive(category.is_active);
    } else {
      setName("");
      setSlug("");
      setIcon("Plane");
      setSortOrder(1);
      setIsActive(true);
    }
    setError(null);
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Category name must be at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        icon,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900">
          {isEditing ? "Edit Travel Category" : "Add New Travel Category"}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Categories define the top horizontal navigation on the owner dashboard.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Flight, Hotel, Cruise"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. flight"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min="0"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Icon
            </label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-36 overflow-y-auto">
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    title={iconName}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-cyatra-red border-cyatra-red text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <CategoryIcon name={iconName} className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Active Category</p>
              <p className="text-[11px] text-slate-500">
                Visible to the owner on the main dashboard
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isActive ? "bg-cyatra-red justify-end" : "bg-slate-300 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cyatra-red hover:bg-cyatra-redHover text-sm font-semibold text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{isEditing ? "Save Changes" : "Create Category"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
