import { AnswerBlock } from "../admin/types";
import { formatCodeBlock } from "./codeFormatter";

let blockCounter = 0;
function genId(prefix: string = "b"): string {
  blockCounter++;
  return `${prefix}-${blockCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Convert a markdown answer string to AnswerBlock[]
 */
export function markdownToBlocks(markdown: string): AnswerBlock[] {
  if (!markdown || !markdown.trim()) return [];

  const blocks: AnswerBlock[] = [];
  
  // First, normalize the markdown
  const normalized = normalizeMarkdown(markdown);
  const lines = normalized.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line - skip
    if (!trimmed) {
      i++;
      continue;
    }

    // Code block
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim() || "text";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const rawCode = codeLines.join("\n");
      const formattedCode = formatCodeBlock(rawCode, lang);
      blocks.push({
        id: genId("b"),
        type: "code",
        language: lang,
        code: formattedCode,
      });
      continue;
    }

    // Heading
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 4) as 1 | 2 | 3 | 4;
      blocks.push({
        id: genId("b"),
        type: "heading",
        level,
        text: cleanInlineMarkdown(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Table (starts with |)
    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const tableBlock = parseTableLines(tableLines);
      if (tableBlock) blocks.push(tableBlock);
      continue;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      const items: { id: string; title: string; description: string; code?: string; codeLanguage?: string }[] = [];
      while (i < lines.length) {
        const line = lines[i].trim();
        const m = line.match(/^(\d+)\.\s+(.+)/);
        if (!m) break;

        const rawContent = m[2];
        let title = "";
        let code: string | undefined;
        let codeLanguage: string | undefined;

        const codeInlineMatch = rawContent.match(/^(.*?)\s*```(\w*)\s*([\s\S]*)$/);
        if (codeInlineMatch) {
          title = cleanInlineMarkdown(codeInlineMatch[1]);
          codeLanguage = codeInlineMatch[2] || "text";
          code = formatCodeBlock(codeInlineMatch[3].replace(/```$/, "").trim(), codeLanguage);
          i++;
        } else {
          title = cleanInlineMarkdown(rawContent);
          i++;
          if (i < lines.length && lines[i].trim().startsWith("```")) {
            const lang = lines[i].trim().slice(3).trim() || "text";
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
              codeLines.push(lines[i]);
              i++;
            }
            i++;
            codeLanguage = lang;
            code = formatCodeBlock(codeLines.join("\n").trim(), codeLanguage);
          }
        }

        items.push({
          id: genId("i"),
          title,
          description: "",
          code,
          codeLanguage,
        });
      }
      blocks.push({
        id: genId("b"),
        type: "numbered-list",
        items,
      });
      continue;
    }

    // Bullet list (- or * or •)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      const items: { id: string; title: string; description: string; code?: string; codeLanguage?: string }[] = [];
      while (i < lines.length) {
        const line = lines[i].trim();
        const m = line.match(/^[-*•]\s+(.+)/);
        if (!m) break;

        const rawContent = m[1];
        let title = "";
        let code: string | undefined;
        let codeLanguage: string | undefined;

        const codeInlineMatch = rawContent.match(/^(.*?)\s*```(\w*)\s*([\s\S]*)$/);
        if (codeInlineMatch) {
          title = cleanInlineMarkdown(codeInlineMatch[1]);
          codeLanguage = codeInlineMatch[2] || "text";
          code = formatCodeBlock(codeInlineMatch[3].replace(/```$/, "").trim(), codeLanguage);
          i++;
        } else {
          title = cleanInlineMarkdown(rawContent);
          i++;
          if (i < lines.length && lines[i].trim().startsWith("```")) {
            const lang = lines[i].trim().slice(3).trim() || "text";
            const codeLines: string[] = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
              codeLines.push(lines[i]);
              i++;
            }
            i++;
            codeLanguage = lang;
            code = formatCodeBlock(codeLines.join("\n").trim(), codeLanguage);
          }
        }

        items.push({
          id: genId("i"),
          title,
          description: "",
          code,
          codeLanguage,
        });
      }
      blocks.push({
        id: genId("b"),
        type: "bullet-list",
        items,
      });
      continue;
    }

    // Image
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push({
        id: genId("b"),
        type: "image",
        imageUrl: imgMatch[2],
        alt: imgMatch[1],
        caption: "",
        alignment: "center",
        width: "100",
      });
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ""));
        i++;
      }
      blocks.push({
        id: genId("b"),
        type: "quote",
        text: quoteLines.join("\n"),
        author: "",
      });
      continue;
    }

    // Note/callout
    const noteMatch = trimmed.match(/^(?:>?\s*)?(?:NOTE|INFO|WARNING|TIP|IMPORTANT):\s*(.+)/i);
    if (noteMatch) {
      const variant = noteMatch[0].toLowerCase().includes("warning") ? "warning"
        : noteMatch[0].toLowerCase().includes("tip") ? "tip"
        : noteMatch[0].toLowerCase().includes("important") ? "important"
        : "info";
      blocks.push({
        id: genId("b"),
        type: "note",
        content: cleanInlineMarkdown(noteMatch[1]),
        noteType: variant as "info" | "warning" | "tip" | "important",
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({
        id: genId("b"),
        type: "divider",
      });
      i++;
      continue;
    }

    // Paragraph (default) - collect consecutive non-empty lines
    const paraLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l) break;
      if (l.startsWith("```") || l.startsWith("#") || l.startsWith("|") || l.startsWith(">") || /^[-*•]\s/.test(l) || /^\d+\.\s/.test(l) || /^!\[/.test(l) || /^[-*_]{3,}$/.test(l)) break;
      paraLines.push(l);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({
        id: genId("b"),
        type: "paragraph",
        content: cleanInlineMarkdown(paraLines.join(" ")),
      });
    }
  }

  return blocks;
}

