"use client";

import {
  AnswerBlock,
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  TableBlock,
  ImageBlock,
  CodeBlock,
  QuoteBlock,
  NoteBlock,
  DividerBlock,
  SpacerBlock,
} from "./types";
import { highlightCode } from "./syntaxHighlight";

interface AnswerRendererProps {
  blocks: AnswerBlock[];
}

const TOKEN_COLORS: Record<string, string> = {
  keyword: "#c586c0",
  decorator: "#ce9178",
  string: "#6a9955",
  property: "#9cdcfe",
  classname: "#fd971f",
  type: "#4ec9b0",
  number: "#b5cea8",
  comment: "#6a9955",
  plain: "#d4d4d4",
};

export default function AnswerRenderer({ blocks }: AnswerRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontStyle: "italic" }}>
        No answer content yet.
      </div>
    );
  }

  return (
    <div style={{ lineHeight: 1.8, color: "#334155" }}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: AnswerBlock }) {
  switch (block.type) {
    case "paragraph":
      return <ParagraphRenderer block={block} />;
    case "heading":
      return <HeadingRenderer block={block} />;
    case "bullet-list":
    case "numbered-list":
      return <ListRenderer block={block} />;
    case "table":
      return <TableRenderer block={block} />;
    case "image":
      return <ImageRenderer block={block} />;
    case "code":
      return <CodeRenderer block={block} />;
    case "quote":
      return <QuoteRenderer block={block} />;
    case "note":
      return <NoteRenderer block={block} />;
    case "divider":
      return <DividerRenderer />;
    case "spacer":
      return <SpacerRenderer block={block} />;
    default:
      return null;
  }
}

function ParagraphRenderer({ block }: { block: ParagraphBlock }) {
  return <p style={{ margin: "12px 0", lineHeight: 1.8 }}>{block.content || "Empty paragraph"}</p>;
}

function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const headingContent = block.text || "Empty heading";
  const base: React.CSSProperties = {
    color: "#0f172a",
    fontWeight: 700,
    lineHeight: 1.3,
  };
  const sizes: Record<number, React.CSSProperties> = {
    1: { fontSize: 28, margin: "24px 0 12px" },
    2: { fontSize: 22, margin: "20px 0 10px" },
    3: { fontSize: 18, margin: "24px 0 12px", paddingBottom: 8, borderBottom: "2px solid #e2e8f0", fontWeight: 600 },
    4: { fontSize: 16, margin: "14px 0 6px", fontWeight: 600 },
  };
  const style = { ...base, ...sizes[block.level] };
  if (block.level === 1) return <h1 style={style}>{headingContent}</h1>;
  if (block.level === 2) return <h2 style={style}>{headingContent}</h2>;
  if (block.level === 3) return <h3 style={style}>{headingContent}</h3>;
  return <h4 style={style}>{headingContent}</h4>;
}

