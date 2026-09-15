// ============================================
// BLOCK TYPES - Core building blocks for answers
// ============================================

export type BlockType =
  | "paragraph"
  | "heading"
  | "bullet-list"
  | "numbered-list"
  | "table"
  | "image"
  | "code"
  | "quote"
  | "note"
  | "divider"
  | "spacer";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  content: string;
  alignment?: "left" | "center" | "right";
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ListItem {
  id: string;
  title: string;
  description: string;
  code?: string;
  codeLanguage?: string;
  subItems?: ListItem[];
}

export interface ListBlock extends BaseBlock {
  type: "bullet-list" | "numbered-list";
  items: ListItem[];
}

export interface TableCell {
  id: string;
  content: string;
}

export interface TableRow {
  id: string;
  cells: TableCell[];
}

export interface TableBlock extends BaseBlock {
  type: "table";
  columns: string[];
  rows: TableRow[];
  headerEnabled: boolean;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  imageId?: string;
  imageUrl?: string;
  alt: string;
  caption?: string;
  alignment: "left" | "center" | "right";
  width: string;
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  language: string;
  code: string;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  author?: string;
}

export interface NoteBlock extends BaseBlock {
  type: "note";
  content: string;
  noteType: "info" | "warning" | "tip" | "important";
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  height: number;
}

export type AnswerBlock =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | TableBlock
  | ImageBlock
  | CodeBlock
  | QuoteBlock
  | NoteBlock
  | DividerBlock
  | SpacerBlock;

// ============================================
// ANSWER MODEL
// ============================================

export interface Answer {
  id: string;
  questionId: string;
  blocks: AnswerBlock[];
  lastModified: string;
}

// ============================================
// QUESTION MODEL
// ============================================

export type QuestionStatus = "draft" | "published" | "archived";
export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  tags: string[];
  difficulty: Difficulty;
  status: QuestionStatus;
  answer?: Answer;
  createdAt: string;
  updatedAt: string;
  order: number;
}

// ============================================
// CATEGORY MODEL
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  status: "active" | "inactive";
  parentId?: string;
}

// ============================================
// MEDIA MODEL
// ============================================

export interface Media {
  id: string;
  name: string;
  url: string;
  type: "image";
  size: number;
  alt?: string;
  createdAt: string;
}

// ============================================
// ADMIN STATE
// ============================================

export interface AdminState {
  categories: Category[];
  questions: Question[];
  media: Media[];
  currentQuestionId: string | null;
  currentCategoryId: string | null;
  selectedBlockId: string | null;
  undoStack: AnswerBlock[][];
  redoStack: AnswerBlock[][];
}
