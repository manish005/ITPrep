"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";

export default function QuestionManager() {
  const router = useRouter();
  const { questions, categories, deleteQuestion, duplicateQuestion, updateQuestion } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mounted, setMounted] = useState(false);
  
  // Drag and drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  
  // Editable order number state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = questions.filter((q) => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "all" && q.categoryId !== filterCat) return false;
    if (filterStatus !== "all" && q.status !== filterStatus) return false;
    return true;
  });

  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name || "Unknown";

  const handleDuplicate = (id: string) => {
    const newId = duplicateQuestion(id);
    if (newId) router.push(`/admin/questions/${newId}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this question?")) deleteQuestion(id);
  };

  const handleToggleStatus = (id: string, current: string) => {
    updateQuestion(id, { status: current === "published" ? "draft" : "published" });
  };

  // Order number editing
  const handleOrderClick = (id: string, currentOrder: number) => {
    setEditingId(id);
    setEditValue(String(currentOrder));
    setTimeout(() => inputRef.current?.select(), 10);
  };

  const handleOrderSave = (id: string) => {
    const newOrder = parseInt(editValue, 10);
    if (isNaN(newOrder) || newOrder < 1) {
      setEditingId(null);
      return;
    }

    // Get all questions sorted by current order
    const sorted = [...questions].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    // Find the question being edited
    const editingIndex = sorted.findIndex((q) => q.id === id);
    if (editingIndex === -1) {
      setEditingId(null);
      return;
    }

    // Remove the question from its current position
    const [movedQuestion] = sorted.splice(editingIndex, 1);
    
    // Insert at the new position (clamped to valid range)
    const insertIndex = Math.min(newOrder - 1, sorted.length);
    sorted.splice(insertIndex, 0, movedQuestion);
    
    // Update all affected questions with new order numbers
    sorted.forEach((q, i) => {
      if (q.order !== i + 1) {
        updateQuestion(q.id, { order: i + 1 });
      }
    });

    setEditingId(null);
  };

  const handleOrderKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleOrderSave(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    
    requestAnimationFrame(() => {
      const el = document.getElementById(`row-${id}`);
      if (el) el.classList.add("dragging");
    });
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    const el = document.getElementById(`row-${id}`);
    if (el) el.classList.remove("dragging");
    
    setDraggedId(null);
    setDragOverId(null);
    setIsDragging(false);
  };

  const handleDragEnter = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    dragCounter.current++;
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    const sourceId = draggedId;
    if (!sourceId || sourceId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      setIsDragging(false);
      return;
    }

    const sourceIndex = questions.findIndex((q) => q.id === sourceId);
    const targetIndex = questions.findIndex((q) => q.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const reordered = [...questions];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    reordered.forEach((q, i) => {
      if (q.order !== i + 1) {
        updateQuestion(q.id, { order: i + 1 });
      }
    });

    setDraggedId(null);
    setDragOverId(null);
    setIsDragging(false);
  };

  if (!mounted) {
    return (
      <div className="questions">
        <div className="page-header">
          <p className="description">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="questions">
      <div className="page-header">
        <p className="description">Manage all questions. Drag to reorder or click # to set sequence.</p>
        <Link href="/admin/questions/new" className="btn-primary">+ Add Question</Link>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="search" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>☰</th>
              <th style={{ width: 60 }}>#</th>
              <th>Question</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr
                key={q.id}
                id={`row-${q.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, q.id)}
                onDragEnd={(e) => handleDragEnd(e, q.id)}
                onDragEnter={(e) => handleDragEnter(e, q.id)}
                onDragLeave={(e) => handleDragLeave(e, q.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, q.id)}
                className={`
                  ${draggedId === q.id ? "dragging" : ""}
                  ${dragOverId === q.id && draggedId !== q.id ? "drag-over" : ""}
                `}
              >
                <td className="drag-handle">
                  <span className="drag-icon">☰</span>
                </td>
                <td className="order-cell">
                  {editingId === q.id ? (
                    <input
                      ref={inputRef}
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleOrderSave(q.id)}
                      onKeyDown={(e) => handleOrderKeyDown(e, q.id)}
                      className="order-input"
                      min="1"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="order-num"
                      onClick={() => handleOrderClick(q.id, q.order || 0)}
                      title="Click to change order"
                    >
                      {q.order}
                    </span>
                  )}
                </td>
                <td>
                  <div className="q-title">{q.title}</div>
                  <div className="q-tags">
                    {q.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                </td>
                <td><span className="badge cat">{getCatName(q.categoryId)}</span></td>
                <td><span className={`badge diff ${q.difficulty}`}>{q.difficulty}</span></td>
                <td><span className={`badge status ${q.status}`}>{q.status}</span></td>
                <td className="date">{q.updatedAt}</td>
                <td>
                  <div className="row-actions">
                    <Link href={`/admin/questions/${q.id}/edit`} className="action edit">Edit</Link>
                    <Link href={`/admin/questions/${q.id}/preview`} className="action preview">Preview</Link>
                    <button className="action dup" onClick={() => handleDuplicate(q.id)}>Duplicate</button>
                    <button className="action toggle" onClick={() => handleToggleStatus(q.id, q.status)}>
                      {q.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button className="action del" onClick={() => handleDelete(q.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="empty">No questions found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .questions { max-width: 1200px; }
        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
        }
        .description { color: #64748b; font-size: 14px; margin: 0; }
        .btn-primary {
          padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none;
          border: none; border-radius: 8px; font-size: 14px; font-weight: 500;
          display: inline-block; cursor: pointer;
        }
        .btn-primary:hover { background: #2563eb; }
        .filters { display: flex; gap: 10px; margin-bottom: 16px; }
        .search {
          flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 13px;
        }
        .filters select {
          padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px;
          font-size: 13px; background: white; min-width: 140px;
        }
        .table-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;
        }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th {
          background: #f8fafc; padding: 10px 14px; text-align: left; font-size: 11px;
          font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }
        .data-table td {
          padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        
        /* Drag handle */
        .drag-handle {
          cursor: grab;
          color: #94a3b8;
          user-select: none;
          transition: all 0.2s ease;
        }
        .drag-handle:hover {
          color: #3b82f6;
          transform: scale(1.1);
        }
        .drag-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 16px;
          line-height: 1;
        }
        
        /* Row states */
        .data-table tbody tr {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .data-table tbody tr:hover {
          background: #f8fafc;
        }
        .data-table tbody tr.dragging {
          opacity: 0.4;
          background: #eff6ff;
          transform: scale(0.98);
          cursor: grabbing;
        }
        .data-table tbody tr.dragging .drag-handle {
          color: #3b82f6;
          cursor: grabbing;
        }
        .data-table tbody tr.drag-over {
          border-top: 3px solid #3b82f6;
          background: #eff6ff;
        }
        .data-table tbody tr.drag-over td {
          padding-top: 15px;
        }
        
        /* Order number cell */
        .order-cell {
          text-align: center;
          cursor: pointer;
        }
        .order-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          font-weight: 600;
          color: #475569;
          font-size: 13px;
          border-radius: 6px;
          background: #f1f5f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .order-num:hover {
          background: #e2e8f0;
          color: #3b82f6;
          transform: scale(1.1);
        }
        .order-input {
          width: 50px;
          padding: 6px 8px;
          text-align: center;
          font-weight: 600;
          font-size: 13px;
          border: 2px solid #3b82f6;
          border-radius: 6px;
          outline: none;
          background: white;
        }
        .order-input:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        .q-title { color: #0f172a; font-weight: 500; margin-bottom: 4px; }
        .q-tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .tag {
          background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 10px;
        }
        .badge {
          padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
        }
        .badge.cat { background: #e0e7ff; color: #3730a3; }
        .badge.diff { text-transform: capitalize; }
        .badge.diff.easy { background: #dcfce7; color: #166534; }
        .badge.diff.medium { background: #fef3c7; color: #92400e; }
        .badge.diff.hard { background: #fee2e2; color: #991b1b; }
        .badge.status { text-transform: capitalize; }
        .badge.status.published { background: #dcfce7; color: #166534; }
        .badge.status.draft { background: #fef3c7; color: #92400e; }
        .date { color: #64748b; white-space: nowrap; }
        .row-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .action {
          color: #3b82f6; background: none; border: none; font-size: 12px; font-weight: 500;
          cursor: pointer; text-decoration: none; padding: 0;
        }
        .action:hover { text-decoration: underline; }
        .action.del { color: #ef4444; }
        .action.toggle { color: #8b5cf6; }
        .action.dup { color: #06b6d4; }
        .action.preview { color: #22c55e; }
        .empty { text-align: center; color: #94a3b8; padding: 40px !important; }
      `}</style>
    </div>
  );
}
