"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Category } from "@/types";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CategoryFormModal } from "@/components/CategoryFormModal";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Save (Create or Update)
  const handleSave = async (data: Partial<Category>) => {
    if (editingCategory) {
      // Update
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update category");
      }
      const updated = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
    } else {
      // Create
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create category");
      }
      const created = await res.json();
      setCategories((prev) => [...prev, created]);
    }
  };

  // Toggle active status
  const handleToggleActive = async (category: Category) => {
    const updatedStatus = !category.is_active;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? { ...c, is_active: updatedStatus } : c))
    );

    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch {
      // Revert on failure
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, is_active: !updatedStatus } : c))
      );
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");

      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
    } catch (err: any) {
      alert(err.message || "Could not delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Travel Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage navigation categories and their display order.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyatra-red hover:bg-cyatra-redHover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Category</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4 text-center">Portals</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Category Name & Icon */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 shrink-0">
                        <CategoryIcon name={cat.icon} className="w-5 h-5 text-cyatra-red" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{cat.name}</p>
                        <p className="text-xs text-slate-400 font-mono">icon: {cat.icon}</p>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                    {cat.slug}
                  </td>

                  {/* Order */}
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                    {cat.sort_order}
                  </td>

                  {/* Portals Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                      {cat.portal_count ?? 0}
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cat)}
                      title={cat.is_active ? "Deactivate category" : "Activate category"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                        cat.is_active
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {cat.is_active ? (
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
                          setEditingCategory(cat);
                          setModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingCategory(cat);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={modalOpen}
        category={editingCategory}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        title={`Delete "${deletingCategory?.name}" Category?`}
        message="Are you sure you want to delete this category? This action cannot be undone."
        warningNote={
          deletingCategory && (deletingCategory.portal_count || 0) > 0
            ? `Warning: This category currently has ${deletingCategory.portal_count} portal(s). Deleting it will also remove all assigned portals.`
            : undefined
        }
        confirmLabel="Yes, Delete Category"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingCategory(null);
        }}
      />
    </div>
  );
}
