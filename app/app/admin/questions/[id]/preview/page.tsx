"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminProvider, useAdmin } from "../../../AdminContext";
import AdminLayout from "../../../AdminLayout";
import AnswerRenderer from "../../../AnswerRenderer";

function QuestionPreview() {
  const params = useParams();
  const { getQuestion, getCategory } = useAdmin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const question = getQuestion(String(params.id));

  if (!mounted) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
        Loading preview...
      </div>
    );
  }

  if (!question) {
    return (
      <div className="not-found">
        <h2>Question not found</h2>
        <Link href="/admin/questions">← Back to Questions</Link>
      </div>
    );
  }

  const category = getCategory(question.categoryId);
  const blocks = question.answer?.blocks || [];

  return (
    <div className="preview-page">
      <div className="preview-header">
        <Link href="/admin/questions" className="back-link">← Back to Questions</Link>
        <Link href={`/admin/questions/${question.id}/edit`} className="edit-btn">Edit Question</Link>
      </div>

      <div className="preview-card">
        <div className="question-meta">
          <span className="badge category">{category?.name || "Unknown"}</span>
          <span className={`badge difficulty ${question.difficulty}`}>{question.difficulty}</span>
          <span className={`badge status ${question.status}`}>{question.status}</span>
        </div>

        <h1 className="question-title">{question.title}</h1>

        {question.tags.length > 0 && (
          <div className="tags">
            {question.tags.map((t: string) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        <div className="answer-section">
          <h2 className="answer-label">Answer</h2>
          {blocks.length > 0 ? (
            <AnswerRenderer blocks={blocks} />
          ) : (
            <div className="no-answer">No answer content yet. Click Edit to add an answer.</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .preview-page { max-width: 800px; }
        .preview-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .back-link { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500; }
        .back-link:hover { color: #0f172a; }
        .edit-btn {
          padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none;
          border-radius: 8px; font-size: 13px; font-weight: 500;
        }
        .edit-btn:hover { background: #2563eb; }
        .preview-card {
          background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 32px;
        }
        .question-meta { display: flex; gap: 8px; margin-bottom: 16px; }
        .badge {
          padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
        }
        .badge.category { background: #e0e7ff; color: #3730a3; }
        .badge.difficulty { text-transform: capitalize; }
        .badge.difficulty.easy { background: #dcfce7; color: #166534; }
        .badge.difficulty.medium { background: #fef3c7; color: #92400e; }
        .badge.difficulty.hard { background: #fee2e2; color: #991b1b; }
        .badge.status { text-transform: capitalize; }
        .badge.status.published { background: #dcfce7; color: #166534; }
        .badge.status.draft { background: #fef3c7; color: #92400e; }
        .question-title {
          font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;
          line-height: 1.4;
        }
        .tags { display: flex; gap: 6px; margin-bottom: 24px; }
        .tag {
          background: #f1f5f9; color: #64748b; padding: 4px 10px; border-radius: 6px; font-size: 12px;
        }
        .answer-section {
          border-top: 1px solid #e2e8f0; padding-top: 20px;
        }
        .answer-label {
          font-size: 14px; font-weight: 600; color: #64748b; margin: 0 0 16px 0;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .no-answer {
          padding: 40px; background: #f8fafc; border-radius: 10px; text-align: center;
          color: #94a3b8; font-style: italic;
        }
        .not-found {
          text-align: center; padding: 60px;
        }
        .not-found h2 { color: #64748b; }
      `}</style>
    </div>
  );
}

export default function QuestionPreviewPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <QuestionPreview />
      </AdminLayout>
    </AdminProvider>
  );
}
