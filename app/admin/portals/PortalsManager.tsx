"use client";

import React, { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, ExternalLink, Search } from "lucide-react";
import { Portal, Category } from "@/types";
import { PortalLogo } from "@/components/PortalLogo";
import { PortalFormModal } from "@/components/PortalFormModal";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

interface PortalsManagerProps {
  initialPortals: Portal[];
  categories: Category[];
}

export function PortalsManager({ initialPortals, categories }: PortalsManagerProps) {
  const [portals, setPortals] = useState<Portal[]>(initialPortals);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState<Portal | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPortal, setDeletingPortal] = useState<Portal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter portals
  const filteredPortals = useMemo(() => {
    return portals.filter((p) => {
      if (selectedCategoryFilter !== "all" && p.category_id !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchUrl = p.website_url.toLowerCase().includes(q);
        const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchNotes = p.internal_notes ? p.internal_notes.toLowerCase().includes(q) : false;
        return matchName || matchUrl || matchDesc || matchNotes;
      }
      return true;
    });
  }, [portals, selectedCategoryFilter, searchQuery]);

  // Save (Create or Update)
  const handleSave = async (data: Partial<Portal>) => {
    if (editingPortal) {
      // Update
      const res = await fetch(`/api/portals/${editingPortal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update portal");
      }
      const updated = await res.json();
      setPortals((prev) =>
        prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
      );
    } else {
      // Create
      const res = await fetch("/api/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create portal");
      }
      const created = await res.json();
      setPortals((prev) => [...prev, created]);
    }
  };

  // Toggle active status
  const handleToggleActive = async (portal: Portal) => {
    const updatedStatus = !portal.is_active;
    // Optimistic update
    setPortals((prev) =>
      prev.map((p) => (p.id === portal.id ? { ...p, is_active: updatedStatus } : p))
    );

    try {
      const res = await fetch(`/api/portals/${portal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      // Revert on failure
      setPortals((prev) =>
        prev.map((p) => (p.id === portal.id ? { ...p, is_active: !updatedStatus } : p))
      );
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingPortal) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/portals/${deletingPortal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete portal");

      setPortals((prev) => prev.filter((p) => p.id !== deletingPortal.id));
      setDeleteDialogOpen(false);
      setDeletingPortal(null);
    } catch (err: any) {
      alert(err.message || "Could not delete portal");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Uncategorized";
  };

  const activeCount = portals.filter((p) => p.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manage Portals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {portals.length} total ({activeCount} active)
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure third-party booking websites, URLs, and brand logos.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPortal(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyatra-red hover:bg-cyatra-redHover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Booking Portal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Filter */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
          >
            <option value="all">All Categories ({portals.length})</option>
            {categories.map((c) => {
              const count = portals.filter((p) => p.category_id === c.id).length;
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full flex-1">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by portal name, URL, or notes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyatra-red/20 focus:border-cyatra-red transition-all"
          />
        </div>
      </div>

      {/* Portals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Portal</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">URL</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPortals.map((portal) => (
                <tr key={portal.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Name & Logo */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <PortalLogo
                        name={portal.name}
                        logoUrl={portal.logo_url}
                        websiteUrl={portal.website_url}
                        size="sm"
                      />
                      <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{portal.name}</p>
                        {portal.description && (
                          <p className="text-xs text-slate-400 truncate">{portal.description}</p>
                        )}
                        {portal.internal_notes && (
                          <p className="text-[11px] text-amber-600 italic truncate mt-0.5">
                            Note: {portal.internal_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                      {getCategoryName(portal.category_id)}
                    </span>
                  </td>

                  {/* URL */}
                  <td className="py-3.5 px-4 max-w-[220px]">
                    <a
                      href={portal.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={portal.website_url}
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-full"
                    >
                      <span className="truncate">{portal.website_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    </a>
                  </td>

                  {/* Order */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {portal.sort_order}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(portal)}
                      title={portal.is_active ? "Deactivate portal" : "Activate portal"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        portal.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {portal.is_active ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingPortal(portal);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit portal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingPortal(portal);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete portal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPortals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No portals found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <PortalFormModal
        isOpen={modalOpen}
        portal={editingPortal}
        categories={categories}
        initialCategoryId={selectedCategoryFilter !== "all" ? selectedCategoryFilter : undefined}
        onClose={() => {
          setModalOpen(false);
          setEditingPortal(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        title={`Delete "${deletingPortal?.name}"?`}
        message="Are you sure you want to delete this booking portal entry? This action cannot be undone."
        confirmLabel="Yes, Delete Portal"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingPortal(null);
        }}
      />
    </div>
  );
}
