"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminProvider, useAdmin } from "../../AdminContext";
import AdminLayout from "../../AdminLayout";
import AnswerBuilder from "../../AnswerBuilder";
import { AnswerBlock } from "../../types";

function QuestionEditor() {
  const params = useParams();
  const router = useRouter();
  const { getQuestion, getCategory, categories, addQuestion, updateAnswer } = useAdmin();

  const isNew = params.id === "new";
  const existing = !isNew ? getQuestion(String(params.id)) : null;

  const [mounted, setMounted] = useState(false);
  const [question, setQuestion] = useState({
    title: existing?.title || "",
    slug: existing?.slug || "",
    categoryId: existing?.categoryId || (categories[0]?.id || ""),
    tags: existing?.tags?.join(", ") || "",
    difficulty: (existing?.difficulty || "medium") as "easy" | "medium" | "hard",
    status: (existing?.status || "draft") as "draft" | "published" | "archived",
  });

  const [blocks, setBlocks] = useState<AnswerBlock[]>(existing?.answer?.blocks || []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (existing) {
      setQuestion({
        title: existing.title,
        slug: existing.slug,
        categoryId: existing.categoryId,
        tags: existing.tags.join(", "),
        difficulty: existing.difficulty,
        status: existing.status,
      });
      setBlocks(existing.answer?.blocks || []);
    }
  }, [existing]);

  if (!mounted) {
    return (
      <AdminLayout>
        <div className="loading-state">
          <p>Loading...</p>
          <style jsx>{`
            .loading-state { text-align: center; padding: 60px; color: #64748b; }
          `}</style>
        </div>
      </AdminLayout>
    );
  }

  const handleSave = (savedBlocks: AnswerBlock[]) => {
    setBlocks(savedBlocks);
  };

  const handleSaveQuestion = (status?: "draft" | "published") => {
    if (!question.title.trim()) {
      alert("Please enter a question title");
      return;
    }

    const saveStatus = (status || question.status) as "draft" | "published";

    const qData = {
      title: question.title,
      slug: question.slug || question.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      categoryId: question.categoryId,
      tags: question.tags.split(",").map((t) => t.trim()).filter(Boolean),
      difficulty: question.difficulty,
      status: saveStatus,
    };

    if (isNew) {
      const id = addQuestion(qData);
      updateAnswer(id, blocks, saveStatus);
      setTimeout(() => router.push(`/admin/questions/${id}/edit`), 200);
    } else if (existing) {
      updateAnswer(existing.id, blocks, saveStatus);
      setTimeout(() => router.push("/admin/questions"), 200);
    }
  };

  return (
    <div className="editor-page">
      <div className="details-card">
        <h2 className="card-title">Question Details</h2>
        <div className="form-grid">
          <div className="form-group full">
            <label>Question Title</label>
            <input
              type="text"
              value={question.title}
              onChange={(e) => setQuestion({ ...question, title: e.target.value })}
              placeholder="What is the difference between...?"
            />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input
              type="text"
              value={question.slug}
              onChange={(e) => setQuestion({ ...question, slug: e.target.value })}
              placeholder="auto-generated-from-title"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={question.categoryId} onChange={(e) => setQuestion({ ...question, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              value={question.tags}
              onChange={(e) => setQuestion({ ...question, tags: e.target.value })}
              placeholder="Angular, TypeScript, Framework"
            />
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={question.difficulty} onChange={(e) => setQuestion({ ...question, difficulty: e.target.value as any })}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={question.status} onChange={(e) => setQuestion({ ...question, status: e.target.value as any })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="builder-card">
        <AnswerBuilder
          questionId={existing?.id || "new"}
          questionTitle={question.title || "New Question"}
          initialBlocks={blocks}
          onSave={handleSave}
        />
      </div>

      <div className="bottom-bar">
        <Link href="/admin/questions" className="btn-cancel">← Back to Questions</Link>
        <div className="btn-group">
          <button className="btn-outline" onClick={() => handleSaveQuestion("draft")}>
            💾 Save Draft
          </button>
          <button className="btn-primary" onClick={() => handleSaveQuestion("published")}>
            🚀 Save & Publish
          </button>
        </div>
      </div>

      <style jsx>{`
        .editor-page { max-width: 100%; }
        .details-card {
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
        .builder-card {
          border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; margin-bottom: 20px;
        }
        .bottom-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 0;
        }
        .btn-cancel {
          color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500;
        }
        .btn-cancel:hover { color: #0f172a; }
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
      `}</style>
    </div>
  );
}

export default function QuestionEditorPage() {
  return (
    <AdminProvider>
      <AdminLayout>
        <QuestionEditor />
      </AdminLayout>
    </AdminProvider>
  );
}
