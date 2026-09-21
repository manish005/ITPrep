type TokenType = "keyword" | "decorator" | "string" | "property" | "classname" | "type" | "number" | "comment" | "tag" | "attr" | "value" | "selector" | "function" | "operator" | "plain";

interface Token {
  text: string;
  className: TokenType;
}

const LANG_KEYWORDS: Record<string, RegExp> = {
  typescript: /\b(import|export|from|class|extends|implements|interface|type|enum|const|let|var|function|return|if|else|switch|case|break|default|for|while|do|new|this|super|static|public|private|protected|readonly|abstract|async|await|yield|throw|try|catch|finally|void|null|undefined|true|false|typeof|instanceof|in|of|as|is|keyof|infer|satisfies|declare|module|namespace|require|module)\b/g,
  javascript: /\b(import|export|from|class|extends|const|let|var|function|return|if|else|switch|case|break|default|for|while|do|new|this|super|static|public|private|protected|async|await|yield|throw|try|catch|finally|void|null|undefined|true|false|typeof|instanceof|in|of|as|is|require|module|delete|with|debugger)\b/g,
  html: /\b(html|head|body|div|span|p|a|ul|ol|li|h1|h2|h3|h4|h5|h6|table|tr|td|th|thead|tbody|form|input|button|select|option|textarea|img|video|audio|canvas|svg|script|style|link|meta|title|section|article|aside|footer|header|nav|main|figure|figcaption|details|summary|dialog|template|slot|label|fieldset|legend|datalist|output|progress|meter|address|blockquote|cite|code|pre|small|strong|em|sub|sup|mark|time|var|abbr|bdi|bdo|wbr|source|track|area|col|colgroup|dl|dt|dd|hr|br)\b/g,
  css: /\b(color|background|margin|padding|border|display|position|width|height|font|text|flex|grid|align|justify|overflow|opacity|transform|transition|animation|z-index|cursor|content|box|outline|shadow|min|max|top|right|bottom|left|float|clear|vertical|white|line|letter|word|list|table|caption|empty|first|last|nth|not|only|has|where|is|hover|focus|active|visited|disabled|checked|placeholder|before|after|root|host|media|keyframes|import|font-face|supports)\b/g,
  python: /\b(import|from|class|def|return|if|elif|else|for|while|break|continue|pass|raise|try|except|finally|with|as|yield|lambda|global|nonlocal|assert|del|in|not|and|or|is|True|False|None|self|cls|async|await|print|range|len|type|int|str|float|bool|list|dict|set|tuple|None)\b/g,
  sql: /\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|AS|DISTINCT|COUNT|SUM|AVG|MIN|MAX|GROUP|BY|ORDER|ASC|DESC|LIMIT|OFFSET|UNION|ALL|HAVING|CASE|WHEN|THEN|ELSE|END|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|UNIQUE|CHECK|DEFAULT|AUTO_INCREMENT|VARCHAR|INT|INTEGER|TEXT|BOOLEAN|DATE|TIMESTAMP|FLOAT|DECIMAL|BLOB)\b/gi,
  json: /\b(true|false|null)\b/g,
  bash: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|echo|export|source|alias|unalias|cd|pwd|ls|cat|grep|sed|awk|find|sort|uniq|wc|head|tail|cp|mv|rm|mkdir|rmdir|chmod|chown|sudo|apt|npm|yarn|pip|git|docker|curl|wget|tar|zip|unzip|ssh|scp|rsync|kill|ps|top|df|du|mount|umount|chmod|chown|which|type|history|man|help|true|false|test)\b/g,
  csharp: /\b(using|namespace|class|struct|interface|enum|delegate|event|async|await|return|if|else|switch|case|break|default|for|foreach|while|do|new|this|base|static|public|private|protected|internal|readonly|abstract|virtual|override|sealed|partial|const|var|void|null|true|false|typeof|is|as|in|out|ref|params|yield|try|catch|finally|throw|lock|using|where|select|from|group|into|orderby|let|aggregate|join|double|decimal|float|int|long|string|bool|object|byte|char|DateTime|List|Dictionary|IEnumerable|Task)\b/g,
  java: /\b(import|package|class|interface|enum|extends|implements|abstract|static|final|private|protected|public|new|this|super|return|if|else|switch|case|break|default|for|while|do|try|catch|finally|throw|throws|void|null|true|false|typeof|instanceof|instanceof|synchronized|volatile|transient|native|strictfp|assert|enum|var|record|sealed|permits|yield|String|int|long|double|float|boolean|char|byte|short|Integer|Long|Double|Float|Boolean|Character|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Stream)\b/g,
  yaml: /\b(true|false|null|yes|no|on|off)\b/gi,
};

