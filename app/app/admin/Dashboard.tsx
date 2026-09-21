"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "./AdminContext";

export default function Dashboard() {
  const { categories, questions } = useAdmin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = {
    totalCategories: categories.length,
    totalQuestions: questions.length,
    published: questions.filter((q) => q.status === "published").length,
    draft: questions.filter((q) => q.status === "draft").length,
    withAnswers: questions.filter((q) => q.answer && q.answer.blocks.length > 0).length,
  };

  const recentQuestions = [...questions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const getCategoryName = (catId: string) => categories.find((c) => c.id === catId)?.name || "Unknown";

  if (!mounted) {
    return (
      <div className="dashboard">
        <div className="stats-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="stat-card" style={{ borderLeft: "4px solid #e2e8f0" }}>
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-value">-</span>
                <span className="stat-label">Loading...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalCategories}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">❓</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalQuestions}</span>
            <span className="stat-label">Total Questions</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.published}</span>
            <span className="stat-label">Published</span>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <span className="stat-value">{stats.draft}</span>
            <span className="stat-label">Drafts</span>
          </div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">💡</div>
          <div className="stat-info">
            <span className="stat-value">{stats.withAnswers}</span>
            <span className="stat-label">With Answers</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/admin/questions/new" className="action-card">
          <span className="action-icon">➕</span>
          <span>New Question</span>
        </Link>
        <Link href="/admin/categories/new" className="action-card">
          <span className="action-icon">📁</span>
          <span>New Category</span>
        </Link>
        <Link href="/admin/questions" className="action-card">
          <span className="action-icon">📋</span>
          <span>All Questions</span>
        </Link>
        <Link href="/admin/categories" className="action-card">
          <span className="action-icon">📂</span>
          <span>Manage Categories</span>
        </Link>
      </div>

      {/* Recent Questions */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Questions</h2>
          <Link href="/admin/questions" className="view-all">View All →</Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentQuestions.map((q) => (
                <tr key={q.id}>
                  <td className="question-cell">
                    <div className="question-title">{q.title}</div>
                  </td>
                  <td>
                    <span className="badge category">{getCategoryName(q.categoryId)}</span>
                  </td>
                  <td>
                    <span className={`badge ${q.status}`}>{q.status}</span>
                  </td>
                  <td className="date-cell">{q.updatedAt}</td>
                  <td>
                    <div className="actions">
                      <Link href={`/admin/questions/${q.id}/edit`} className="action-link">Edit</Link>
                      <Link href={`/admin/questions/${q.id}/preview`} className="action-link">Preview</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .stat-card.blue { border-left: 4px solid #3b82f6; }
        .stat-card.purple { border-left: 4px solid #8b5cf6; }
        .stat-card.green { border-left: 4px solid #22c55e; }
        .stat-card.amber { border-left: 4px solid #f59e0b; }
        .stat-card.cyan { border-left: 4px solid #06b6d4; }

        .stat-icon {
          width: 44px;
          height: 44px;
          background: #f8fafc;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .action-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #475569;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
        }

        .action-card:hover {
          background: #f1f5f9;
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-icon {
          font-size: 20px;
        }

        .recent-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }

        .section-header {
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .view-all {
          font-size: 13px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .view-all:hover {
          text-decoration: underline;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f8fafc;
          padding: 10px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table td {
          padding: 12px 16px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }

        .question-title {
          color: #0f172a;
          font-weight: 500;
        }

        .badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .badge.category {
          background: #e0e7ff;
          color: #3730a3;
        }

        .badge.published {
          background: #dcfce7;
          color: #166534;
        }

        .badge.draft {
          background: #fef3c7;
          color: #92400e;
        }

        .date-cell {
          color: #64748b;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .action-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        .action-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
