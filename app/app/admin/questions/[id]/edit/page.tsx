"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminProvider, useAdmin } from "../../../AdminContext";
import AdminLayout from "../../../AdminLayout";
import AnswerBuilder from "../../../AnswerBuilder";
import { AnswerBlock } from "../../../types";
import Toast from "../../../../components/Toast";

function QuestionEditor() {
  const params = useParams();
  const router = useRouter();
  const { getQuestion, getCategory, categories, updateAnswer } = useAdmin();

  const questionId = String(params.id);
  const question = getQuestion(questionId);

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    categoryId: "",
    tags: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    status: "draft" as "draft" | "published" | "archived",
  });

  const [blocks, setBlocks] = useState<AnswerBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (question) {
      setForm({
        title: question.title,
        slug: question.slug,
        categoryId: question.categoryId,
        tags: question.tags.join(", "),
        difficulty: question.difficulty,
        status: question.status,
      });
      setBlocks(question.answer?.blocks || []);
    }
  }, [question]);

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="loading-state">
          <p>Loading...</p>
      <Toast
        message={toastMessage}
        type="success"
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />

      <style jsx>{`
            .loading-state { text-align: center; padding: 60px; color: #64748b; }
          `}</style>
        </div>
      </AdminLayout>
    );
  }

  if (!question) {
    return (
      <AdminLayout>
        <div className="not-found">
          <h2>Question not found</h2>
          <Link href="/admin/questions" className="back-link">← Back to Questions</Link>
        </div>
        <style jsx>{`
          .not-found { text-align: center; padding: 60px; }
          .not-found h2 { color: #64748b; margin-bottom: 16px; }
          .back-link { color: #3b82f6; text-decoration: none; }
        `}</style>
      </AdminLayout>
    );
  }

  const handleSaveBlocks = (savedBlocks: AnswerBlock[]) => {
    setBlocks(savedBlocks);
  };

  const handleSave = async (status?: "draft" | "published") => {
    if (!form.title.trim()) {
      alert("Please enter a question title");
      return;
    }

    setSaving(true);

    const saveStatus = (status || form.status) as "draft" | "published";

    updateAnswer(questionId, blocks, saveStatus);

    setToastMessage("Question saved successfully!");
    setToastVisible(true);

    setTimeout(() => {
      router.push("/admin/questions");
    }, 1500);
  };

  return (
    <div className="editor-page">
      <div className="page-header">
        <Link href="/admin/questions" className="back-link">← Back to Questions</Link>
        <div className="header-actions">
          <Link href={`/admin/questions/${questionId}/preview`} className="btn-preview">👁 Preview</Link>
        </div>
      </div>

      {/* Question Details */}
      <div className="card">
        <h2 className="card-title">Question Details</h2>
        <div className="form-grid">
          <div className="form-group full">
            <label>Question Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What is the difference between...?"
            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Angular, TypeScript"
            />
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Answer Builder */}
      <div className="card builder-card">
        <AnswerBuilder
          questionId={questionId}
          questionTitle={form.title}
          categoryId={form.categoryId}
          initialBlocks={blocks}
          onSave={handleSaveBlocks}
        />
      </div>

      {/* Bottom Actions */}
      <div className="bottom-bar">
        <div></div>
        <div className="btn-group">
          <button
            className="btn-outline"
            onClick={() => handleSave("draft")}
            disabled={saving}
          >
            {saving ? "Saving..." : "💾 Save Draft"}
          </button>
          <button
            className="btn-primary"
            onClick={() => handleSave("published")}
            disabled={saving}
          >
            {saving ? "Saving..." : "🚀 Save & Publish"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .editor-page { max-width: 100%; }
        .page-header {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
        }
        .back-link { color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500; }
        .back-link:hover { color: #0f172a; }
        .btn-preview {
          padding: 8px 16px; background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569;
          border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;
        }
        .btn-preview:hover { background: #e2e8f0; }
        .card {
          background: white; border: 1px solid #e2e8f0; border-radius: 14px;
          padding: 20px; margin-bottom: 20px;
        }
        .card-title {
          font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0;
        }
        .form-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .form-group { display: flex; flex-direction: column; gap: 5px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label { font-size: 12px; font-weight: 500; color: #475569; }
        .form-group input, .form-group select {
          padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px;
        }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #3b82f6; }
        .builder-card { overflow: hidden; padding: 0; }
        .bottom-bar {
          display: flex; justify-content: space-between; align-items: center; padding: 16px 0;
        }
        .btn-group { display: flex; gap: 10px; }
        .btn-outline {
          padding: 10px 20px; background: white; border: 1px solid #e2e8f0;
          border-radius: 8px; font-size: 14px; cursor: pointer; color: #475569; font-weight: 500;
        }
        .btn-outline:hover { background: #f8fafc; }
        .btn-primary {
          padding: 10px 24px; background: #3b82f6; border: none; color: white;
          border-radius: 8px; font-size: 14px; cursor: pointer; font-weight: 500;
        }
        .btn-primary:hover { background: #2563eb; }
        .not-found { text-align: center; padding: 60px; }
        .not-found h2 { color: #64748b; margin-bottom: 16px; }
      `}</style>
    </div>
  );
}

export default function EditQuestionPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <QuestionEditor />
      </AdminLayout>
    </AdminProvider>
  );
}
