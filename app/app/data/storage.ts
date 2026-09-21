import { AnswerBlock } from "../admin/types";
import { markdownToBlocks } from "./markdownToBlocks";

// Import seed data
import questionsJson from "../questions.json";
import microserviceQuestions from "./microservice-questions.json";

// ============================================
// STORAGE KEYS
// ============================================

const KEYS = {
  QUESTIONS: "qa_questions",
  CATEGORIES: "qa_categories",
  INITIALIZED: "qa_initialized",
  SIDEBAR_MENU: "qa_sidebar_menu",
  VERSION: "qa_version",
  SEED_VERSION: "qa_seed_version",
};

const CURRENT_VERSION = "1.0.7";
const SEED_VERSION = "2"; // Bump this to re-seed questions

// ============================================
// CATEGORIES
// ============================================

const seedCategories = [
  { id: "cat-1", name: "Angular", slug: "angular", description: "Angular framework questions", icon: "🅰️", order: 1, status: "active" as const, parentId: undefined },
  { id: "cat-2", name: "RxJS", slug: "rxjs", description: "Reactive extensions", icon: "🔄", order: 2, status: "active" as const, parentId: "cat-1" },
  { id: "cat-3", name: "TypeScript", slug: "typescript", description: "TypeScript language", icon: "📘", order: 3, status: "active" as const, parentId: "cat-1" },
  { id: "cat-4", name: "NgRx", slug: "ngrx", description: "State management", icon: "📦", order: 4, status: "active" as const, parentId: "cat-1" },
  { id: "cat-5", name: "Testing", slug: "testing", description: "Unit testing", icon: "🧪", order: 5, status: "active" as const, parentId: "cat-1" },
  { id: "cat-6", name: "Microservices", slug: "microservices", description: "Microservices architecture", icon: "🔧", order: 6, status: "active" as const, parentId: undefined },
];

// ============================================
// SEED QUESTIONS
// ============================================

function convertAngularQuestions(): any[] {
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
      categoryId: "cat-1",
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

function convertMicroserviceQuestions(): any[] {
  return (microserviceQuestions as any[]).map((q: any, index: number) => {
    const answerMarkdown = q.answer || "";
    const blocks = markdownToBlocks(answerMarkdown);

    return {
      id: `ms-${q.id}`,
      title: q.question,
      slug: q.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      categoryId: "cat-6",
      tags: extractTags(q.question),
      difficulty: "medium" as const,
      status: "published" as const,
      order: index + 1,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      answer: {
        id: `a-ms-${q.id}`,
        questionId: `ms-${q.id}`,
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
  if (lower.includes("microservice")) tags.push("Microservices");
  if (lower.includes("distributed")) tags.push("Distributed");
  if (lower.includes("container") || lower.includes("kubernetes")) tags.push("DevOps");

  return tags.length > 0 ? tags.slice(0, 3) : ["Angular"];
}

// ============================================
// MERGE HELPERS
// ============================================

function mergeCategories(existing: any[], seed: any[]): any[] {
  const existingMap = new Map(existing.map((c) => [c.id, c]));
  const merged: any[] = [];

  // Add all seed categories (preserving existing customizations)
  for (const seedCat of seed) {
    const existingCat = existingMap.get(seedCat.id);
    if (existingCat) {
      // Keep user's customizations but update defaults
      merged.push({
        ...seedCat,
        ...existingCat,
        name: existingCat.name || seedCat.name,
        description: existingCat.description || seedCat.description,
        icon: existingCat.icon || seedCat.icon,
      });
      existingMap.delete(seedCat.id);
    } else {
      merged.push(seedCat);
    }
  }

  // Add any user-created categories that aren't in seed
  for (const remaining of existingMap.values()) {
    merged.push(remaining);
  }

  // Re-sort by order
  merged.sort((a, b) => (a.order || 0) - (b.order || 0));

  return merged;
}

function mergeQuestions(existing: any[], seed: any[]): any[] {
  const existingMap = new Map(existing.map((q) => [q.id, q]));
  const merged: any[] = [];

  // Add all seed questions (preserving existing customizations)
  for (const seedQ of seed) {
    const existingQ = existingMap.get(seedQ.id);
    if (existingQ) {
      // Keep user's answer but update metadata
      merged.push({
        ...seedQ,
        ...existingQ,
        title: existingQ.title || seedQ.title,
      });
      existingMap.delete(seedQ.id);
    } else {
      merged.push(seedQ);
    }
  }

  // Add any user-created questions that aren't in seed
  for (const remaining of existingMap.values()) {
    merged.push(remaining);
  }

  return merged;
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
  const version = localStorage.getItem(KEYS.VERSION);
  const seedVersion = localStorage.getItem(KEYS.SEED_VERSION);

  // First time initialization
  if (!initialized) {
    const allQuestions = [...convertAngularQuestions(), ...convertMicroserviceQuestions()];
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(seedCategories));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(allQuestions));
    localStorage.setItem(KEYS.INITIALIZED, "true");
    localStorage.setItem(KEYS.VERSION, CURRENT_VERSION);
    localStorage.setItem(KEYS.SEED_VERSION, SEED_VERSION);
    return;
  }

  // Version change: merge instead of replace
  if (version !== CURRENT_VERSION) {
    const existingCategories = getCategoriesFromStorage();
    const existingQuestions = getQuestionsFromStorage();

    const mergedCategories = mergeCategories(existingCategories, seedCategories);
    const mergedQuestions = mergeQuestions(existingQuestions, [...convertAngularQuestions(), ...convertMicroserviceQuestions()]);

    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(mergedCategories));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(mergedQuestions));
    localStorage.setItem(KEYS.VERSION, CURRENT_VERSION);
  }

  // Seed version change: add new seed questions
  if (seedVersion !== SEED_VERSION) {
    const existingQuestions = getQuestionsFromStorage();
    const allSeedQuestions = [...convertAngularQuestions(), ...convertMicroserviceQuestions()];
    const mergedQuestions = mergeQuestions(existingQuestions, allSeedQuestions);

    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(mergedQuestions));
    localStorage.setItem(KEYS.SEED_VERSION, SEED_VERSION);
  }
}

