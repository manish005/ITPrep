"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AdminProvider, useAdmin } from "../../../AdminContext";
import AdminLayout from "../../../AdminLayout";

const EMOJI_OPTIONS = ["📁", "📂", "🗂️", "📋", "📝", "🔗", "📌", "🏠", "👤", "🔑", "📈", "🎯", "💡", "🔔", "💬", "📧", "🛠️", "🔍", "📊", "🅰️", "🔄", "📘", "📦", "🧪", "⚡", "🌐", "💻", "🎨", "🔧", "📱"];

function CategoryForm() {
  const router = useRouter();
  const params = useParams();
  const catId = params.id as string;
  const { categories, updateCategory } = useAdmin();
  const [form, setForm] = useState({ name: "", slug: "", description: "", icon: "📁", parentId: "" });
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const parentOptions = categories.filter((c) => !c.parentId && c.id !== catId).sort((a, b) => a.order - b.order);

  useEffect(() => {
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      setForm({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || "",
        icon: cat.icon || "📁",
        parentId: cat.parentId || "",
      });
    } else if (categories.length > 0) {
      setNotFound(true);
    }
  }, [catId, categories]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setTimeout(() => {
      updateCategory(catId, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        icon: form.icon,
        parentId: form.parentId || undefined,
      });
      router.push("/admin/categories");
    }, 300);
  };

  if (notFound) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <p style={{ color: "#64748b", fontSize: 16 }}>Category not found</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push("/admin/categories")}
          style={{ marginTop: 16, padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          Back to Categories
        </motion.button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: 24 }}>
          <motion.button
            onClick={() => router.back()}
            whileHover={{ x: -4 }}
            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6, padding: 0 }}
          >
            ← Back
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}
        >
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, background: "#f1f5f9", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              {form.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: 0 }}>Edit Category</h2>
              <p style={{ fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>Update category details</p>
            </div>
          </div>

          <div style={{ padding: 28 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Parent Category (optional)</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                style={{
                  width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 10,
                  fontSize: 14, outline: "none", background: "white", cursor: "pointer",
                  transition: "border-color 0.2s", color: form.parentId ? "#0f172a" : "#94a3b8",
                }}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              >
                <option value="">None (Top-level category)</option>
                {parentOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Category Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })}
                placeholder="e.g., Angular, TypeScript, RxJS"
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Slug</label>
              <div style={{ display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0 14px" }}>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>/</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="category-slug"
                  style={{ flex: 1, padding: "12px 8px", border: "none", background: "transparent", fontSize: 14, outline: "none" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description of this category"
                rows={3}
                style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Icon</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setForm({ ...form, icon: emoji })}
                    style={{
                      width: 44, height: 44, border: form.icon === emoji ? "2px solid #3b82f6" : "2px solid transparent",
                      background: form.icon === emoji ? "#eff6ff" : "#f8fafc", borderRadius: 10, fontSize: 20,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                style={{ padding: "12px 24px", background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#475569" }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!form.name.trim() || saving}
                style={{
                  padding: "12px 28px", background: form.name.trim() ? "linear-gradient(135deg, #3b82f6, #2563eb)" : "#e2e8f0",
                  border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: form.name.trim() ? "pointer" : "not-allowed",
                  color: form.name.trim() ? "white" : "#94a3b8", transition: "all 0.2s",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function EditCategoryPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <CategoryForm />
      </AdminLayout>
    </AdminProvider>
  );
}
