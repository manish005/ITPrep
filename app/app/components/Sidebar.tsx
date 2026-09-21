"use client";

import { useState, useEffect } from "react";
import { getCategories } from "../data/storage";

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface CategoryNode {
  id: string;
  name: string;
  icon: string;
  slug: string;
  parentId?: string;
  children: CategoryNode[];
}

function buildTree(categories: any[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

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

  const sortTree = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => {
      const catA = categories.find((c: any) => c.id === a.id);
      const catB = categories.find((c: any) => c.id === b.id);
      return (catA?.order || 0) - (catB?.order || 0);
    });
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

export function Sidebar({ activeItem, onItemClick, isOpen = false, onClose }: SidebarProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cats = getCategories().filter((c: any) => c.status === "active");
    setCategories(cats);
    setExpandedIds(new Set(cats.filter((c: any) => !c.parentId).map((c: any) => c.id)));
  }, []);

  const tree = buildTree(categories);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set<string>();
      // Accordion: if clicking an already-expanded item, collapse it; otherwise expand only this one
      if (prev.has(id)) {
        return next;
      }
      next.add(id);
      return next;
    });
  };

  const handleCategoryClick = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (cat && !cat.parentId) {
      toggleExpand(catId);
    }
    onItemClick(catId);
    if (onClose) onClose();
  };

  const renderCategory = (node: CategoryNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isActive = activeItem === node.id;

    return (
      <div key={node.id}>
        <button
          onClick={() => handleCategoryClick(node.id)}
          className={`sidebar-item ${isActive ? "active" : ""}`}
          style={{ paddingLeft: `${16 + depth * 16}px` }}
        >
          <span className="sidebar-icon">{node.icon}</span>
          <span>{node.name}</span>
        </button>

        {isExpanded && hasChildren && (
          <div className="sidebar-children">
            {node.children.map((child) => renderCategory(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Interview Buddy</h1>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>
        <nav className="sidebar-nav">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`sidebar-item ${activeItem === "all" ? "active" : ""}`}
          >
            <span className="sidebar-icon">📋</span>
            <span>All Questions</span>
          </button>

          {categories.length > 0 && <div className="sidebar-divider" />}

          {tree.map((node) => renderCategory(node, 0))}
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <style jsx>{`
        .sidebar {
          width: 260px;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: 50;
          overflow: hidden;
          transition: transform 0.3s ease;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sidebar-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sidebar-close {
          display: none;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          align-items: center;
          justify-content: center;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px;
          overflow-y: auto;
        }
        .sidebar-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin: 8px 0;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 14px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: left;
          margin-bottom: 2px;
        }
        .sidebar-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
        }
        .sidebar-item.active {
          background: rgba(59, 130, 246, 0.25);
          color: #60a5fa;
        }
        .sidebar-icon {
          width: 20px;
          text-align: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .sidebar-children {
          padding-left: 8px;
        }
        .sidebar-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-close {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 40;
          }
        }
      `}</style>
    </>
  );
}