const LANG_DECORATORS: Record<string, RegExp> = {
  typescript: /@(Component|Injectable|Directive|Pipe|NgModule|Input|Output|HostBinding|HostListener|ViewChild|ContentChild|ContentChildren|ViewChildren|Host|Self|SkipSelf|Optional|Inject|Signal|computed|effect|input|output|model|contentChild|contentChildren|viewChild|viewChildren)\b/g,
  javascript: /@(Component|Injectable|Directive|Pipe|NgModule|Input|Output)\b/g,
  csharp: /\[(Obsolete|Serializable|JsonProperty|HttpGet|HttpPost|HttpPut|HttpDelete|Route|ApiController|Authorize|AllowAnonymous|ValidateAntiForgeryToken)\]/g,
  python: /@(property|staticmethod|classmethod|abstractmethod|override|dataclass|property)\b/g,
};

const LANG_TYPES: Record<string, RegExp> = {
  typescript: /:\s*(string|number|boolean|any|void|never|object|symbol|bigint|Array|Map|Set|Promise|Record|Partial|Required|Readonly|Pick|Omit|HTMLElement|EventEmitter|ElementRef|QueryList|Observable|BehaviorSubject|Subject|Promise|ReturnType|Parameters|Extract|Exclude|NonNullable)\b/g,
  csharp: /\b(string|int|long|double|float|bool|object|void|decimal|DateTime|List|Dictionary|IEnumerable|Task|Action|Func|Nullable)\b/g,
  java: /\b(String|int|long|double|float|boolean|char|byte|short|Integer|Long|Double|Float|Boolean|Character|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Stream|Object)\b/g,
};

function getKeywords(lang: string): RegExp {
  const normalized = lang.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "ts" || normalized === "typescript" || normalized === "angular") return LANG_KEYWORDS.typescript;
  if (normalized === "js" || normalized === "javascript" || normalized === "jsx") return LANG_KEYWORDS.javascript;
  if (normalized === "html" || normalized === "htm") return LANG_KEYWORDS.html;
  if (normalized === "css" || normalized === "scss" || normalized === "less") return LANG_KEYWORDS.css;
  if (normalized === "py" || normalized === "python") return LANG_KEYWORDS.python;
  if (normalized === "sql") return LANG_KEYWORDS.sql;
  if (normalized === "json") return LANG_KEYWORDS.json;
  if (normalized === "bash" || normalized === "shell" || normalized === "sh" || normalized === "zsh" || normalized === "cmd" || normalized === "powershell") return LANG_KEYWORDS.bash;
  if (normalized === "cs" || normalized === "csharp" || normalized === "c#") return LANG_KEYWORDS.csharp;
  if (normalized === "java") return LANG_KEYWORDS.java;
  if (normalized === "yaml" || normalized === "yml") return LANG_KEYWORDS.yaml;
  return LANG_KEYWORDS.typescript;
}

