import { AnswerBlock } from "../admin/types";

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
      blocks.push({
        id: genId("b"),
        type: "code",
        language: lang,
        code: codeLines.join("\n"),
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
      const items: { id: string; title: string; description: string }[] = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^(\d+)\.\s+(.+)/);
        if (!m) break;
        items.push({
          id: genId("i"),
          title: cleanInlineMarkdown(m[2]),
          description: "",
        });
        i++;
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
      const items: { id: string; title: string; description: string }[] = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^[-*•]\s+(.+)/);
        if (!m) break;
        items.push({
          id: genId("i"),
          title: cleanInlineMarkdown(m[1]),
          description: "",
        });
        i++;
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

/**
 * Normalize markdown - handle single-line tables and other edge cases
 */
function normalizeMarkdown(markdown: string): string {
  let result = markdown;

  // Handle tables that come after text with ": -" pattern
  // Like "Here are differences:- | Col1 | Col2 | |---| | Row1 | Row2 |"
  result = result.replace(/(:\s*-\s*)(\|)/g, (match, prefix, pipe) => {
    return prefix + '\n' + pipe;
  });

  // Handle single-line tables with separator pattern like "|---- | --------- |"
  // Split them into proper multi-line format
  // Pattern: "| H1 | H2 | |---- | --------- | | R1C1 | R1C2 | | R2C1 | R2C2 |"
  
  // First, check if we have a single-line table
  const pipeCount = (result.match(/\|/g) || []).length;
  const hasSeparator = /\|\s*-+\s*\|/.test(result);
  
  if (hasSeparator && pipeCount > 6) {
    // This looks like a single-line table, try to parse it
    const tableMatch = result.match(/(\|[^|\n]+\|)\s*(\|\s*-+\s*\|[^|\n]*\|)\s*(\|(?:[^|\n]+\|)+)/);
    if (tableMatch) {
      const [fullMatch, headerPart, separatorPart, rowsPart] = tableMatch;
      
      // Parse header cells
      const headerCells = headerPart.split('|').filter((c: string) => c.trim()).map((c: string) => c.trim());
      
      // Parse separator
      const separatorCells = separatorPart.split('|').filter((c: string) => c.trim());
      
      // Parse rows - they might be concatenated
      const allCells = rowsPart.split('|').filter((c: string) => c.trim()).map((c: string) => c.trim());
      
      // Group cells into rows based on header count
      const numRows = Math.floor(allCells.length / headerCells.length);
      const rows: string[][] = [];
      for (let r = 0; r < numRows; r++) {
        rows.push(allCells.slice(r * headerCells.length, (r + 1) * headerCells.length));
      }
      
      // Rebuild as multi-line table
      const headerLine = '| ' + headerCells.join(' | ') + ' |';
      const separatorLine = '| ' + separatorCells.join(' | ') + ' |';
      const rowLines = rows.map((row: string[]) => '| ' + row.join(' | ') + ' |');
      
      // Replace the original table with formatted version
      const beforeTable = result.substring(0, result.indexOf('|'));
      const afterTableEnd = result.lastIndexOf('|') + 1;
      const afterTable = result.substring(afterTableEnd);
      
      result = beforeTable + headerLine + '\n' + separatorLine + '\n' + rowLines.join('\n') + afterTable;
    }
  }

  return result;
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
      headerEnabled = rows.length > 0;
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
