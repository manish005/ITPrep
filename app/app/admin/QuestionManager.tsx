"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";
import { extractCustomQuestions, saveQuestions } from "../data/storage";
import { markdownToBlocks } from "../data/markdownToBlocks";
import { Question } from "./types";

export default function QuestionManager() {
  const router = useRouter();
  const { questions, categories, deleteQuestion, deleteQuestions, duplicateQuestion, updateQuestion, importQuestions } = useAdmin();
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

  // Server backup / recovery state
  const [syncStatus, setSyncStatus] = useState("");
  const [syncing, setSyncing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qa-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSyncStatus(`Exported ${questions.length} questions. Keep this file safe.`);
  };

  // Import-to-site upload panel state
  const [importOpen, setImportOpen] = useState(false);
  const [importRaw, setImportRaw] = useState("");
  const [importFileName, setImportFileName] = useState("");
  const [importTargetCat, setImportTargetCat] = useState("keep");
  const [importPreview, setImportPreview] = useState<Question[] | null>(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Accepts full backup shape ({id,title,answer.blocks,...}) or simple
  // seed shape ({question, answer: "markdown"}). Throws on bad data.
  const normalizeImported = (raw: any, targetCat: string): Question[] => {
    const list = Array.isArray(raw) ? raw : raw?.questions;
    if (!Array.isArray(list) || list.length === 0)
      throw new Error("JSON must be a non-empty array or { questions: [...] }.");
    if (list.length > 500) throw new Error("Max 500 questions per upload.");
    const now = new Date().toISOString().split("T")[0];
    const fallbackCat = targetCat !== "keep" ? targetCat : categories[0]?.id || "cat-1";
    return list.map((item: any, i: number) => {
      const title = item?.title || item?.question;
      if (!title || typeof title !== "string")
        throw new Error(`Item ${i + 1} has no title/question.`);
      const categoryId = targetCat !== "keep" ? targetCat : item.categoryId || fallbackCat;
      let blocks: any[] = [];
      if (Array.isArray(item?.answer?.blocks)) blocks = item.answer.blocks;
      else if (typeof item?.answer === "string" && item.answer.trim())
        blocks = markdownToBlocks(item.answer);
      const difficulty = ["easy", "medium", "hard"].includes(item?.difficulty)
        ? item.difficulty : "medium";
      const status = ["draft", "published", "archived"].includes(item?.status)
        ? item.status : "published";
      const id = item?.id || `q-${Date.now()}-${i}`;
      return {
        id,
        title: title.trim(),
        slug: item?.slug || slugify(title),
        categoryId,
        tags: Array.isArray(item?.tags) ? item.tags : [],
        difficulty,
        status,
        createdAt: item?.createdAt || now,
        updatedAt: now,
        order: 0,
        answer: {
          id: item?.answer?.id || `a-${Date.now()}-${i}`,
          questionId: id,
          lastModified: now,
          blocks,
        },
      } as Question;
    });
  };

  // Re-parse preview whenever file or target category changes
  useEffect(() => {
    if (!importRaw) return;
    try {
      setImportPreview(normalizeImported(JSON.parse(importRaw), importTargetCat));
      setImportError("");
    } catch (err: any) {
      setImportPreview(null);
      setImportError(err?.message || "Could not read that file.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importRaw, importTargetCat]);

  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportPreview(null);
    setImportError("");
    if (!file) return;
    setImportFileName(file.name);
    try {
      setImportRaw(await file.text());
    } catch {
      setImportError("Could not read that file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleUploadImport = () => {
    if (!importPreview || importPreview.length === 0) return;
    setImporting(true);
    try {
      const n = importQuestions(importPreview);
      setSyncStatus(`Uploaded ${n} questions to site. Auto-saving to server...`);
      setImportOpen(false);
      setImportPreview(null);
      setImportRaw("");
      setImportFileName("");
    } finally {
      setImporting(false);
    }
  };

  const handlePushToServer = async () => {
    try {
      setSyncing(true);
      setSyncStatus("Checking server...");
      const serverRes = await fetch("/api/custom-questions");
      const serverData = await serverRes.json();
      const serverCount = serverData.count ?? 0;
      const custom = extractCustomQuestions(questions);
      if (custom.length === 0) {
        setSyncStatus("No custom questions in this browser to push. Nothing saved.");
        return;
      }
      if (serverCount > custom.length) {
        const ok = confirm(
          `Server has ${serverCount} saved questions but this browser only has ${custom.length} custom ones. Pushing would OVERWRITE the server copy. Continue?`
        );
        if (!ok) {
          setSyncStatus("Push cancelled. Use Pull first if this browser lost data.");
          return;
        }
      } else if (!confirm(`Push ${custom.length} custom questions to server file?`)) {
        setSyncStatus("Push cancelled.");
        return;
      }
      setSyncStatus("Saving to server...");
      const res = await fetch("/api/custom-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: custom }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "save failed");
      setSyncStatus(`Saved ${data.count} questions to server. Commit custom-questions.json to keep them.`);
    } catch (err: any) {
      setSyncStatus(`Push failed: ${err?.message || "unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromServer = async () => {
    try {
      setSyncing(true);
      setSyncStatus("Loading from server...");
      const res = await fetch("/api/custom-questions");
      const data = await res.json();
      const serverQs = Array.isArray(data.questions) ? data.questions : [];
      if (serverQs.length === 0) {
        setSyncStatus("Server file is empty. Nothing to pull.");
        return;
      }
      const localIds = new Set(questions.map((q: any) => q.id));
      const missing = serverQs.filter((q: any) => !localIds.has(q.id));
      if (missing.length === 0) {
        setSyncStatus(`Already up to date (${serverQs.length} on server).`);
        return;
      }
      saveQuestions([...questions, ...missing]);
      setSyncStatus(`Restored ${missing.length} questions from server. Reloading...`);
      setTimeout(() => window.location.reload(), 800);
    } catch (err: any) {
      setSyncStatus(`Pull failed: ${err?.message || "unknown error"}`);
    } finally {
      setSyncing(false);
    }
  };

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
    if (confirm("Delete this question?")) {
      deleteQuestion(id);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Bulk selection + delete
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allFilteredSelected = filtered.length > 0 && filtered.every((q) => selected.has(q.id));

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((q) => next.delete(q.id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...filtered.map((q) => q.id)]));
    }
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    if (confirm(`Delete ${selected.size} selected question(s)? This cannot be undone.`)) {
      deleteQuestions([...selected]);
      setSelected(new Set());
    }
  };

  const handleDeleteAll = () => {
    if (questions.length === 0) return;
    if (!confirm(`Delete ALL ${questions.length} questions? This wipes the site and the server copy. Cannot be undone.`)) return;
    if (!confirm("Really sure? Last chance — everything goes.")) return;
    deleteQuestions(questions.map((q) => q.id));
    setSelected(new Set());
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
        <div className="header-actions">
          <button className="btn-outline-top" onClick={handleExport}>Export</button>
          <button className="btn-outline-top" onClick={() => setImportOpen((v) => !v)}>Import</button>
          <Link href="/admin/questions/new" className="btn-primary">+ Add Question</Link>
        </div>
      </div>

      {importOpen && (
        <div className="import-panel">
          <h3>Import questions from JSON</h3>
          <div className="import-grid">
            <div>
              <label>1. Choose file from this device</label>
              <input ref={fileRef} type="file" accept="application/json,.json" onChange={handlePickFile} />
              {importFileName && <span className="file-name">{importFileName}</span>}
            </div>
            <div>
              <label>2. Upload into category</label>
              <select value={importTargetCat} onChange={(e) => setImportTargetCat(e.target.value)}>
                <option value="keep">Keep original categories</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          {importError && <p className="import-error">{importError}</p>}
          {importPreview && (
            <p className="import-preview">
              {importPreview.length} questions ready — e.g. &ldquo;{importPreview[0]?.title}&rdquo;
              {importPreview.length > 1 ? ` (+${importPreview.length - 1} more)` : ""}.
              Status defaults to published unless the file says otherwise.
            </p>
          )}
          <div className="import-actions">
            <button className="btn-backup" onClick={() => { setImportOpen(false); setImportPreview(null); setImportRaw(""); setImportError(""); }}>Cancel</button>
            <button className="btn-backup primary" disabled={!importPreview || importing} onClick={handleUploadImport}>
              {importing ? "Uploading..." : `Upload ${importPreview ? importPreview.length : 0} to site`}
            </button>
          </div>
        </div>
      )}

      <div className="backup-bar">
        <span className="backup-hint">Changes auto-save to the server JSON file.</span>
        <div className="backup-actions">
          <button className="btn-backup primary" onClick={handlePushToServer} disabled={syncing}>
            {syncing ? "Working..." : "Push to server"}
          </button>
          <button className="btn-backup" onClick={handlePullFromServer} disabled={syncing}>Pull from server</button>
        </div>
        {syncStatus && <p className="sync-status">{syncStatus}</p>}
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

      <div className="bulk-bar">
        <span className="bulk-info">
          {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} shown`}
        </span>
        <div className="bulk-actions">
          <button className="btn-danger-outline" disabled={selected.size === 0} onClick={handleDeleteSelected}>
            Delete Selected{selected.size > 0 ? ` (${selected.size})` : ""}
          </button>
          {selected.size > 0 && (
            <button className="btn-backup" onClick={() => setSelected(new Set())}>Clear</button>
          )}
          <button className="btn-danger" onClick={handleDeleteAll}>Delete All</button>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}>
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleAllFiltered} title="Select all shown" />
              </th>
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
                <td onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selected.has(q.id)} onChange={() => toggleOne(q.id)} title="Select" />
                </td>
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
              <tr><td colSpan={9} className="empty">No questions found</td></tr>
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
        .header-actions { display: flex; gap: 8px; align-items: center; }
        .btn-outline-top {
          padding: 10px 18px; background: white; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; color: #475569;
        }
        .btn-outline-top:hover { border-color: #3b82f6; color: #3b82f6; }
        .import-panel {
          background: white; border: 1px dashed #93c5fd; border-radius: 12px;
          padding: 16px 18px; margin-bottom: 16px;
        }
        .import-panel h3 { margin: 0 0 12px 0; font-size: 14px; color: #0f172a; }
        .import-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .import-grid label { font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .import-grid input[type="file"], .import-grid select {
          width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; background: white; box-sizing: border-box;
        }
        .file-name { font-size: 12px; color: #3b82f6; display: block; margin-top: 6px; }
        .import-error { color: #dc2626; font-size: 12px; margin: 10px 0 0 0; }
        .import-preview {
          color: #166534; background: #f0fdf4; border: 1px solid #bbf7d0;
          padding: 8px 12px; border-radius: 8px; font-size: 12px; margin: 10px 0 0 0;
        }
        .import-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
        @media (max-width: 640px) { .import-grid { grid-template-columns: 1fr; } }
        .backup-bar {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
          padding: 10px 14px; margin-bottom: 16px;
        }
        .backup-hint { font-size: 12px; color: #92400e; font-weight: 600; }
        .backup-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .btn-backup {
          padding: 8px 14px; background: white; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; color: #475569;
        }
        .btn-backup:hover:not(:disabled) { border-color: #3b82f6; color: #3b82f6; }
        .btn-backup.primary { background: #3b82f6; border-color: #3b82f6; color: white; }
        .btn-backup.primary:hover:not(:disabled) { background: #2563eb; color: white; }
        .btn-backup:disabled { opacity: 0.6; cursor: wait; }
        .sync-status { font-size: 12px; color: #475569; margin: 8px 0 0 0; }
        .filters { display: flex; gap: 10px; margin-bottom: 12px; }
        .bulk-bar {
          display: flex; justify-content: space-between; align-items: center;
          background: white; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 8px 14px; margin-bottom: 16px;
        }
        .bulk-info { font-size: 12px; font-weight: 600; color: #475569; }
        .bulk-actions { display: flex; gap: 8px; }
        .btn-danger-outline {
          padding: 8px 14px; background: white; border: 1px solid #fca5a5;
          border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; color: #dc2626;
        }
        .btn-danger-outline:hover:not(:disabled) { background: #fef2f2; }
        .btn-danger-outline:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-danger {
          padding: 8px 14px; background: #dc2626; border: 1px solid #dc2626;
          border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; color: white;
        }
        .btn-danger:hover { background: #b91c1c; }
        .data-table input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; accent-color: #3b82f6; }
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
