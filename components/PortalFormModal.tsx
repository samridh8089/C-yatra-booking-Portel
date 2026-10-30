"use client";

import React, { useState, useEffect } from "react";
import { X, Check, ExternalLink } from "lucide-react";
import { Portal, Category } from "@/types";
import { PortalLogo } from "@/components/PortalLogo";
import { safeUrlSchema } from "@/lib/validations";

interface PortalFormModalProps {
  isOpen: boolean;
  portal?: Portal | null;
  categories: Category[];
  initialCategoryId?: string;
  onClose: () => void;
  onSave: (data: Partial<Portal>) => Promise<void>;
}

export function PortalFormModal({
  isOpen,
  portal,
  categories,
  initialCategoryId,
  onClose,
  onSave,
}: PortalFormModalProps) {
  const isEditing = Boolean(portal);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (portal) {
      setName(portal.name);
      setCategoryId(portal.category_id);
      setWebsiteUrl(portal.website_url);
      setLogoUrl(portal.logo_url || "");
      setDescription(portal.description || "");
      setInternalNotes(portal.internal_notes || "");
      setSortOrder(portal.sort_order);
      setIsActive(portal.is_active);
    } else {
      setName("");
      setCategoryId(initialCategoryId || categories[0]?.id || "");
      setWebsiteUrl("");
      setLogoUrl("");
      setDescription("");
      setInternalNotes("");
      setSortOrder(1);
      setIsActive(true);
    }
    setError(null);
  }, [portal, isOpen, initialCategoryId, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Portal name must be at least 2 characters");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    // Validate URL safety
    const urlValidation = safeUrlSchema.safeParse(websiteUrl.trim());
    if (!urlValidation.success) {
      setError("Please enter a valid HTTP or HTTPS URL (e.g. https://www.example.com)");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        name: name.trim(),
        category_id: categoryId,
        website_url: websiteUrl.trim(),
        logo_url: logoUrl.trim() || null,
        description: description.trim() || null,
        internal_notes: internalNotes.trim() || null,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save portal");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-slate-900">
          {isEditing ? "Edit Booking Portal" : "Add Booking Portal"}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Portals appear as clickable cards under their assigned category.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portal Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MakeMyTrip, Cleartrip"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {!c.is_active ? "(Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Website URL (Exact B2B / Booking link) *
            </label>
            <div className="relative flex items-center">
              <input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com/login"
                className="w-full px-3.5 py-2.5 pr-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
              />
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 text-slate-400 hover:text-slate-700"
                  title="Test link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Logo Image URL (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png or leave blank for auto favicon"
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
              />
              {/* Live Preview */}
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Preview:</span>
                <PortalLogo
                  name={name || "Preview"}
                  logoUrl={logoUrl}
                  websiteUrl={websiteUrl}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Domestic & International Flights"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Notes (Private, Admin Only)
              </label>
              <input
                type="text"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="e.g. Requires corporate login token"
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

          {/* Active Status */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-800">Active Portal</p>
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
              <span>{isEditing ? "Save Portal" : "Add Portal"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
