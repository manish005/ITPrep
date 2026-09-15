"use client";

import { useState, useCallback, useRef } from "react";
import { AnswerBlock, TableBlock, ListBlock, ImageBlock, CodeBlock, HeadingBlock, ParagraphBlock, QuoteBlock, NoteBlock } from "./types";
import AnswerRenderer from "./AnswerRenderer";

let idCounter = 0;
function genUniqueId(): string {
  idCounter++;
  return `${Date.now()}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================
// BLOCK LIBRARY - Left Panel
// ============================================

interface BlockLibraryProps {
  onAddBlock: (type: AnswerBlock["type"]) => void;
}

function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const blocks = [
    { type: "heading" as const, label: "Heading", icon: "H" },
    { type: "paragraph" as const, label: "Paragraph", icon: "¶" },
    { type: "bullet-list" as const, label: "Bullet Points", icon: "•" },
    { type: "numbered-list" as const, label: "Numbered Points", icon: "1." },
    { type: "table" as const, label: "Table", icon: "⊞" },
    { type: "image" as const, label: "Image", icon: "🖼" },
    { type: "code" as const, label: "Code", icon: "<>" },
    { type: "quote" as const, label: "Quote", icon: "❝" },
    { type: "note" as const, label: "Note", icon: "ℹ" },
    { type: "divider" as const, label: "Divider", icon: "—" },
    { type: "spacer" as const, label: "Spacer", icon: "↕" },
  ];

  return (
    <div className="block-library">
      <h3 className="library-title">Content Blocks</h3>
      <p className="library-hint">Click to add to answer</p>
      <div className="block-list">
        {blocks.map((block) => (
          <button
            key={block.type}
            className="block-item"
            onClick={() => onAddBlock(block.type)}
            draggable
          >
            <span className="block-icon">{block.icon}</span>
            <span className="block-label">{block.label}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .block-library {
          width: 200px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 16px;
          overflow-y: auto;
        }

        .library-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 4px 0;
        }

        .library-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 0 0 16px 0;
        }

        .block-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .block-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: grab;
          font-size: 13px;
          color: #475569;
          transition: all 0.2s;
        }

        .block-item:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .block-item:active {
          cursor: grabbing;
        }

        .block-icon {
          width: 24px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
        }

        .block-label {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

// ============================================
// BLOCK COMPONENTS - Individual block renderers
// ============================================

interface BlockComponentProps {
  block: AnswerBlock;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (block: AnswerBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

function BlockComponent({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: BlockComponentProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleUpdate = (updates: Partial<AnswerBlock>) => {
    onUpdate({ ...block, ...updates } as AnswerBlock);
  };

  return (
    <div
      className={`block-wrapper ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="block-header">
        <span className="block-type">{getBlockLabel(block.type)}</span>
        <div className="block-actions">
          <button className="menu-btn" onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
            ⋮
          </button>
          {showMenu && (
            <div className="block-menu">
              <button onClick={(e) => { e.stopPropagation(); onMoveUp(); setShowMenu(false); }}>↑ Move Up</button>
              <button onClick={(e) => { e.stopPropagation(); onMoveDown(); setShowMenu(false); }}>↓ Move Down</button>
              <button onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }}>⧉ Duplicate</button>
              <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}>🗑 Delete</button>
            </div>
          )}
        </div>
      </div>
      <div className="block-content">
        {block.type === "paragraph" && (
          <textarea
            className="paragraph-input"
            value={(block as ParagraphBlock).content}
            onChange={(e) => handleUpdate({ content: e.target.value })}
            placeholder="Enter paragraph text..."
          />
        )}
        {block.type === "heading" && (
          <div className="heading-editor">
            <select
              value={(block as HeadingBlock).level}
              onChange={(e) => handleUpdate({ level: Number(e.target.value) as 1 | 2 | 3 | 4 })}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
            <input
              type="text"
              value={(block as HeadingBlock).text}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Enter heading text..."
            />
          </div>
        )}
        {block.type === "table" && <TableEditor block={block as TableBlock} onUpdate={handleUpdate} />}
        {(block.type === "bullet-list" || block.type === "numbered-list") && (
          <ListEditor block={block as ListBlock} onUpdate={handleUpdate} />
        )}
        {block.type === "code" && <CodeEditor block={block as CodeBlock} onUpdate={handleUpdate} />}
        {block.type === "image" && <ImageEditor block={block as ImageBlock} onUpdate={handleUpdate} />}
        {block.type === "quote" && (
          <div className="quote-editor">
            <textarea
              value={(block as QuoteBlock).text}
              onChange={(e) => handleUpdate({ text: e.target.value })}
              placeholder="Enter quote text..."
            />
            <input
              type="text"
              value={(block as QuoteBlock).author || ""}
              onChange={(e) => handleUpdate({ author: e.target.value })}
              placeholder="Author (optional)"
            />
          </div>
        )}
        {block.type === "note" && (
          <div className="note-editor">
            <select
              value={(block as NoteBlock).noteType}
              onChange={(e) => handleUpdate({ noteType: e.target.value as "info" | "warning" | "tip" | "important" })}
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="tip">Tip</option>
              <option value="important">Important</option>
            </select>
            <textarea
              value={(block as NoteBlock).content}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              placeholder="Enter note content..."
            />
          </div>
        )}
        {block.type === "divider" && <div className="divider-preview">──────────</div>}
        {block.type === "spacer" && (
          <div className="spacer-editor">
            <label>Height:</label>
            <input
              type="number"
              value={(block as any).height || 20}
              onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
              min="10"
              max="100"
            />
            <span>px</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .block-wrapper {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .block-wrapper:hover {
          border-color: #cbd5e1;
        }

        .block-wrapper.selected {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .block-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          border-radius: 8px 8px 0 0;
        }

        .block-type {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .block-actions {
          position: relative;
        }

        .menu-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          font-size: 16px;
          color: #94a3b8;
        }

        .menu-btn:hover {
          color: #475569;
        }

        .block-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 10;
          min-width: 140px;
        }

        .block-menu button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          background: none;
          border: none;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
        }

        .block-menu button:hover {
          background: #f1f5f9;
        }

        .block-menu button.delete {
          color: #ef4444;
        }

        .block-content {
          padding: 12px;
        }

        .paragraph-input {
          width: 100%;
          min-height: 80px;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.6;
          resize: vertical;
        }

        .paragraph-input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .heading-editor {
          display: flex;
          gap: 10px;
        }

        .heading-editor select {
          width: 70px;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
        }

        .heading-editor input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
        }

        .heading-editor input:focus,
        .heading-editor select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .quote-editor textarea {
          width: 100%;
          min-height: 60px;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-style: italic;
          resize: vertical;
        }

        .quote-editor input {
          width: 100%;
          margin-top: 8px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
        }

        .note-editor select {
          width: 100%;
          margin-bottom: 8px;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }

        .note-editor textarea {
          width: 100%;
          min-height: 60px;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          resize: vertical;
        }

        .divider-preview {
          text-align: center;
          color: #cbd5e1;
          padding: 8px;
        }

        .spacer-editor {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spacer-editor input {
          width: 60px;
          padding: 6px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
        }

        .spacer-editor label,
        .spacer-editor span {
          font-size: 13px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}

// ============================================
// TABLE EDITOR
// ============================================

interface TableEditorProps {
  block: TableBlock;
  onUpdate: (updates: Partial<TableBlock>) => void;
}

function TableEditor({ block, onUpdate }: TableEditorProps) {
  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = block.rows.map((row, ri) => {
      if (ri !== rowIndex) return row;
      return {
        ...row,
        cells: row.cells.map((cell, ci) => {
          if (ci !== cellIndex) return cell;
          return { ...cell, content: value };
        }),
      };
    });
    onUpdate({ rows: newRows });
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newColumns = [...block.columns];
    newColumns[index] = value;
    onUpdate({ columns: newColumns });
  };

  const addRow = () => {
    const newRow = {
      id: genUniqueId(),
      cells: block.columns.map(() => ({ id: genUniqueId(), content: "" })),
    };
    onUpdate({ rows: [...block.rows, newRow] });
  };

  const addColumn = () => {
    const newColumns = [...block.columns, "New Column"];
    const newRows = block.rows.map((row) => ({
      ...row,
      cells: [...row.cells, { id: genUniqueId(), content: "" }],
    }));
    onUpdate({ columns: newColumns, rows: newRows });
  };

  const deleteRow = (index: number) => {
    if (block.rows.length <= 1) return;
    onUpdate({ rows: block.rows.filter((_, i) => i !== index) });
  };

  const deleteColumn = (index: number) => {
    if (block.columns.length <= 1) return;
    onUpdate({
      columns: block.columns.filter((_, i) => i !== index),
      rows: block.rows.map((row) => ({
        ...row,
        cells: row.cells.filter((_, i) => i !== index),
      })),
    });
  };

  return (
    <div className="table-editor">
      <div className="table-controls">
        <button onClick={addRow}>+ Add Row</button>
        <button onClick={addColumn}>+ Add Column</button>
      </div>
      <div className="table-preview">
        <table>
          <thead>
            <tr>
              {block.columns.map((col, i) => (
                <th key={i}>
                  <input
                    value={col}
                    onChange={(e) => handleHeaderChange(i, e.target.value)}
                  />
                  {block.columns.length > 1 && (
                    <button className="delete-col" onClick={() => deleteColumn(i)}>×</button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={row.id}>
                {row.cells.map((cell, ci) => (
                  <td key={cell.id}>
                    <input
                      value={cell.content}
                      onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                    />
                  </td>
                ))}
                <td className="row-actions">
                  {block.rows.length > 1 && (
                    <button className="delete-row" onClick={() => deleteRow(ri)}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-editor {
          width: 100%;
        }

        .table-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .table-controls button {
          padding: 6px 12px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
        }

        .table-controls button:hover {
          background: #e2e8f0;
        }

        .table-preview {
          overflow-x: auto;
        }

        .table-preview table {
          width: 100%;
          border-collapse: collapse;
        }

        .table-preview th,
        .table-preview td {
          border: 1px solid #e2e8f0;
          padding: 0;
        }

        .table-preview th {
          background: #f8fafc;
        }

        .table-preview input {
          width: 100%;
          padding: 8px 10px;
          border: none;
          font-size: 13px;
        }

        .table-preview th input {
          font-weight: 600;
        }

        .table-preview input:focus {
          outline: none;
          background: #eff6ff;
        }

        .row-actions {
          width: 30px;
          padding: 4px !important;
          text-align: center;
        }

        .delete-row,
        .delete-col {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 16px;
          padding: 2px 6px;
        }

        .delete-row:hover,
        .delete-col:hover {
          background: #fee2e2;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

// ============================================
// LIST EDITOR
// ============================================

interface ListEditorProps {
  block: ListBlock;
  onUpdate: (updates: Partial<ListBlock>) => void;
}

function ListEditor({ block, onUpdate }: ListEditorProps) {
  const addItem = () => {
    const newItem = {
      id: genUniqueId(),
      title: "",
      description: "",
      code: "",
      codeLanguage: "typescript",
      subItems: [],
    };
    onUpdate({ items: [...block.items, newItem] });
  };

  const addSubItem = (parentIndex: number) => {
    const newItems = block.items.map((item, i) => {
      if (i !== parentIndex) return item;
      const newSubItem = {
        id: genUniqueId(),
        title: "",
        description: "",
        code: "",
        codeLanguage: "typescript",
      };
      return { ...item, subItems: [...(item.subItems || []), newSubItem] };
    });
    onUpdate({ items: newItems });
  };

  const updateItem = (index: number, updates: Partial<typeof block.items[0]>) => {
    const newItems = block.items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, ...updates };
    });
    onUpdate({ items: newItems });
  };

  const updateSubItem = (parentIndex: number, subIndex: number, updates: Partial<typeof block.items[0]>) => {
    const newItems = block.items.map((item, i) => {
      if (i !== parentIndex) return item;
      const newSubItems = (item.subItems || []).map((sub, si) => {
        if (si !== subIndex) return sub;
        return { ...sub, ...updates };
      });
      return { ...item, subItems: newSubItems };
    });
    onUpdate({ items: newItems });
  };

  const deleteItem = (index: number) => {
    if (block.items.length <= 1) return;
    onUpdate({ items: block.items.filter((_, i) => i !== index) });
  };

  const deleteSubItem = (parentIndex: number, subIndex: number) => {
    const newItems = block.items.map((item, i) => {
      if (i !== parentIndex) return item;
      return { ...item, subItems: (item.subItems || []).filter((_, si) => si !== subIndex) };
    });
    onUpdate({ items: newItems });
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= block.items.length) return;
    const newItems = [...block.items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    onUpdate({ items: newItems });
  };

  return (
    <div className="list-editor">
      <div className="list-type-toggle">
        <label>
          <input
            type="radio"
            name={`list-type-${block.id}`}
            checked={block.type === "numbered-list"}
            onChange={() => onUpdate({ type: "numbered-list" })}
          />
          Numbered
        </label>
        <label>
          <input
            type="radio"
            name={`list-type-${block.id}`}
            checked={block.type === "bullet-list"}
            onChange={() => onUpdate({ type: "bullet-list" })}
          />
          Bullet
        </label>
      </div>

      <div className="list-items">
        {block.items.map((item, index) => (
          <div key={item.id} className="list-item-wrapper">
            <div className="list-item">
              <span className="item-number">{block.type === "numbered-list" ? `${index + 1}.` : "•"}</span>
              <div className="item-fields">
                <input
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  placeholder="Title (optional)"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  placeholder="Description"
                />
                <div className="code-toggle-row">
                  <label className="code-toggle">
                    <input
                      type="checkbox"
                      checked={!!item.code}
                      onChange={(e) => updateItem(index, { 
                        code: e.target.value ? "" : "",
                        codeLanguage: item.codeLanguage || "typescript"
                      })}
                    />
                    Add Code
                  </label>
                  {item.code !== undefined && (
                    <select
                      value={item.codeLanguage || "typescript"}
                      onChange={(e) => updateItem(index, { codeLanguage: e.target.value })}
                      className="lang-select"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="bash">Bash</option>
                      <option value="json">JSON</option>
                    </select>
                  )}
                </div>
                {item.code !== undefined && (
                  <textarea
                    value={item.code}
                    onChange={(e) => updateItem(index, { code: e.target.value })}
                    placeholder="Code snippet..."
                    className="code-input"
                  />
                )}
              </div>
              <div className="item-actions">
                <button onClick={() => addSubItem(index)} title="Add sub-item">+</button>
                <button onClick={() => moveItem(index, "up")} disabled={index === 0}>↑</button>
                <button onClick={() => moveItem(index, "down")} disabled={index === block.items.length - 1}>↓</button>
                <button className="delete" onClick={() => deleteItem(index)} disabled={block.items.length <= 1}>×</button>
              </div>
            </div>
            
            {/* Nested sub-items */}
            {item.subItems && item.subItems.length > 0 && (
              <div className="sub-items">
                {item.subItems.map((sub, subIndex) => (
                  <div key={sub.id} className="sub-item">
                    <span className="sub-bullet">└</span>
                    <div className="item-fields">
                      <input
                        value={sub.title}
                        onChange={(e) => updateSubItem(index, subIndex, { title: e.target.value })}
                        placeholder="Sub-item title (optional)"
                      />
                      <textarea
                        value={sub.description}
                        onChange={(e) => updateSubItem(index, subIndex, { description: e.target.value })}
                        placeholder="Sub-item description"
                      />
                      <div className="code-toggle-row">
                        <label className="code-toggle">
                          <input
                            type="checkbox"
                            checked={!!sub.code}
                            onChange={(e) => updateSubItem(index, subIndex, { 
                              code: e.target.value ? "" : "",
                              codeLanguage: sub.codeLanguage || "typescript"
                            })}
                          />
                          Add Code
                        </label>
                        {sub.code !== undefined && (
                          <select
                            value={sub.codeLanguage || "typescript"}
                            onChange={(e) => updateSubItem(index, subIndex, { codeLanguage: e.target.value })}
                            className="lang-select"
                          >
                            <option value="typescript">TypeScript</option>
                            <option value="javascript">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="bash">Bash</option>
                            <option value="json">JSON</option>
                          </select>
                        )}
                      </div>
                      {sub.code !== undefined && (
                        <textarea
                          value={sub.code}
                          onChange={(e) => updateSubItem(index, subIndex, { code: e.target.value })}
                          placeholder="Code snippet..."
                          className="code-input"
                        />
                      )}
                    </div>
                    <button className="delete-sub" onClick={() => deleteSubItem(index, subIndex)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="add-item-btn" onClick={addItem}>+ Add Point</button>

      <style jsx>{`
        .list-editor {
          width: 100%;
        }

        .list-type-toggle {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .list-type-toggle label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
        }

        .list-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .list-item-wrapper {
          display: flex;
          flex-direction: column;
        }

        .list-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .item-number {
          width: 24px;
          font-weight: 600;
          color: #64748b;
          padding-top: 8px;
        }

        .item-fields {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .item-fields input {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
        }

        .item-fields textarea {
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          min-height: 50px;
          resize: vertical;
        }

        .item-fields textarea.code-input {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 1px solid #334155;
          border-radius: 8px;
          font-family: "Fira Code", "Consolas", monospace;
          font-size: 13px;
          line-height: 1.6;
          resize: vertical;
          tab-size: 2;
          background: #1e1e1e;
          color: #d4d4d4;
        }

        .item-fields textarea.code-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }

        .item-fields input:focus,
        .item-fields textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .code-toggle-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
        }

        .code-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #64748b;
          cursor: pointer;
          padding: 4px 10px;
          background: #f1f5f9;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .code-toggle:hover {
          background: #e2e8f0;
          color: #3b82f6;
        }

        .code-toggle input {
          width: auto;
        }

        .lang-select {
          padding: 6px 10px;
          border: 1px solid #334155;
          border-radius: 6px;
          font-size: 12px;
          font-family: "Fira Code", "Consolas", monospace;
          background: #1e1e1e;
          color: #d4d4d4;
          cursor: pointer;
        }

        .lang-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-actions button {
          width: 24px;
          height: 24px;
          border: none;
          background: #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .item-actions button:hover:not(:disabled) {
          background: #cbd5e1;
        }

        .item-actions button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .item-actions button.delete {
          background: #fee2e2;
          color: #ef4444;
        }

        .add-item-btn {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          background: #f1f5f9;
          border: 1px dashed #cbd5e1;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          color: #64748b;
        }

        .add-item-btn:hover {
          background: #e2e8f0;
          border-color: #94a3b8;
        }

        .sub-items {
          margin-left: 34px;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-left: 12px;
          border-left: 2px solid #e2e8f0;
        }

        .sub-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px;
          background: #f1f5f9;
          border-radius: 6px;
        }

        .sub-bullet {
          width: 20px;
          font-size: 14px;
          color: #94a3b8;
          padding-top: 6px;
        }

        .delete-sub {
          width: 20px;
          height: 20px;
          border: none;
          background: #fee2e2;
          color: #ef4444;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          padding: 0;
          margin-top: 6px;
        }

        .delete-sub:hover {
          background: #fecaca;
        }
      `}</style>
    </div>
  );
}

// ============================================
// CODE EDITOR
// ============================================

interface CodeEditorProps {
  block: CodeBlock;
  onUpdate: (updates: Partial<CodeBlock>) => void;
}

function CodeEditor({ block, onUpdate }: CodeEditorProps) {
  const languages = [
    "typescript", "javascript", "html", "css", "json",
    "csharp", "python", "sql", "powershell", "bash",
    "xml", "yaml", "markdown",
  ];

  return (
    <div className="code-editor">
      <select
        value={block.language}
        onChange={(e) => onUpdate({ language: e.target.value })}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      <textarea
        value={block.code}
        onChange={(e) => onUpdate({ code: e.target.value })}
        placeholder="Paste or write code here..."
        spellCheck={false}
      />

      <style jsx>{`
        .code-editor {
          width: 100%;
        }

        .code-editor select {
          width: 100%;
          margin-bottom: 8px;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }

        .code-editor textarea {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-family: "Fira Code", "Consolas", monospace;
          font-size: 13px;
          line-height: 1.6;
          resize: vertical;
          tab-size: 2;
        }

        .code-editor textarea:focus {
          outline: none;
          border-color: #3b82f6;
        }
      `}</style>
    </div>
  );
}

// ============================================
// IMAGE EDITOR
// ============================================

interface ImageEditorProps {
  block: ImageBlock;
  onUpdate: (updates: Partial<ImageBlock>) => void;
}

function ImageEditor({ block, onUpdate }: ImageEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onUpdate({ imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-editor">
      {/* Drag and Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? "dragging" : ""} ${block.imageUrl ? "has-image" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={0}
      >
        {block.imageUrl ? (
          <div className="drop-zone-content">
            <img src={block.imageUrl} alt={block.alt} className="drop-preview" />
            <div className="drop-overlay">
              <span>Drop new image to replace</span>
            </div>
          </div>
        ) : (
          <div className="drop-zone-placeholder">
            <div className="drop-icon">🖼️</div>
            <p className="drop-text">Drag & drop an image here</p>
            <p className="drop-hint">or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileInput}
              className="file-input"
            />
            <button
              type="button"
              className="browse-btn"
              onClick={openFilePicker}
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="form-row">
        <label>Or enter image URL</label>
        <input
          type="text"
          value={block.imageUrl && !block.imageUrl.startsWith("data:") ? block.imageUrl : ""}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          placeholder="https://example.com/image.png"
        />
      </div>

      {/* Alt Text */}
      <div className="form-row">
        <label>Alt Text</label>
        <input
          type="text"
          value={block.alt}
          onChange={(e) => onUpdate({ alt: e.target.value })}
          placeholder="Describe the image"
        />
      </div>

      {/* Caption */}
      <div className="form-row">
        <label>Caption (optional)</label>
        <input
          type="text"
          value={block.caption || ""}
          onChange={(e) => onUpdate({ caption: e.target.value })}
          placeholder="Image caption"
        />
      </div>

      {/* Alignment */}
      <div className="form-row">
        <label>Alignment</label>
        <select
          value={block.alignment}
          onChange={(e) => onUpdate({ alignment: e.target.value as "left" | "center" | "right" })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Clear Image */}
      {block.imageUrl && (
        <button
          type="button"
          className="clear-btn"
          onClick={() => onUpdate({ imageUrl: "" })}
        >
          ✕ Remove Image
        </button>
      )}

      <style jsx>{`
        .image-editor {
          width: 100%;
        }

        .drop-zone {
          position: relative;
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 12px;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .drop-zone:hover {
          border-color: #3b82f6;
          background: #f8fafc;
        }

        .drop-zone.dragging {
          border-color: #3b82f6;
          background: #eff6ff;
          border-style: solid;
        }

        .drop-zone.has-image {
          padding: 0;
          border-style: solid;
          border-color: #e2e8f0;
        }

        .drop-zone-content {
          position: relative;
          width: 100%;
        }

        .drop-preview {
          width: 100%;
          height: auto;
          max-height: 200px;
          object-fit: contain;
          display: block;
          border-radius: 6px;
        }

        .drop-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 6px;
        }

        .drop-zone:hover .drop-overlay {
          opacity: 1;
        }

        .drop-overlay span {
          color: white;
          font-size: 14px;
          font-weight: 500;
        }

        .drop-zone-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drop-icon {
          font-size: 36px;
        }

        .drop-text {
          margin: 0;
          font-size: 14px;
          color: #475569;
          font-weight: 500;
        }

        .drop-hint {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
        }

        .file-input {
          display: none;
        }

        .browse-btn {
          margin-top: 8px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .browse-btn:hover {
          background: #2563eb;
        }

        .form-row {
          margin-bottom: 10px;
        }

        .form-row label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 4px;
        }

        .form-row input,
        .form-row select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 13px;
        }

        .form-row input:focus,
        .form-row select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .clear-btn {
          width: 100%;
          padding: 8px;
          background: #fee2e2;
          color: #dc2626;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 8px;
        }

        .clear-btn:hover {
          background: #fecaca;
        }
      `}</style>
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getBlockLabel(type: AnswerBlock["type"]): string {
  const labels: Record<AnswerBlock["type"], string> = {
    heading: "Heading",
    paragraph: "Paragraph",
    "bullet-list": "Bullet List",
    "numbered-list": "Numbered List",
    table: "Table",
    image: "Image",
    code: "Code",
    quote: "Quote",
    note: "Note",
    divider: "Divider",
    spacer: "Spacer",
  };
  return labels[type] || type;
}

function createBlock(type: AnswerBlock["type"]): AnswerBlock {
  const id = genUniqueId();
  switch (type) {
    case "paragraph":
      return { id, type: "paragraph", content: "" };
    case "heading":
      return { id, type: "heading", level: 2, text: "" };
    case "bullet-list":
      return { id, type: "bullet-list", items: [{ id: genUniqueId(), title: "", description: "" }] };
    case "numbered-list":
      return { id, type: "numbered-list", items: [{ id: genUniqueId(), title: "", description: "" }] };
    case "table":
      return {
        id,
        type: "table",
        columns: ["Column 1", "Column 2", "Column 3"],
        rows: [
          { id: genUniqueId(), cells: [{ id: genUniqueId(), content: "" }, { id: genUniqueId(), content: "" }, { id: genUniqueId(), content: "" }] },
        ],
        headerEnabled: true,
      };
    case "image":
      return { id, type: "image", imageUrl: "", alt: "", alignment: "center", width: "100%" };
    case "code":
      return { id, type: "code", language: "typescript", code: "" };
    case "quote":
      return { id, type: "quote", text: "", author: "" };
    case "note":
      return { id, type: "note", content: "", noteType: "info" };
    case "divider":
      return { id, type: "divider" };
    case "spacer":
      return { id, type: "spacer", height: 20 };
    default:
      return { id, type: "paragraph", content: "" };
  }
}

// ============================================
// MAIN ANSWER BUILDER
// ============================================

interface AnswerBuilderProps {
  questionId: string;
  questionTitle: string;
  initialBlocks?: AnswerBlock[];
  onSave?: (blocks: AnswerBlock[]) => void;
}

export default function AnswerBuilder({
  questionId,
  questionTitle,
  initialBlocks = [],
  onSave,
}: AnswerBuilderProps) {
  const [blocks, setBlocks] = useState<AnswerBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [undoStack, setUndoStack] = useState<AnswerBlock[][]>([]);
  const [redoStack, setRedoStack] = useState<AnswerBlock[][]>([]);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const saveToUndoStack = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-20), blocks]);
    setRedoStack([]);
  }, [blocks]);

  const addBlock = (type: AnswerBlock["type"]) => {
    saveToUndoStack();
    const newBlock = createBlock(type);
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setSaveStatus("unsaved");
  };

  const updateBlock = (updatedBlock: AnswerBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    setSaveStatus("unsaved");
  };

  const deleteBlock = (id: string) => {
    saveToUndoStack();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    setSaveStatus("unsaved");
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    saveToUndoStack();
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
    setSaveStatus("unsaved");
  };

  const duplicateBlock = (index: number) => {
    saveToUndoStack();
    const original = blocks[index];
    const duplicate = { ...original, id: genUniqueId() };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicate);
    setBlocks(newBlocks);
    setSelectedBlockId(duplicate.id);
    setSaveStatus("unsaved");
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, blocks]);
    setBlocks(previous);
    setUndoStack((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, blocks]);
    setBlocks(next);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      onSave?.(blocks);
    }, 1000);
  };

  return (
    <div className="answer-builder">
      {/* Top Bar */}
      <div className="builder-topbar">
        <div className="topbar-left">
          <h2 className="builder-title">Answer Builder</h2>
          <span className="question-label">Q: {questionTitle}</span>
        </div>
        <div className="topbar-center">
          <span className={`save-status ${saveStatus}`}>
            {saveStatus === "saved" && "✓ Saved"}
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "unsaved" && "Unsaved changes"}
          </span>
        </div>
        <div className="topbar-right">
          <button className="topbar-btn" onClick={undo} disabled={undoStack.length === 0}>
            ↩ Undo
          </button>
          <button className="topbar-btn" onClick={redo} disabled={redoStack.length === 0}>
            ↪ Redo
          </button>
          <button className="topbar-btn preview" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? "✕ Close Preview" : "👁 Preview"}
          </button>
          <button className="topbar-btn save" onClick={handleSave}>
            💾 Save
          </button>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="builder-main">
        {/* Left: Block Library */}
        <BlockLibrary onAddBlock={addBlock} />

        {/* Center: Answer Canvas */}
        <div className="answer-canvas">
          {blocks.length === 0 ? (
            <div className="empty-canvas">
              <div className="empty-icon">📝</div>
              <h3>Start Building Your Answer</h3>
              <p>Click a block from the left panel to add content</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <BlockComponent
                key={block.id}
                block={block}
                isSelected={selectedBlockId === block.id}
                onSelect={() => setSelectedBlockId(block.id)}
                onUpdate={updateBlock}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => moveBlock(index, "up")}
                onMoveDown={() => moveBlock(index, "down")}
                onDuplicate={() => duplicateBlock(index)}
              />
            ))
          )}
        </div>

        {/* Right: Preview Panel */}
        {showPreview && (
          <div className="preview-panel">
            <h3 className="preview-title">Preview</h3>
            <div className="preview-content">
              <AnswerRenderer blocks={blocks} />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .answer-builder {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px);
          background: #f1f5f9;
        }

        .builder-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .builder-title {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .question-label {
          font-size: 13px;
          color: #64748b;
          padding: 4px 10px;
          background: #f1f5f9;
          border-radius: 6px;
        }

        .topbar-center {
          font-size: 13px;
        }

        .save-status {
          color: #64748b;
        }

        .save-status.saved {
          color: #22c55e;
        }

        .save-status.saving {
          color: #f59e0b;
        }

        .save-status.unsaved {
          color: #ef4444;
        }

        .topbar-right {
          display: flex;
          gap: 8px;
        }

        .topbar-btn {
          padding: 8px 14px;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          color: #475569;
        }

        .topbar-btn:hover:not(:disabled) {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .topbar-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .topbar-btn.preview {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .topbar-btn.save {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .topbar-btn.save:hover {
          background: #2563eb;
        }

        .builder-main {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .answer-canvas {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .empty-canvas {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-canvas h3 {
          font-size: 18px;
          color: #64748b;
          margin: 0 0 8px 0;
        }

        .empty-canvas p {
          font-size: 14px;
          margin: 0;
        }

        .preview-panel {
          width: 350px;
          background: white;
          border-left: 1px solid #e2e8f0;
          overflow-y: auto;
          padding: 16px;
        }

        .preview-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-content {
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
        }
      `}</style>
    </div>
  );
}
