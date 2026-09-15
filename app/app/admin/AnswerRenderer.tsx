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

export default function AnswerRenderer({ blocks }: AnswerRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <div className="empty-answer">No answer content yet.</div>;
  }

  return (
    <div className="answer-renderer">
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
  return (
    <p className="answer-paragraph">{block.content || "Empty paragraph"}</p>
  );
}

function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const headingContent = block.text || "Empty heading";
  const className = "answer-heading";
  return (
    <>
      {block.level === 1 && <h1 className={className}>{headingContent}</h1>}
      {block.level === 2 && <h2 className={className}>{headingContent}</h2>}
      {block.level === 3 && <h3 className={className}>{headingContent}</h3>}
      {block.level === 4 && <h4 className={className}>{headingContent}</h4>}
    </>
  );
}

function ListRenderer({ block }: { block: ListBlock }) {
  const isNumbered = block.type === "numbered-list";
  const Tag = isNumbered ? "ol" : "ul";
  const listClass = isNumbered ? "answer-list answer-ol" : "answer-list answer-ul";

  const renderItem = (item: any, index?: number) => (
    <li key={item.id}>
      <div className="list-content">
        {item.title && <strong>{item.title}</strong>}
        {item.title && item.description && ": "}
        {item.description && <span>{item.description}</span>}
        {item.code && (
          <div className="answer-list-code-block">
            {item.codeLanguage && <span className="code-lang">{item.codeLanguage}</span>}
            <pre><code>{item.code}</code></pre>
          </div>
        )}
      </div>
      {item.subItems && item.subItems.length > 0 && (
        <ul className="answer-sub-list">
          {item.subItems.map((sub: any, subIndex: number) => renderItem(sub, subIndex))}
        </ul>
      )}
    </li>
  );

  return (
    <Tag className={listClass}>
      {block.items.map((item, index) => renderItem(item, index))}
    </Tag>
  );
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="answer-table-wrapper">
      <table className="answer-table">
        {block.headerEnabled && (
          <thead>
            <tr>
              {block.columns.map((col, i) => (
                <th key={`th-${i}`}>{col}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={`tr-${rowIndex}-${row.id}`}>
              {row.cells.map((cell, cellIndex) => (
                <td key={`td-${rowIndex}-${cellIndex}-${cell.id}`}>{cell.content}</td>
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
      <div className="answer-image-placeholder">
        No image selected
      </div>
    );
  }

  return (
    <figure className={`answer-figure image-${block.alignment || "center"}`}>
      <img className="answer-image" src={block.imageUrl} alt={block.alt} style={{ maxWidth: block.width }} />
      {block.caption && <figcaption className="answer-figcaption">{block.caption}</figcaption>}
    </figure>
  );
}

function CodeRenderer({ block }: { block: CodeBlock }) {
  const tokens = block.language === "typescript" || block.language === "ts" || block.language === "angular"
    ? highlightCode(block.code || "", block.language)
    : [{ text: block.code || "No code", className: "plain" }];

  return (
    <div className="answer-code-block">
      {block.language && <div className="answer-code-lang">{block.language}</div>}
      <pre className="answer-code">
        <code>
          {tokens.map((token: { text: string; className: string }, i: number) => (
            <span key={i} className={`token-${token.className}`}>
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
    <blockquote className="answer-quote">
      <p>{block.text}</p>
      {block.author && <cite>— {block.author}</cite>}
    </blockquote>
  );
}

function NoteRenderer({ block }: { block: NoteBlock }) {
  const colors = {
    info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️" },
    warning: { bg: "#fef3c7", border: "#f59e0b", icon: "⚠️" },
    tip: { bg: "#dcfce7", border: "#22c55e", icon: "💡" },
    important: { bg: "#fee2e2", border: "#ef4444", icon: "❗" },
  };

  const color = colors[block.noteType] || colors.info;

  return (
    <div className="answer-note" style={{ background: color.bg, borderColor: color.border }}>
      <div className="answer-note-icon">{color.icon}</div>
      <div className="answer-note-content">{block.content}</div>
    </div>
  );
}

function DividerRenderer() {
  return <hr />;
}

function SpacerRenderer({ block }: { block: SpacerBlock }) {
  return <div style={{ height: block.height || 20 }} />;
}
