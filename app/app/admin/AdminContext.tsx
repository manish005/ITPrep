"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Category, Question, AnswerBlock, Media } from "./types";
import { getCategories, saveCategories, getQuestions, saveQuestions } from "../data/storage";

interface AdminContextType {
  categories: Category[];
  questions: Question[];
  media: Media[];
  addCategory: (cat: Omit<Category, "id" | "order">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (ids: string[]) => void;
  addQuestion: (q: Omit<Question, "id" | "createdAt" | "updatedAt" | "order">) => string;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => string | null;
  updateAnswer: (questionId: string, blocks: AnswerBlock[], status?: "draft" | "published") => void;
  getQuestion: (id: string) => Question | undefined;
  getCategory: (id: string) => Category | undefined;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(() => getCategories() as Category[]);
  const [questions, setQuestions] = useState<Question[]>(() => {
    const loaded = getQuestions() as Question[];
    return loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
  });
  const [media] = useState<Media[]>([]);

  const addCategory = useCallback((cat: Omit<Category, "id" | "order">) => {
    const newCat: Category = { ...cat, id: `cat-${Date.now()}`, order: categories.length + 1 };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
  }, [categories.length]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveCategories(updated);
      return updated;
    });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCategories(updated);
      return updated;
    });
  }, []);

  const reorderCategories = useCallback((ids: string[]) => {
    setCategories((prev) => {
      const map = new Map(prev.map((c) => [c.id, c]));
      const updated = ids.map((id, i) => ({ ...map.get(id)!, order: i + 1 }));
      saveCategories(updated);
      return updated;
    });
  }, []);

  const addQuestion = useCallback((q: Omit<Question, "id" | "createdAt" | "updatedAt" | "order">) => {
    const id = `q-${Date.now()}`;
    const now = new Date().toISOString().split("T")[0];
    const newQ: Question = { ...q, id, createdAt: now, updatedAt: now, order: questions.length + 1 };
    const updated = [...questions, newQ];
    setQuestions(updated);
    saveQuestions(updated);
    return id;
  }, [questions.length]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    const now = new Date().toISOString().split("T")[0];
    setQuestions((prev) => {
      const updated = prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: now } : q));
      saveQuestions(updated);
      return updated;
    });
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      saveQuestions(updated);
      return updated;
    });
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    const original = questions.find((q) => q.id === id);
    if (!original) return null;
    const newId = `q-${Date.now()}`;
    const now = new Date().toISOString().split("T")[0];
    const dup: Question = {
      ...original,
      id: newId,
      title: original.title + " (Copy)",
      slug: original.slug + "-copy",
      status: "draft",
      createdAt: now,
      updatedAt: now,
      order: questions.length + 1,
    };
    const updated = [...questions, dup];
    setQuestions(updated);
    saveQuestions(updated);
    return newId;
  }, [questions.length]);

  const updateAnswer = useCallback((questionId: string, blocks: AnswerBlock[], status?: "draft" | "published") => {
    const now = new Date().toISOString().split("T")[0];
    setQuestions((prev) => {
      const updated = prev.map((q) => {
        if (q.id !== questionId) return q;
        const answer = q.answer || { id: `a-${Date.now()}`, questionId, lastModified: now, blocks: [] };
        return {
          ...q,
          updatedAt: now,
          ...(status ? { status } : {}),
          answer: { ...answer, blocks, lastModified: now },
        };
      });
      saveQuestions(updated);
      return updated;
    });
  }, []);

  const getQuestion = useCallback((id: string) => questions.find((q) => q.id === id), [questions]);
  const getCategory = useCallback((id: string) => categories.find((c) => c.id === id), [categories]);

  return (
    <AdminContext.Provider value={{
      categories, questions, media,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      addQuestion, updateQuestion, deleteQuestion, duplicateQuestion,
      updateAnswer, getQuestion, getCategory,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
