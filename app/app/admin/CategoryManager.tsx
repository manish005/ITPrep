"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "./AdminContext";
import { Category } from "./types";

interface TreeNode extends Category {
  children: TreeNode[];
}

function buildTree(categories: Category[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order);
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

export default function CategoryManager() {
  const router = useRouter();
  const { categories, deleteCategory, moveCategory, reorderCategories } = useAdmin();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<"before" | "inside" | "after">("before");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(categories.map((c) => c.id)));

  const tree = buildTree(categories);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (id === dragId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;

    if (y < h * 0.25) {
      setDragPosition("before");
    } else if (y > h * 0.75) {
      setDragPosition("after");
    } else {
      setDragPosition("inside");
    }

    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    const targetCat = categories.find((c) => c.id === targetId);
    const dragCat = categories.find((c) => c.id === dragId);
    if (!targetCat || !dragCat) return;

    if (dragPosition === "inside") {
      moveCategory(dragId, targetId);
    } else {
      moveCategory(dragId, targetCat.parentId);

      const siblings = categories
        .filter((c) => c.parentId === targetCat.parentId && c.id !== dragId)
        .sort((a, b) => a.order - b.order);

      const targetIdx = siblings.findIndex((c) => c.id === targetId);
      const insertIdx = dragPosition === "before" ? targetIdx : targetIdx + 1;

      siblings.splice(insertIdx, 0, { ...dragCat, parentId: targetCat.parentId });

      const ids = siblings.map((c) => c.id);

      const nonSiblingIds = categories
        .filter((c) => c.parentId !== targetCat.parentId || c.id === dragId)
        .filter((c) => !ids.includes(c.id))
        .sort((a, b) => a.order - b.order)
        .map((c) => c.id);

      reorderCategories([...nonSiblingIds, ...ids]);
    }

    setDragId(null);
    setDragOverId(null);
    setDragPosition("before");
  };

  const handleDragEnd = () => {
    setDragId(null);
    setDragOverId(null);
    setDragPosition("before");
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      deleteCategory(id);
      setDeletingId(null);
    }, 300);
  };

  const getDragHighlight = (id: string) => {
    if (dragId === id || dragOverId !== id) return {};
    if (dragPosition === "before") return { borderTop: "3px solid #3b82f6" };
    if (dragPosition === "after") return { borderBottom: "3px solid #3b82f6" };
    return { background: "rgba(59, 130, 246, 0.1)", borderRadius: 12 };
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const childCount = categories.filter((c) => c.parentId === node.id).length;

    return (
      <div key={node.id}>
        <motion.div
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: deletingId === node.id ? 0.4 : 1,
            x: 0,
            scale: deletingId === node.id ? 0.98 : 1,
          }}
          exit={{ opacity: 0, x: -100, height: 0 }}
          transition={{ duration: 0.2 }}
          draggable
          onDragStart={(e) => handleDragStart(e as any, node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDrop={(e) => handleDrop(e, node.id)}
          onDragEnd={handleDragEnd}
          style={{
            background: dragId === node.id ? "#f0f9ff" : "white",
            borderRadius: 14,
            border: `1px solid ${dragOverId === node.id ? "#3b82f6" : "#e2e8f0"}`,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginLeft: depth * 32,
            marginBottom: 8,
            cursor: "grab",
            transition: "border-color 0.15s, background 0.15s",
            ...getDragHighlight(node.id),
          }}
          whileHover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)", borderColor: "#cbd5e1" }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, padding: 4, color: "#94a3b8", width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.2s",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              ▶
            </button>
          ) : (
            <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#d1d5db" }} />
            </div>
          )}

          <div
            style={{
              width: 44, height: 44, background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
              borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}
          >
            {node.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", margin: 0 }}>
                {node.name}
              </h3>
              <span style={{
                padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: node.status === "active" ? "#dcfce7" : "#fef3c7",
                color: node.status === "active" ? "#166534" : "#92400e",
              }}>
                {node.status}
              </span>
              {childCount > 0 && (
                <span style={{ fontSize: 11, color: "#94a3b8" }}>
                  {childCount} sub
                </span>
              )}
            </div>
            {node.description && (
              <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {node.description}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); router.push(`/admin/categories/${node.id}/edit`); }}
              style={{
                padding: "6px 10px", background: "#f1f5f9", border: "1px solid #e2e8f0",
                borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#475569",
              }}
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
              style={{
                padding: "6px 10px", background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#dc2626",
              }}
            >
              Del
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden" }}
            >
              {node.children.map((child) => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}
      >
        <div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Drag categories to reorder or nest them. Drop "inside" a category to make it a child.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/admin/categories/new")}
          style={{
            padding: "12px 24px", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
          }}
        >
          <span style={{ fontSize: 18 }}>+</span> Add Category
        </motion.button>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <AnimatePresence>
          {tree.map((node) => renderNode(node, 0))}
        </AnimatePresence>

        {categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: "center", padding: "60px 20px", background: "white",
              borderRadius: 16, border: "2px dashed #e2e8f0",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", margin: "0 0 8px" }}>No categories yet</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Create your first category to organize questions</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/admin/categories/new")}
              style={{
                padding: "12px 28px", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Create Category
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
