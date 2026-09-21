"use client";

import { useState } from "react";
import { AdminProvider, useAdmin } from "../../AdminContext";
import AdminLayout from "../../AdminLayout";
import { SidebarMenuItem } from "../../types";

const EMOJI_OPTIONS = ["📊", "📁", "❓", "🖼️", "⚙️", "🌐", "📝", "🔗", "📌", "🏠", "👤", "🔑", "📈", "🎯", "💡", "🔔", "💬", "📧", "📂", "🗂️", "📋", "🛠️", "🔍", "📊"];

function MenuSettingsContent() {
  const { sidebarMenu, updateSidebarMenu, addSidebarItem, updateSidebarItem, deleteSidebarItem } = useAdmin();
  const [editingItem, setEditingItem] = useState<SidebarMenuItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", icon: "📊", href: "", section: "main" as string, visible: true });
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const mainItems = sidebarMenu.filter((i) => i.section === "main").sort((a, b) => a.order - b.order);
  const toolItems = sidebarMenu.filter((i) => i.section === "tools").sort((a, b) => a.order - b.order);
  const footerItems = sidebarMenu.filter((i) => i.section === "footer").sort((a, b) => a.order - b.order);

  const handleSave = () => {
    if (editingItem) {
      updateSidebarItem(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  const handleAdd = () => {
    if (!newItem.label || !newItem.href) return;
    addSidebarItem({
      ...newItem,
      order: sidebarMenu.length + 1,
    });
    setNewItem({ label: "", icon: "📊", href: "", section: "main", visible: true });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this menu item?")) {
      deleteSidebarItem(id);
    }
  };

  const handleToggleVisibility = (id: string, current: boolean) => {
    updateSidebarItem(id, { visible: !current });
  };

  const handleReorder = (fromId: string, toId: string) => {
    const items = [...sidebarMenu];
    const fromIdx = items.findIndex((i) => i.id === fromId);
    const toIdx = items.findIndex((i) => i.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = items.splice(fromIdx, 1);
    items.splice(toIdx, 0, moved);
    items.forEach((item, i) => { item.order = i + 1; });
    updateSidebarMenu(items);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      handleReorder(draggedId, targetId);
    }
    setDraggedId(null);
  };

  const renderItemList = (items: SidebarMenuItem[], sectionLabel: string) => (
    <div className="menu-section">
      <h3 className="section-title">{sectionLabel}</h3>
      {items.length === 0 && <p className="empty-text">No items in this section</p>}
      {items.map((item) => (
        <div
          key={item.id}
          className={`menu-item ${draggedId === item.id ? "dragging" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item.id)}
        >
          <span className="drag-handle">☰</span>
          <span className="item-icon">{item.icon}</span>
          <div className="item-info">
            <span className="item-label">{item.label}</span>
            <span className="item-href">{item.href}</span>
          </div>
          <div className="item-actions">
            <button
              className={`btn-icon ${item.visible ? "active" : "inactive"}`}
              onClick={() => handleToggleVisibility(item.id, item.visible)}
              title={item.visible ? "Hide" : "Show"}
            >
              {item.visible ? "👁️" : "👁️‍🗨️"}
            </button>
            <button className="btn-icon" onClick={() => setEditingItem({ ...item })} title="Edit">
              ✏️
            </button>
            <button className="btn-icon danger" onClick={() => handleDelete(item.id)} title="Delete">
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="menu-settings">
      <div className="page-header">
        <p className="description">Customize the admin sidebar menu. Drag to reorder, click edit to modify, or toggle visibility.</p>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>+ Add Menu Item</button>
      </div>

      {isAdding && (
        <div className="add-form">
          <h3>New Menu Item</h3>
          <div className="form-row">
            <label>Label</label>
            <input value={newItem.label} onChange={(e) => setNewItem({ ...newItem, label: e.target.value })} placeholder="Menu label" />
          </div>
          <div className="form-row">
            <label>Icon (emoji)</label>
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className={`emoji-btn ${newItem.icon === emoji ? "selected" : ""}`}
                  onClick={() => setNewItem({ ...newItem, icon: emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="form-row">
            <label>URL</label>
            <input value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })} placeholder="/admin/page" />
          </div>
          <div className="form-row">
            <label>Section</label>
            <select value={newItem.section} onChange={(e) => setNewItem({ ...newItem, section: e.target.value })}>
              <option value="main">Main Navigation</option>
              <option value="tools">Tools</option>
              <option value="footer">Footer</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAdd}>Add Item</button>
            <button className="btn-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="edit-modal">
          <div className="edit-overlay" onClick={() => setEditingItem(null)} />
          <div className="edit-panel">
            <h3>Edit Menu Item</h3>
            <div className="form-row">
              <label>Label</label>
              <input value={editingItem.label} onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Icon (emoji)</label>
              <div className="emoji-picker">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className={`emoji-btn ${editingItem.icon === emoji ? "selected" : ""}`}
                    onClick={() => setEditingItem({ ...editingItem, icon: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>URL</label>
              <input value={editingItem.href} onChange={(e) => setEditingItem({ ...editingItem, href: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Section</label>
              <select value={editingItem.section || "main"} onChange={(e) => setEditingItem({ ...editingItem, section: e.target.value })}>
                <option value="main">Main Navigation</option>
                <option value="tools">Tools</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  checked={editingItem.visible}
                  onChange={(e) => setEditingItem({ ...editingItem, visible: e.target.checked })}
                />
                Visible in sidebar
              </label>
            </div>
            <div className="form-actions">
              <button className="btn-save" onClick={handleSave}>Save Changes</button>
              <button className="btn-cancel" onClick={() => setEditingItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {renderItemList(mainItems, "Main Navigation")}
      {renderItemList(toolItems, "Tools")}
      {renderItemList(footerItems, "Footer")}

      <style jsx>{`
        .menu-settings { max-width: 800px; }
        .page-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px;
        }
        .description { color: #64748b; font-size: 14px; margin: 0; }
        .btn-primary {
          padding: 10px 20px; background: #3b82f6; color: white; border: none;
          border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;
        }
        .btn-primary:hover { background: #2563eb; }
        .menu-section {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 16px; margin-bottom: 16px;
        }
        .section-title {
          font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase;
          letter-spacing: 0.05em; margin: 0 0 12px; padding-bottom: 8px;
          border-bottom: 1px solid #f1f5f9;
        }
        .empty-text { color: #94a3b8; font-size: 13px; margin: 0; padding: 8px 0; }
        .menu-item {
          display: flex; align-items: center; gap: 12px; padding: 10px 12px;
          border-radius: 8px; transition: all 0.2s; border: 1px solid transparent;
        }
        .menu-item:hover { background: #f8fafc; border-color: #e2e8f0; }
        .menu-item.dragging { opacity: 0.4; background: #eff6ff; }
        .drag-handle {
          cursor: grab; color: #94a3b8; font-size: 16px; user-select: none;
        }
        .item-icon { font-size: 18px; width: 28px; text-align: center; }
        .item-info { flex: 1; min-width: 0; }
        .item-label { display: block; font-weight: 500; color: #0f172a; font-size: 14px; }
        .item-href { display: block; color: #94a3b8; font-size: 12px; font-family: monospace; }
        .item-actions { display: flex; gap: 4px; }
        .btn-icon {
          width: 32px; height: 32px; border: none; background: none; cursor: pointer;
          border-radius: 6px; font-size: 14px; display: flex; align-items: center;
          justify-content: center; transition: background 0.15s;
        }
        .btn-icon:hover { background: #f1f5f9; }
        .btn-icon.active { color: #22c55e; }
        .btn-icon.inactive { color: #94a3b8; }
        .btn-icon.danger:hover { background: #fee2e2; }
        .add-form, .edit-panel {
          background: white; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 20px; margin-bottom: 16px;
        }
        .edit-modal {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .edit-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
        }
        .edit-panel {
          position: relative; z-index: 1; width: 480px; max-width: 90vw;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .add-form h3, .edit-panel h3 {
          margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #0f172a;
        }
        .form-row { margin-bottom: 14px; }
        .form-row label {
          display: block; font-size: 13px; font-weight: 500; color: #475569;
          margin-bottom: 6px;
        }
        .form-row input, .form-row select {
          width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 13px; box-sizing: border-box;
        }
        .form-row input:focus, .form-row select:focus {
          outline: none; border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
        .emoji-picker {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .emoji-btn {
          width: 36px; height: 36px; border: 2px solid transparent; background: #f8fafc;
          border-radius: 8px; font-size: 18px; cursor: pointer; transition: all 0.15s;
        }
        .emoji-btn:hover { border-color: #cbd5e1; }
        .emoji-btn.selected { border-color: #3b82f6; background: #eff6ff; }
        .form-actions { display: flex; gap: 8px; margin-top: 16px; }
        .btn-save {
          padding: 10px 20px; background: #3b82f6; color: white; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
        }
        .btn-save:hover { background: #2563eb; }
        .btn-cancel {
          padding: 10px 20px; background: #f1f5f9; color: #475569; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
        }
        .btn-cancel:hover { background: #e2e8f0; }
      `}</style>
    </div>
  );
}

export default function MenuSettingsPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <MenuSettingsContent />
      </AdminLayout>
    </AdminProvider>
  );
}
