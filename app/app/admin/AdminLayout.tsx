"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./AdminContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { categories, sidebarMenu } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const mainItems = sidebarMenu.filter((item) => item.section === "main" && item.visible).sort((a, b) => a.order - b.order);
  const toolItems = sidebarMenu.filter((item) => item.section === "tools" && item.visible).sort((a, b) => a.order - b.order);
  const footerItems = sidebarMenu.filter((item) => item.section === "footer" && item.visible).sort((a, b) => a.order - b.order);

  const renderNavItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.label);

    if (hasChildren) {
      return (
        <div key={item.id} className="nav-section">
          <button
            className={`nav-item parent ${isExpanded ? "expanded" : ""}`}
            onClick={() => toggleSection(item.label)}
          >
            <span className="nav-icon">{item.icon}</span>
            {sidebarOpen && (
              <span>{item.label}</span>
            )}
          </button>
          {sidebarOpen && isExpanded && (
            <div className="nav-children">
              {item.children
                .filter((c: any) => c.visible !== false)
                .sort((a: any, b: any) => a.order - b.order)
                .map((child: any) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className={`nav-item child ${pathname === child.href ? "active" : ""}`}
                  >
                    {child.icon && <span>{child.icon} </span>}
                    {child.label}
                  </Link>
                ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={`nav-item ${pathname === item.href ? "active" : ""}`}
      >
        <span className="nav-icon">{item.icon}</span>
        {sidebarOpen && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="logo">
            <span className="logo-icon">⚡</span>
            {sidebarOpen && <span className="logo-text">QA Admin</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav className="sidebar-nav">
          {mainItems.map(renderNavItem)}
          {toolItems.length > 0 && (
            <div className="nav-divider" />
          )}
          {toolItems.map(renderNavItem)}
        </nav>

        <div className="sidebar-footer">
          {footerItems.map(renderNavItem)}
        </div>
      </aside>

      <main className={`admin-main ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {pathname === "/admin" && "Dashboard"}
              {pathname === "/admin/categories" && "Categories"}
              {pathname === "/admin/categories/new" && "Add Category"}
              {pathname === "/admin/questions" && "Questions"}
              {(pathname === "/admin/questions/new" || pathname.match(/\/admin\/questions\/.*\/edit/)) && "Question Editor"}
              {pathname === "/admin/media" && "Media Library"}
              {pathname === "/admin/settings/menu" && "Menu Settings"}
            </h1>
          </div>
          <div className="header-right">
            <span className="admin-badge">Admin</span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>

      <style jsx global>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #f8fafc;
        }

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
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .sidebar.closed {
          width: 68px;
        }

        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: white;
        }

        .logo-icon {
          font-size: 22px;
          width: 32px;
          text-align: center;
        }

        .logo-text {
          font-size: 16px;
          font-weight: 700;
          white-space: nowrap;
        }

        .sidebar-toggle {
          width: 28px;
          height: 28px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .sidebar-toggle:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .sidebar-nav {
          flex: 1;
          padding: 8px;
          overflow-y: auto;
        }

        .nav-section {
          margin-bottom: 2px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          transition: all 0.15s ease;
          width: 100%;
          text-align: left;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.25);
          color: #60a5fa;
        }

        .nav-item.parent {
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .nav-icon {
          width: 22px;
          text-align: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .nav-children {
          padding-left: 16px;
        }

        .nav-item.child {
          font-size: 12px;
          padding: 7px 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .nav-item.child.active {
          color: #60a5fa;
        }

        .nav-divider {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          margin: 8px 0;
        }

        .sidebar-footer {
          padding: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-main {
          flex: 1;
          margin-left: 260px;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .admin-main.sidebar-closed {
          margin-left: 68px;
        }

        .admin-header {
          background: white;
          padding: 0 24px;
          height: 60px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .page-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .admin-badge {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .admin-content {
          flex: 1;
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