function normalizeMarkdown(markdown: string): string {
  let result = markdown;

  result = splitInlineCodeBlocks(result);

  result = result.replace(/(:\s*-\s*)(\|)/g, (_m, prefix: string, pipe: string) => {
    return prefix + '\n' + pipe;
  });

  result = convertSingleLineTables(result);

  return result;
}

function splitInlineCodeBlocks(text: string): string {
  return text.replace(/(```\w*)\s*/g, (_match, opening: string) => {
    return opening + '\n';
  }).replace(/\s*(```)/g, (_match, closing: string) => {
    return '\n' + closing;
  });
}

function convertSingleLineTables(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];

  const sepPattern = /\|(\s*-+\s*\|)+\s*/;

  for (const line of lines) {
    const sepResult = sepPattern.exec(line);
    if (!sepResult) {
      out.push(line);
      continue;
    }

    const sepStart = sepResult.index!;
    const beforeSep = line.substring(0, sepStart).trim();
    const afterSep = line.substring(sepStart + sepResult[0].length);

    const headerCells = beforeSep.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim());
    const numCols = headerCells.length;

    const rowCells = afterSep.split('|').filter((c: string) => c.trim() !== '').map((c: string) => c.trim());

    if (numCols < 2 || rowCells.length === 0) {
      out.push(line);
      continue;
    }

    const rows: string[][] = [];
    for (let k = 0; k < rowCells.length; k += numCols) {
      rows.push(rowCells.slice(k, k + numCols));
    }

    const rebuilt = [
      '| ' + headerCells.join(' | ') + ' |',
      '| ' + headerCells.map(() => '---').join(' | ') + ' |',
      ...rows.map((r: string[]) => '| ' + r.join(' | ') + ' |')
    ].join('\n');

    out.push(rebuilt);
  }

  return out.join('\n');
}

/**
 * Parse table lines into a TableBlock
 */
function parseTableLines(lines: string[]): AnswerBlock | null {
  if (lines.length < 2) return null;

  const rows: { id: string; cells: { id: string; content: string }[] }[] = [];
  let columns: string[] = [];
  let headerEnabled = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip separator line (|---|---| or |---- | --------- |)
    if (/^\|[\s\-:|]+\|$/.test(line) || /^\|\s*(-+\s*\|)+\s*$/.test(line) || /^\|\s*-+\s*\|/.test(line)) {
      headerEnabled = columns.length > 0;
      continue;
    }

    // Parse cells
    const cells = line
      .split("|")
      .filter((c) => c.trim() !== "")
      .map((c) => c.trim());

    if (cells.length === 0) continue;

    if (i === 0 || columns.length === 0) {
      columns = cells.map(cleanInlineMarkdown);
    } else {
      rows.push({
        id: genId("r"),
        cells: cells.map((c) => ({
          id: genId("c"),
          content: cleanInlineMarkdown(c),
        })),
      });
    }
  }

  if (columns.length === 0) return null;

  return {
    id: genId("b"),
    type: "table",
    columns,
    headerEnabled,
    rows,
  };
}

/**
 * Remove markdown inline formatting but keep the text
 */
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/__([^_]+)__/g, "$1") // bold
    .replace(/_([^_]+)_/g, "$1") // italic
    .replace(/~~([^~]+)~~/g, "$1") // strikethrough
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .trim();
}