function getCategoriesFromStorage(): any[] {
  if (!isClient()) return seedCategories;
  const data = localStorage.getItem(KEYS.CATEGORIES);
  return data ? JSON.parse(data) : seedCategories;
}

function getQuestionsFromStorage(): any[] {
  if (!isClient()) return [];
  const data = localStorage.getItem(KEYS.QUESTIONS);
  return data ? JSON.parse(data) : [];
}

export function getCategories(): any[] {
  if (!isClient()) return seedCategories;

  initializeStorage();
  const data = localStorage.getItem(KEYS.CATEGORIES);
  return data ? JSON.parse(data) : seedCategories;
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
  localStorage.removeItem(KEYS.SIDEBAR_MENU);
  localStorage.removeItem(KEYS.SEED_VERSION);
}

// ============================================
// SIDEBAR MENU
// ============================================

const defaultSidebarMenu = [
  { id: "sm-1", label: "Dashboard", icon: "📊", href: "/admin", order: 1, visible: true, section: "main" },
  { id: "sm-2", label: "Categories", icon: "📁", href: "/admin/categories", order: 2, visible: true, section: "main", children: [
    { id: "sm-2a", label: "All Categories", icon: "", href: "/admin/categories", order: 1, visible: true },
    { id: "sm-2b", label: "+ Add Category", icon: "", href: "/admin/categories/new", order: 2, visible: true },
  ]},
  { id: "sm-3", label: "Questions", icon: "❓", href: "/admin/questions", order: 3, visible: true, section: "main", children: [
    { id: "sm-3a", label: "All Questions", icon: "", href: "/admin/questions", order: 1, visible: true },
    { id: "sm-3b", label: "+ Add Question", icon: "", href: "/admin/questions/new", order: 2, visible: true },
  ]},
  { id: "sm-4", label: "Media Library", icon: "🖼️", href: "/admin/media", order: 4, visible: true, section: "main" },
  { id: "sm-5", label: "Menu Settings", icon: "⚙️", href: "/admin/settings/menu", order: 5, visible: true, section: "tools" },
  { id: "sm-6", label: "View Website", icon: "🌐", href: "/", order: 6, visible: true, section: "footer" },
];

export function getSidebarMenu(): any[] {
  if (!isClient()) return defaultSidebarMenu;
  const data = localStorage.getItem(KEYS.SIDEBAR_MENU);
  return data ? JSON.parse(data) : defaultSidebarMenu;
}

export function saveSidebarMenu(items: any[]): void {
  if (!isClient()) return;
  localStorage.setItem(KEYS.SIDEBAR_MENU, JSON.stringify(items));
}
