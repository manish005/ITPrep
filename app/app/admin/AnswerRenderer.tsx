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

      <style jsx>{`
        .answer-renderer {
          line-height: 1.8;
          color: #334155;
        }

        .empty-answer {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>
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
    <div>
      <p>{block.content || "Empty paragraph"}</p>
      <style jsx>{`
        p {
          margin: 12px 0;
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}

function HeadingRenderer({ block }: { block: HeadingBlock }) {
  const headingContent = block.text || "Empty heading";
  return (
    <div>
      {block.level === 1 && <h1>{headingContent}</h1>}
      {block.level === 2 && <h2>{headingContent}</h2>}
      {block.level === 3 && <h3>{headingContent}</h3>}
      {block.level === 4 && <h4>{headingContent}</h4>}
      <style jsx>{`
        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          margin: 24px 0 12px;
          line-height: 1.3;
        }
        h2 {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin: 20px 0 10px;
          line-height: 1.3;
        }
        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #0f172a;
          margin: 16px 0 8px;
          line-height: 1.4;
        }
        h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
          margin: 14px 0 6px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

function ListRenderer({ block }: { block: ListBlock }) {
  const isNumbered = block.type === "numbered-list";
  const Tag = isNumbered ? "ol" : "ul";

  const renderItem = (item: any, index?: number) => (
    <li key={item.id}>
      <div className="list-content">
        {item.title && <strong>{item.title}</strong>}
        {item.title && item.description && ": "}
        {item.description && <span>{item.description}</span>}
        {item.code && (
          <div className="list-code-block">
            {item.codeLanguage && <span className="code-lang">{item.codeLanguage}</span>}
            <pre><code>{item.code}</code></pre>
          </div>
        )}
      </div>
      {item.subItems && item.subItems.length > 0 && (
        <ul className="sub-list">
          {item.subItems.map((sub: any, subIndex: number) => renderItem(sub, subIndex))}
        </ul>
      )}
    </li>
  );

  return (
    <div>
      <Tag>
        {block.items.map((item, index) => renderItem(item, index))}
      </Tag>
      <style jsx>{`
        ol, ul {
          margin: 12px 0;
          padding-left: 24px;
        }
        li {
          margin-bottom: 10px;
          line-height: 1.7;
        }
        .list-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        strong {
          color: #0f172a;
        }
        .sub-list {
          margin-top: 8px;
          margin-bottom: 0;
          padding-left: 20px;
          border-left: 2px solid #e2e8f0;
        }
        .sub-list li {
          margin-bottom: 6px;
          font-size: 0.95em;
        }
        .list-code-block {
          margin-top: 12px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #334155;
          background: #252526;
        }
        .code-lang {
          background: #2d2d2d;
          color: #94a3b8;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #404040;
          font-family: "Fira Code", "Consolas", monospace;
        }
        .list-code-block pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 20px;
          margin: 0;
          font-family: "Fira Code", "Consolas", monospace;
          font-size: 13px;
          overflow-x: auto;
          line-height: 1.7;
          border: none;
          border-radius: 0;
        }
        .list-code-block code {
          white-space: pre;
          background: transparent;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
        li pre code .token-keyword { color: #c586c0; }
        li pre code .token-decorator { color: #ce9178; }
        li pre code .token-string { color: #6a9955; }
        li pre code .token-property { color: #9cdcfe; }
        li pre code .token-classname { color: #fd971f; }
        li pre code .token-type { color: #4ec9b0; }
        li pre code .token-number { color: #b5cea8; }
        li pre code .token-comment { color: #6a9955; font-style: italic; }
        li pre code .token-plain { color: #d4d4d4; }
        ol li pre, ul li pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 20px;
          margin: 8px 0 0 0;
          font-family: "Fira Code", "Consolas", monospace;
          font-size: 13px;
          overflow-x: auto;
          line-height: 1.7;
          border-radius: 12px;
          border: 1px solid #334155;
        }
        ol li pre code, ul li pre code {
          background: transparent;
          padding: 0;
          border: none;
          border-radius: 0;
          white-space: pre;
          color: #d4d4d4;
        }
      `}</style>
    </div>
  );
}

function TableRenderer({ block }: { block: TableBlock }) {
  return (
    <div className="table-wrapper">
      <table>
        {block.headerEnabled && (
          <thead>
            <tr>
              {block.columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell) => (
                <td key={cell.id}>{cell.content}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .table-wrapper {
          overflow-x: auto;
          margin: 16px 0;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th {
          background: #1e40af;
          color: white;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        td {
          padding: 10px 16px;
          border-bottom: 1px solid #e2e8f0;
          line-height: 1.5;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:nth-child(even) {
          background: #f8fafc;
        }
        tbody tr:hover {
          background: #eff6ff;
        }
      `}</style>
    </div>
  );
}

function ImageRenderer({ block }: { block: ImageBlock }) {
  if (!block.imageUrl) {
    return (
      <div className="image-placeholder">
        No image selected
        <style jsx>{`
          .image-placeholder {
            padding: 40px;
            background: #f1f5f9;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            text-align: center;
            color: #94a3b8;
            margin: 16px 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <figure className={`image-${block.alignment}`}>
      <img src={block.imageUrl} alt={block.alt} style={{ maxWidth: block.width }} />
      {block.caption && <figcaption>{block.caption}</figcaption>}

      <style jsx>{`
        figure {
          margin: 20px 0;
          text-align: center;
        }
        figure.image-left {
          text-align: left;
        }
        figure.image-right {
          text-align: right;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        figcaption {
          margin-top: 8px;
          font-size: 13px;
          color: #64748b;
          font-style: italic;
        }
      `}</style>
    </figure>
  );
}

function CodeRenderer({ block }: { block: CodeBlock }) {
  // Use syntax highlighter for TypeScript/Angular code
  const tokens = block.language === "typescript" || block.language === "ts" || block.language === "angular"
    ? highlightCode(block.code || "", block.language)
    : [{ text: block.code || "No code", className: "plain" }];

  return (
    <div className="code-block">
      {block.language && <div className="code-lang">{block.language}</div>}
      <pre>
        <code>
          {tokens.map((token: { text: string; className: string }, i: number) => (
            <span key={i} className={`token-${token.className}`}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>

      <style jsx>{`
        .code-block {
          margin: 16px 0;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #334155;
        }
        .code-lang {
          background: #2d2d2d;
          color: #94a3b8;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #404040;
        }
        pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 20px;
          margin: 0;
          font-family: "Fira Code", "Consolas", monospace;
          font-size: 13px;
          overflow-x: auto;
          line-height: 1.7;
        }
        code {
          white-space: pre;
        }
        .token-keyword {
          color: #c586c0;
        }
        .token-decorator {
          color: #ce9178;
        }
        .token-string {
          color: #6a9955;
        }
        .token-property {
          color: #9cdcfe;
        }
        .token-classname {
          color: #fd971f;
        }
        .token-type {
          color: #4ec9b0;
        }
        .token-number {
          color: #b5cea8;
        }
        .token-comment {
          color: #6a9955;
          font-style: italic;
        }
        .token-plain {
          color: #d4d4d4;
        }
      `}</style>
    </div>
  );
}

function QuoteRenderer({ block }: { block: QuoteBlock }) {
  return (
    <blockquote>
      <p>{block.text}</p>
      {block.author && <cite>— {block.author}</cite>}

      <style jsx>{`
        blockquote {
          margin: 20px 0;
          padding: 16px 20px;
          border-left: 4px solid #3b82f6;
          background: #f8fafc;
          border-radius: 0 8px 8px 0;
        }
        p {
          margin: 0;
          font-style: italic;
          color: #475569;
          line-height: 1.7;
        }
        cite {
          display: block;
          margin-top: 10px;
          font-size: 13px;
          color: #64748b;
          font-style: normal;
        }
      `}</style>
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
    <div className="note-block">
      <div className="note-icon">{color.icon}</div>
      <div className="note-content">{block.content}</div>

      <style jsx>{`
        .note-block {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 10px;
          margin: 16px 0;
          border-left: 4px solid;
        }
        .note-icon {
          font-size: 18px;
        }
        .note-content {
          flex: 1;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

function DividerRenderer() {
  return (
    <hr />
  );
}

function SpacerRenderer({ block }: { block: SpacerBlock }) {
  return <div style={{ height: block.height || 20 }} />;
}
