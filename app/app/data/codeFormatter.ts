/**
 * Code formatter for TypeScript, Angular, JavaScript, HTML, CSS
 * Follows VS Code + Prettier conventions
 */

export function formatCodeBlock(code: string, language: string): string {
  if (!code || !code.trim()) return code;

  const lang = language.toLowerCase().trim();

  if (lang === "typescript" || lang === "ts" || lang === "javascript" || lang === "js") {
    return formatTypeScript(code);
  }
  if (lang === "html" || lang === "angular" || lang === "xml") {
    return formatHTML(code);
  }
  if (lang === "css" || lang === "scss") {
    return formatCSS(code);
  }
  if (lang === "json") {
    return formatJSON(code);
  }
  if (lang === "bash" || lang === "sh" || lang === "shell") {
    return formatBash(code);
  }
  if (lang === "sql") {
    return formatSQL(code);
  }
  if (lang === "python" || lang === "py") {
    return formatPython(code);
  }

  return code;
}

// ============================================
// TYPESCRIPT / JAVASCRIPT FORMATTER
// ============================================

function formatTypeScript(code: string): string {
  let result = code.trim();

  // If already has newlines with proper indentation, don't reformat
  const lines = result.split("\n");
  const hasProperFormatting = lines.length > 3 && lines.some((l) => /^\s{2,}/.test(l));
  if (hasProperFormatting) return result;

  // Split statements by semicolons first, then format
  result = formatTypeScriptStatements(result);

  return result;
}

function formatTypeScriptStatements(code: string): string {
  const tokens = tokenizeTypeScript(code);
  let indent = 0;
  let result: string[] = [];
  let currentLine = "";
  let inTemplateLiteral = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === "`") {
      inTemplateLiteral = !inTemplateLiteral;
      currentLine += token;
      continue;
    }

    if (inTemplateLiteral) {
      currentLine += token;
      continue;
    }

    if (token === "{") {
      currentLine += " {";
      result.push(currentLine.trimEnd());
      currentLine = "";
      indent++;
      result.push("  ".repeat(indent));
      continue;
    }

    if (token === "}") {
      if (currentLine.trim()) {
        result.push(currentLine.trimEnd());
        currentLine = "";
      }
      indent = Math.max(0, indent - 1);
      result.push("  ".repeat(indent) + "}");
      // Add newline after closing brace if next token exists
      if (i + 1 < tokens.length && tokens[i + 1] !== ";") {
        result.push("");
        currentLine = "  ".repeat(indent);
      }
      continue;
    }

    if (token === ";") {
      currentLine += ";";
      result.push(currentLine.trimEnd());
      currentLine = "  ".repeat(indent);
      continue;
    }

    if (token === ",") {
      currentLine += ",";
      // Don't add newline for function params or array items
      // Check context
      const nextToken = tokens[i + 1];
      if (nextToken && nextToken !== "}" && nextToken !== ")") {
        result.push(currentLine.trimEnd());
        currentLine = "  ".repeat(indent) + "  ";
      }
      continue;
    }

    currentLine += token;
  }

  if (currentLine.trim()) {
    result.push(currentLine.trimEnd());
  }

  // Clean up: remove excessive blank lines
  let cleaned: string[] = [];
  let blankCount = 0;
  for (const line of result) {
    if (line.trim() === "") {
      blankCount++;
      if (blankCount <= 1) cleaned.push(line);
    } else {
      blankCount = 0;
      cleaned.push(line);
    }
  }

  // Ensure imports are on separate lines
  let output = cleaned.join("\n");
  output = formatImports(output);
  output = formatDecorators(output);
  output = formatMethodSignatures(output);

  return output.trim();
}

function tokenizeTypeScript(code: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inString = false;
  let stringChar = "";
  let inTemplateLiteral = false;
  let templateDepth = 0;

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    // Handle template literals
    if (ch === "`" && !inString) {
      if (inTemplateLiteral) {
        templateDepth--;
        if (templateDepth === 0) {
          inTemplateLiteral = false;
          current += ch;
          tokens.push(current);
          current = "";
          continue;
        }
      } else {
        inTemplateLiteral = true;
        templateDepth = 1;
        if (current) tokens.push(current);
        current = ch;
        continue;
      }
    }

    if (inTemplateLiteral) {
      current += ch;
      continue;
    }

    // Handle strings
    if ((ch === '"' || ch === "'") && !inString) {
      inString = true;
      stringChar = ch;
      if (current) tokens.push(current);
      current = ch;
      continue;
    }
    if (inString && ch === stringChar && code[i - 1] !== "\\") {
      inString = false;
      current += ch;
      tokens.push(current);
      current = "";
      continue;
    }
    if (inString) {
      current += ch;
      continue;
    }

    // Handle special characters
    if (ch === "{" || ch === "}" || ch === ";" || ch === ",") {
      if (current) tokens.push(current);
      current = "";
      tokens.push(ch);
      continue;
    }

    // Handle parentheses and brackets
    if (ch === "(" || ch === ")" || ch === "[" || ch === "]") {
      if (current) tokens.push(current);
      current = "";
      tokens.push(ch);
      continue;
    }

    current += ch;
  }

  if (current) tokens.push(current);
  return tokens;
}

