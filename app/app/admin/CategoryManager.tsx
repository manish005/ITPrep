"use client";

import { useState } from "react";
import { useAdmin } from "./AdminContext";
import { Category } from "./types";

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "📁" });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", icon: "📁" });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", icon: cat.icon || "📁" });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateCategory(editing.id, form);
    } else {
      addCategory({ ...form, status: "active" });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category?")) deleteCategory(id);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const ids = categories.map((c) => c.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    reorderCategories(ids);
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const ids = categories.map((c) => c.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    reorderCategories(ids);
  };

  return (
    <div className="categories">
      <div className="page-header">
        <div>
          <p className="description">Manage your question categories</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      <div className="category-list">
        {categories.sort((a, b) => a.order - b.order).map((cat, index) => (
          <div key={cat.id} className="category-card">
            <div className="drag-handle">☰</div>
            <div className="cat-icon">{cat.icon}</div>
            <div className="cat-info">
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
              <span className="slug">/{cat.slug}</span>
            </div>
            <div className="cat-actions">
              <button onClick={() => moveUp(index)} disabled={index === 0}>↑</button>
              <button onClick={() => moveDown(index)} disabled={index === categories.length - 1}>↓</button>
              <button onClick={() => openEdit(cat)}>✏️</button>
              <button className="delete" onClick={() => handleDelete(cat.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Category" : "Add Category"}</h2>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Category name" />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="category-slug" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" />
            </div>
            <div className="form-group">
              <label>Icon</label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="📁" />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave}>{editing ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .categories { max-width: 800px; }
        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .description { color: #64748b; font-size: 14px; margin: 0; }
        .btn-primary {
          padding: 10px 20px; background: #3b82f6; color: white;
          border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
          cursor: pointer;
        }
        .btn-primary:hover { background: #2563eb; }
        .category-list { display: flex; flex-direction: column; gap: 10px; }
        .category-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 16px; display: flex; align-items: center; gap: 14px;
          transition: all 0.2s;
        }
        .category-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .drag-handle { cursor: grab; color: #94a3b8; font-size: 16px; }
        .cat-icon {
          width: 44px; height: 44px; background: #f1f5f9; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .cat-info { flex: 1; }
        .cat-info h3 { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 2px 0; }
        .cat-info p { font-size: 12px; color: #64748b; margin: 0 0 4px 0; }
        .slug { font-size: 11px; color: #94a3b8; font-family: monospace; }
        .cat-actions { display: flex; gap: 4px; }
        .cat-actions button {
          width: 32px; height: 32px; border: none; background: #f1f5f9;
          border-radius: 6px; cursor: pointer; font-size: 14px;
        }
        .cat-actions button:hover:not(:disabled) { background: #e2e8f0; }
        .cat-actions button:disabled { opacity: 0.3; cursor: not-allowed; }
        .cat-actions button.delete:hover { background: #fee2e2; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .modal {
          background: white; border-radius: 16px; padding: 24px;
          width: 100%; max-width: 440px;
        }
        .modal h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 20px 0; }
        .form-group { margin-bottom: 14px; }
        .form-group label { display: block; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 6px; }
        .form-group input, .form-group textarea {
          width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 14px; box-sizing: border-box;
        }
        .form-group textarea { min-height: 70px; resize: vertical; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #3b82f6; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-secondary {
          padding: 10px 20px; background: #f1f5f9; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 14px; cursor: pointer; color: #475569;
        }
      `}</style>
    </div>
  );
}