function ListRenderer({ block }: { block: ListBlock }) {
  const isNumbered = block.type === "numbered-list";

  const liStyle: React.CSSProperties = {
    marginBottom: 10,
    lineHeight: 1.7,
  };

  const renderItem = (item: any, index?: number) => (
    <li key={item.id} style={liStyle}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {item.title && <strong style={{ color: "#0f172a" }}>{item.title}</strong>}
        {item.title && item.description && ": "}
        {item.description && <span>{item.description}</span>}
        {item.code && (
          <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden", border: "1px solid #334155", background: "#252526" }}>
            {item.codeLanguage && (
              <div style={{ background: "#2d2d2d", color: "#94a3b8", padding: "6px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #404040", fontFamily: '"Fira Code", "Consolas", monospace' }}>
                {item.codeLanguage}
              </div>
            )}
            <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 20, margin: 0, fontFamily: '"Fira Code", "Consolas", monospace', fontSize: 13, overflowX: "auto", lineHeight: 1.7 }}>
              <code style={{ whiteSpace: "pre" }}>{item.code}</code>
            </pre>
          </div>
        )}
      </div>
      {item.subItems && item.subItems.length > 0 && (
        <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20, borderLeft: "2px solid #e2e8f0", listStyleType: "disc" }}>
          {item.subItems.map((sub: any, subIndex: number) => (
            <li key={sub.id} style={{ marginBottom: 6, fontSize: "0.95em" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sub.title && <strong style={{ color: "#0f172a" }}>{sub.title}</strong>}
                {sub.title && sub.description && ": "}
                {sub.description && <span>{sub.description}</span>}
                {sub.code && (
                  <div style={{ marginTop: 8, borderRadius: 10, overflow: "hidden", border: "1px solid #334155", background: "#252526" }}>
                    {sub.codeLanguage && (
                      <div style={{ background: "#2d2d2d", color: "#94a3b8", padding: "4px 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, borderBottom: "1px solid #404040" }}>
                        {sub.codeLanguage}
                      </div>
                    )}
                    <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, margin: 0, fontFamily: '"Fira Code", "Consolas", monospace', fontSize: 12, overflowX: "auto", lineHeight: 1.6 }}>
                      <code style={{ whiteSpace: "pre" }}>{sub.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  const listStyle: React.CSSProperties = {
    margin: "12px 0",
    paddingLeft: 28,
    listStyleType: isNumbered ? "decimal" : "disc",
  };

  if (isNumbered) {
    return <ol style={listStyle}>{block.items.map((item, index) => renderItem(item, index))}</ol>;
  }
  return <ul style={listStyle}>{block.items.map((item, index) => renderItem(item, index))}</ul>;
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0", borderRadius: 12, border: "1px solid #e2e8f0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        {block.headerEnabled && (
          <thead>
            <tr>
              {block.columns.map((col, i) => (
                <th key={`th-${i}`} style={{ background: "#1e40af", color: "white", padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`tr-${rowIndex}-${row.id}`}>
              {row.cells.map((cell, cellIndex) => (
                <td key={`td-${rowIndex}-${cellIndex}-${cell.id}`} style={{ padding: "10px 16px", borderBottom: "1px solid #e2e8f0", lineHeight: 1.5 }}>
                  {cell.content}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImageRenderer({ block }: { block: ImageBlock }) {
  if (!block.imageUrl) {
    return (
      <div style={{ padding: 40, background: "#f1f5f9", border: "2px dashed #cbd5e1", borderRadius: 8, textAlign: "center", color: "#94a3b8", margin: 16 }}>
        No image selected
      </div>
    );
  }

  return (
    <figure style={{ margin: "20px 0", textAlign: block.alignment === "left" ? "left" : block.alignment === "right" ? "right" : "center" }}>
      <img src={block.imageUrl} alt={block.alt} style={{ maxWidth: block.width || "100%", height: "auto", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} />
      {block.caption && (
        <figcaption style={{ marginTop: 8, fontSize: 13, color: "#64748b", fontStyle: "italic" }}>{block.caption}</figcaption>
      )}
    </figure>
  );
}

function CodeRenderer({ block }: { block: CodeBlock }) {
  const tokens = block.language === "typescript" || block.language === "ts" || block.language === "angular"
    ? highlightCode(block.code || "", block.language)
    : [{ text: block.code || "No code", className: "plain" }];

  return (
    <div style={{ margin: "16px 0", borderRadius: 12, overflow: "hidden", border: "1px solid #334155", background: "#252526" }}>
      {block.language && (
        <div style={{ background: "#2d2d2d", color: "#94a3b8", padding: "6px 16px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #404040", fontFamily: '"Fira Code", "Consolas", monospace' }}>
          {block.language}
        </div>
      )}
      <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 20, margin: 0, fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace', fontSize: 13, overflowX: "auto", lineHeight: 1.7 }}>
        <code>
          {tokens.map((token: { text: string; className: string }, i: number) => (
            <span key={i} style={{ color: TOKEN_COLORS[token.className] || "#d4d4d4", fontStyle: token.className === "comment" ? "italic" : undefined }}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function QuoteRenderer({ block }: { block: QuoteBlock }) {
  return (
    <blockquote style={{ margin: "20px 0", padding: "16px 20px", borderLeft: "4px solid #3b82f6", background: "#f8fafc", borderRadius: "0 8px 8px 0" }}>
      <p style={{ margin: 0, fontStyle: "italic", color: "#475569", lineHeight: 1.7 }}>{block.text}</p>
      {block.author && (
        <cite style={{ display: "block", marginTop: 10, fontSize: 13, color: "#64748b", fontStyle: "normal" }}>— {block.author}</cite>
      )}
    </blockquote>
  );
}

function NoteRenderer({ block }: { block: NoteBlock }) {
  const colors: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️" },
    warning: { bg: "#fef3c7", border: "#f59e0b", icon: "⚠️" },
    tip: { bg: "#dcfce7", border: "#22c55e", icon: "💡" },
    important: { bg: "#fee2e2", border: "#ef4444", icon: "❗" },
  };
  const color = colors[block.noteType] || colors.info;

  return (
    <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 10, margin: "16px 0", borderLeft: `4px solid ${color.border}`, background: color.bg }}>
      <div style={{ fontSize: 18 }}>{color.icon}</div>
      <div style={{ flex: 1, lineHeight: 1.6 }}>{block.content}</div>
    </div>
  );
}

function DividerRenderer() {
  return <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />;
}

function SpacerRenderer({ block }: { block: SpacerBlock }) {
  return <div style={{ height: block.height || 20 }} />;
}
