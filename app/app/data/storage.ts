import { AnswerBlock } from "../admin/types";
import { markdownToBlocks } from "./markdownToBlocks";

// Import the original questions with markdown answers
import questionsJson from "../questions.json";

// ============================================
// STORAGE KEYS
// ============================================

const KEYS = {
  QUESTIONS: "qa_questions",
  CATEGORIES: "qa_categories",
  INITIALIZED: "qa_initialized",
};

// ============================================
// CATEGORIES
// ============================================

const defaultCategories = [
  { id: "cat-1", name: "Angular", slug: "angular", description: "Angular framework questions", icon: "🅰️", order: 1, status: "active" as const },
  { id: "cat-2", name: "RxJS", slug: "rxjs", description: "Reactive extensions", icon: "🔄", order: 2, status: "active" as const },
  { id: "cat-3", name: "TypeScript", slug: "typescript", description: "TypeScript language", icon: "📘", order: 3, status: "active" as const },
  { id: "cat-4", name: "NgRx", slug: "ngrx", description: "State management", icon: "📦", order: 4, status: "active" as const },
  { id: "cat-5", name: "Testing", slug: "testing", description: "Unit testing", icon: "🧪", order: 5, status: "active" as const },
];

// ============================================
// CONVERT JSON QUESTIONS TO STORAGE FORMAT
// ============================================

function convertJsonToStorage(): any[] {
  return questionsJson.map((q: any, index: number) => {
    const answerMarkdown = q.answer || "";
    const blocks = markdownToBlocks(answerMarkdown);

    return {
      id: `q-${q.id}`,
      title: q.question,
      slug: q.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      categoryId: "cat-1", // Default to Angular
      tags: extractTags(q.question),
      difficulty: "medium" as const,
      status: "published" as const,
      order: index + 1,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      answer: {
        id: `a-q-${q.id}`,
        questionId: `q-${q.id}`,
        lastModified: "2024-01-15",
        blocks,
      },
    };
  });
}

function extractTags(question: string): string[] {
  const tags: string[] = [];
  const lower = question.toLowerCase();

  if (lower.includes("angular")) tags.push("Angular");
  if (lower.includes("typescript")) tags.push("TypeScript");
  if (lower.includes("rxjs") || lower.includes("observable") || lower.includes("promise")) tags.push("RxJS");
  if (lower.includes("ngrx") || lower.includes("state")) tags.push("NgRx");
  if (lower.includes("test") || lower.includes("spec")) tags.push("Testing");
  if (lower.includes("component")) tags.push("Components");
  if (lower.includes("directive")) tags.push("Directives");
  if (lower.includes("pipe")) tags.push("Pipes");
  if (lower.includes("service")) tags.push("Services");
  if (lower.includes("module")) tags.push("Modules");

  return tags.length > 0 ? tags.slice(0, 3) : ["Angular"];
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

function isClient(): boolean {
  return typeof window !== "undefined";
}

function initializeStorage(): void {
  if (!isClient()) return;

  const initialized = localStorage.getItem(KEYS.INITIALIZED);
  if (!initialized) {
    const convertedQuestions = convertJsonToStorage();
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(defaultCategories));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(convertedQuestions));
    localStorage.setItem(KEYS.INITIALIZED, "true");
  }
}

export function getCategories(): any[] {
  if (!isClient()) return defaultCategories;

  initializeStorage();
  const data = localStorage.getItem(KEYS.CATEGORIES);
  return data ? JSON.parse(data) : defaultCategories;
}

export function saveCategories(categories: any[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getQuestions(): any[] {
  if (!isClient()) return [];

  initializeStorage();
  const data = localStorage.getItem(KEYS.QUESTIONS);
  return data ? JSON.parse(data) : [];
}

export function saveQuestions(questions: any[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
}

export function getQuestionById(id: string): any {
  return getQuestions().find((q) => q.id === id);
}

export function getCategoryById(id: string): any {
  return getCategories().find((c) => c.id === id);
}

export function resetStorage(): void {
  if (!isClient()) return;
  localStorage.removeItem(KEYS.CATEGORIES);
  localStorage.removeItem(KEYS.QUESTIONS);
  localStorage.removeItem(KEYS.INITIALIZED);
}