function getDecorators(lang: string): RegExp | null {
  const normalized = lang.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "ts" || normalized === "typescript" || normalized === "angular") return LANG_DECORATORS.typescript;
  if (normalized === "js" || normalized === "javascript") return LANG_DECORATORS.javascript;
  if (normalized === "cs" || normalized === "csharp" || normalized === "c#") return LANG_DECORATORS.csharp;
  if (normalized === "py" || normalized === "python") return LANG_DECORATORS.python;
  return null;
}

function getTypes(lang: string): RegExp | null {
  const normalized = lang.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized === "ts" || normalized === "typescript" || normalized === "angular") return LANG_TYPES.typescript;
  if (normalized === "cs" || normalized === "csharp" || normalized === "c#") return LANG_TYPES.csharp;
  if (normalized === "java") return LANG_TYPES.java;
  return null;
}

function isHtmlLang(lang: string): boolean {
  const n = lang.toLowerCase().replace(/[^a-z]/g, "");
  return n === "html" || n === "htm";
}

function isCssLang(lang: string): boolean {
  const n = lang.toLowerCase().replace(/[^a-z]/g, "");
  return n === "css" || n === "scss" || n === "less";
}

function tokenizeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = [];
  const keywords = getKeywords(lang);
  const decorators = getDecorators(lang);
  const types = getTypes(lang);
  const htmlLang = isHtmlLang(lang);
  const cssLang = isCssLang(lang);

  let remaining = line;
  let pos = 0;

  while (pos < remaining.length) {
    let matched = false;

    const rest = remaining.slice(pos);

    // HTML: tag names and attributes
    if (htmlLang) {
      const tagMatch = rest.match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
      if (tagMatch) {
        tokens.push({ text: tagMatch[0].startsWith("</") ? "</" : "<", className: "plain" });
        tokens.push({ text: tagMatch[1], className: "tag" });
        pos += tagMatch[0].length;
        matched = true;
        continue;
      }
      const attrMatch = rest.match(/^([a-zA-Z-]+)(=)/);
      if (attrMatch) {
        tokens.push({ text: attrMatch[1], className: "attr" });
        tokens.push({ text: "=", className: "plain" });
        pos += attrMatch[0].length;
        matched = true;
        continue;
      }
    }

    // CSS: selectors and property-value pairs
    if (cssLang) {
      const selectorMatch = rest.match(/^([.#]?[a-zA-Z_-][a-zA-Z0-9_-]*)(\s*\{)/);
      if (selectorMatch) {
        tokens.push({ text: selectorMatch[1], className: "selector" });
        tokens.push({ text: selectorMatch[2], className: "plain" });
        pos += selectorMatch[0].length;
        matched = true;
        continue;
      }
      const propMatch = rest.match(/^([a-zA-Z-]+)(\s*:\s*)/);
      if (propMatch && !rest.startsWith("/*")) {
        tokens.push({ text: propMatch[1], className: "property" });
        tokens.push({ text: propMatch[2], className: "plain" });
        pos += propMatch[0].length;
        matched = true;
        continue;
      }
    }

    // Check for comments first
    const singleComment = rest.match(/^(\/\/.*$)/);
    if (singleComment) {
      tokens.push({ text: singleComment[1], className: "comment" });
      pos += singleComment[1].length;
      matched = true;
      continue;
    }

    const multiComment = rest.match(/^(\/\*[\s\S]*?\*\/)/);
    if (multiComment) {
      tokens.push({ text: multiComment[1], className: "comment" });
      pos += multiComment[1].length;
      matched = true;
      continue;
    }

    // HTML comments
    if (htmlLang) {
      const htmlComment = rest.match(/^(<!--[\s\S]*?-->)/);
      if (htmlComment) {
        tokens.push({ text: htmlComment[1], className: "comment" });
        pos += htmlComment[1].length;
        matched = true;
        continue;
      }
    }

    // Strings
    const strMatch = rest.match(/^(['"`])(?:(?!\1|\\).|\\.)*\1/);
    if (strMatch) {
      tokens.push({ text: strMatch[0], className: "string" });
      pos += strMatch[0].length;
      matched = true;
      continue;
    }

    // Decorators
    if (decorators) {
      const decLocal = new RegExp("^" + decorators.source.replace(/\\/g, "\\").replace(/\(\?<[!=][^)]*\)/g, "(?:").replace(/\(\?:/g, "(?:").replace(/@\(/g, "@("));
      const decMatch = rest.match(/^@([A-Z][a-zA-Z]*)/);
      if (decMatch) {
        tokens.push({ text: "@" + decMatch[1], className: "decorator" });
        pos += decMatch[0].length;
        matched = true;
        continue;
      }
    }

    // Keywords
    const kwRegex = new RegExp("^" + keywords.source.replace(/\\b/g, "\\b"));
    const kwMatch = rest.match(kwRegex);
    if (kwMatch) {
      tokens.push({ text: kwMatch[0], className: "keyword" });
      pos += kwMatch[0].length;
      matched = true;
      continue;
    }

    // Types
    if (types) {
      const typeMatch = rest.match(/^(:\s*)(string|number|boolean|any|void|never|object|symbol|bigint|Array|Map|Set|Promise|Record|Partial|Required|Readonly|Pick|Omit|HTMLElement|EventEmitter|ElementRef|QueryList|Observable|BehaviorSubject|Subject|Promise|ReturnType|Parameters|Extract|Exclude|NonNullable|string|int|long|double|float|bool|object|void|decimal|DateTime|List|Dictionary|IEnumerable|Task|Action|Func|Nullable|Integer|Long|Double|Float|Boolean|Character|ArrayList|HashMap|HashSet|Optional|Stream|Object)\b/);
      if (typeMatch) {
        tokens.push({ text: typeMatch[1], className: "plain" });
        tokens.push({ text: typeMatch[2], className: "type" });
        pos += typeMatch[0].length;
        matched = true;
        continue;
      }
    }

    // Class names (PascalCase)
    const classMatch = rest.match(/^([A-Z][a-zA-Z0-9]*)\b/);
    if (classMatch) {
      tokens.push({ text: classMatch[1], className: "classname" });
      pos += classMatch[0].length;
      matched = true;
      continue;
    }

    // Function calls
    const funcMatch = rest.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/);
    if (funcMatch) {
      tokens.push({ text: funcMatch[1], className: "function" });
      pos += funcMatch[0].length;
      matched = true;
      continue;
    }

    // Numbers
    const numMatch = rest.match(/^(\d+\.?\d*)\b/);
    if (numMatch) {
      tokens.push({ text: numMatch[1], className: "number" });
      pos += numMatch[0].length;
      matched = true;
      continue;
    }

    // Operators
    const opMatch = rest.match(/^([+\-*/%=!<>&|^~?:]+)/);
    if (opMatch) {
      tokens.push({ text: opMatch[1], className: "operator" });
      pos += opMatch[0].length;
      matched = true;
      continue;
    }

    // Plain text
    if (!matched) {
      let nextSpecial = remaining.length;
      for (let i = pos + 1; i < remaining.length; i++) {
        const ch = remaining[i];
        if (/[a-zA-Z@'`"\/\[\]{}()]/.test(ch)) {
          nextSpecial = i;
          break;
        }
      }
      const plainText = remaining.slice(pos, nextSpecial);
      if (plainText) {
        tokens.push({ text: plainText, className: "plain" });
      }
      pos = nextSpecial;
    }
  }

  return tokens;
}

export function highlightCode(code: string, language: string): Token[] {
  if (!code) return [{ text: "", className: "plain" }];

  const lines = code.split("\n");
  const tokens: Token[] = [];

  for (let i = 0; i < lines.length; i++) {
    tokens.push(...tokenizeLine(lines[i], language));
    if (i < lines.length - 1) {
      tokens.push({ text: "\n", className: "plain" });
    }
  }

  return tokens;
}