function formatImports(code: string): string {
  // Put each import on its own line
  return code.replace(
    /import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]\s*;\s*import\s/g,
    (match) => {
      return match.replace(/\s*import\s/g, ";\nimport ");
    }
  ).replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g,
    (match, imports, path) => {
      const importList = imports.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (importList.length > 3) {
        return `import {\n  ${importList.join(",\n  ")}\n} from "${path}"`;
      }
      return `import { ${importList.join(", ")} } from "${path}"`;
    }
  );
}

function formatDecorators(code: string): string {
  // Format @Component, @NgModule, @Injectable etc.
  return code.replace(
    /@(Component|NgModule|Injectable|Directive|Pipe|Input|Output)\s*\(\s*\{/g,
    (match, name) => {
      return `@${name}({`;
    }
  ).replace(
    /@(Component|NgModule|Injectable|Directive|Pipe)\s*\(\s*\{([^}]+)\}\s*\)/g,
    (match, name, props) => {
      const formatted = props
        .replace(/\s+/g, " ")
        .trim();
      // Split by commas and format each property
      const propList = formatted.split(",").map((p: string) => {
        const trimmed = p.trim();
        if (trimmed.includes(":")) {
          const [key, ...rest] = trimmed.split(":");
          return `${key.trim()}: ${rest.join(":").trim()}`;
        }
        return trimmed;
      }).filter(Boolean);

      if (propList.length > 2) {
        return `@${name}({\n  ${propList.join(",\n  ")}\n})`;
      }
      return `@${name}({ ${propList.join(", ")} })`;
    }
  );
}

function formatMethodSignatures(code: string): string {
  // Format method signatures with proper spacing
  return code.replace(
    /(\w+)\s*\(([^)]*)\)\s*:\s*(\w+)/g,
    (match, name, params, returnType) => {
      const formattedParams = params
        .split(",")
        .map((p: string) => p.trim())
        .filter(Boolean)
        .join(", ");
      return `${name}(${formattedParams}): ${returnType}`;
    }
  );
}

// ============================================
// HTML FORMATTER
// ============================================

function formatHTML(code: string): string {
  let result = code.trim();
  const lines = result.split("\n");
  const hasProperFormatting = lines.length > 3 && lines.some((l) => /^\s{2,}/.test(l));
  if (hasProperFormatting) return result;

  let indent = 0;
  const formatted: string[] = [];
  const tokens = result.split(/(<[^>]+>)/);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("</")) {
      indent = Math.max(0, indent - 1);
    }

    formatted.push("  ".repeat(indent) + trimmed);

    if (
      trimmed.startsWith("<") &&
      !trimmed.startsWith("</") &&
      !trimmed.endsWith("/>") &&
      !trimmed.includes("</") &&
      !trimmed.startsWith("<input") &&
      !trimmed.startsWith("<br") &&
      !trimmed.startsWith("<hr") &&
      !trimmed.startsWith("<img")
    ) {
      indent++;
    }
  }

  return formatted.join("\n");
}

// ============================================
// CSS FORMATTER
// ============================================

function formatCSS(code: string): string {
  let result = code.trim();
  const lines = result.split("\n");
  const hasProperFormatting = lines.length > 3 && lines.some((l) => /^\s{2,}/.test(l));
  if (hasProperFormatting) return result;

  // Simple CSS formatter
  result = result.replace(/\s*{\s*/g, " {\n  ");
  result = result.replace(/\s*}\s*/g, "\n}\n");
  result = result.replace(/;\s*/g, ";\n  ");
  result = result.replace(/\n\s*\n/g, "\n");

  return result.trim();
}

// ============================================
// JSON FORMATTER
// ============================================

function formatJSON(code: string): string {
  try {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return code;
  }
}

// ============================================
// BASH FORMATTER
// ============================================

function formatBash(code: string): string {
  let result = code.trim();
  // Split by && and ||
  result = result.replace(/(\s*&&\s*|\s*\|\|\s*)/g, "$1\n");
  return result.trim();
}

// ============================================
// SQL FORMATTER
// ============================================

function formatSQL(code: string): string {
  let result = code.trim().toUpperCase();

  // Add newlines before major keywords
  const keywords = ["SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT", "RIGHT", "INNER", "ON", "GROUP BY", "ORDER BY", "HAVING", "INSERT", "UPDATE", "DELETE", "VALUES", "SET", "CREATE", "ALTER", "DROP"];

  for (const keyword of keywords) {
    const regex = new RegExp(`\\s+${keyword}\\s+`, "gi");
    result = result.replace(regex, `\n${keyword} `);
  }

  return result.trim();
}

// ============================================
// PYTHON FORMATTER
// ============================================

function formatPython(code: string): string {
  let result = code.trim();
  const lines = result.split("\n");
  const hasProperFormatting = lines.length > 3 && lines.some((l) => /^\s{2,}/.test(l));
  if (hasProperFormatting) return result;

  // Basic Python formatting
  result = result.replace(/;\s*/g, ";\n");
  return result.trim();
}
