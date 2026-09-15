/**
 * Simple syntax highlighter for TypeScript/Angular code
 * Returns JSX elements with colored spans
 */
export function highlightCode(code: string, language: string): { text: string; className: string }[] {
  if (!code) return [{ text: "", className: "plain" }];

  const tokens: { text: string; className: string }[] = [];
  
  // Keywords
  const keywords = /\b(import|export|from|class|extends|implements|interface|type|enum|const|let|var|function|return|if|else|switch|case|break|default|for|while|do|new|this|super|static|public|private|protected|readonly|abstract|async|await|yield|throw|try|catch|finally|void|null|undefined|true|false|typeof|instanceof|in|of|as|is|keyof|infer)\b/g;
  
  // Decorators
  const decorators = /@(Component|Injectable|Directive|Pipe|NgModule|Input|Output|HostBinding|HostListener|ViewChild|ContentChild|ContentChildren|ViewChildren|Host|Self|SkipSelf|Optional|Inject)\b/g;
  
  // Strings (single, double, template)
  const strings = /(['"`])(?:(?!\1|\\).|\\.)*\1/g;
  
  // Properties/variables in object literals
  const properties = /\b(selector|template|templateUrl|styleUrls|styles|providers|imports|exports|changeDetection|encapsulation|moduleId|host|animations|queries|inputs|outputs)\b/g;
  
  // Class names (PascalCase)
  const classNames = /\b([A-Z][a-zA-Z0-9]*)\b/g;
  
  // Numbers
  const numbers = /\b(\d+\.?\d*)\b/g;
  
  // Comments
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  
  // Type annotations
  const types = /:\s*(string|number|boolean|any|void|never|object|symbol|bigint|Array|Map|Set|Promise|Record|Partial|Required|Readonly|Pick|Omit|HTMLElement|EventEmitter|ElementRef|QueryList|Observable|BehaviorSubject|Subject)\b/g;

  // Split code into lines for line-by-line processing
  const lines = code.split('\n');
  
  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let remaining = line;
    let pos = 0;
    
    while (pos < remaining.length) {
      let matched = false;
      
      // Try to match patterns at current position
      
      // Check for comments first
      const commentMatch = remaining.slice(pos).match(/^(\/\/.*$)/);
      if (commentMatch) {
        tokens.push({ text: commentMatch[1], className: "comment" });
        pos += commentMatch[1].length;
        matched = true;
        continue;
      }
      
      // Check for strings
      const strMatch = remaining.slice(pos).match(/^(['"`])(?:(?!\1|\\).|\\.)*\1/);
      if (strMatch) {
        tokens.push({ text: strMatch[0], className: "string" });
        pos += strMatch[0].length;
        matched = true;
        continue;
      }
      
      // Check for decorators
      const decMatch = remaining.slice(pos).match(/^@([A-Z][a-zA-Z]*)/);
      if (decMatch) {
        tokens.push({ text: "@" + decMatch[1], className: "decorator" });
        pos += decMatch[0].length;
        matched = true;
        continue;
      }
      
      // Check for keywords
      const kwMatch = remaining.slice(pos).match(/^(import|export|from|class|extends|implements|interface|type|enum|const|let|var|function|return|if|else|switch|case|break|default|for|while|do|new|this|super|static|public|private|protected|readonly|abstract|async|await|yield|throw|try|catch|finally|void|null|undefined|true|false|typeof|instanceof|in|of|as|is|keyof|infer)\b/);
      if (kwMatch) {
        tokens.push({ text: kwMatch[0], className: "keyword" });
        pos += kwMatch[0].length;
        matched = true;
        continue;
      }
      
      // Check for properties
      const propMatch = remaining.slice(pos).match(/^(selector|template|templateUrl|styleUrls|styles|providers|imports|exports|changeDetection|encapsulation|moduleId|host|animations|queries|inputs|outputs)\b/);
      if (propMatch) {
        tokens.push({ text: propMatch[0], className: "property" });
        pos += propMatch[0].length;
        matched = true;
        continue;
      }
      
      // Check for class names (PascalCase)
      const classMatch = remaining.slice(pos).match(/^([A-Z][a-zA-Z0-9]*)\b/);
      if (classMatch) {
        tokens.push({ text: classMatch[1], className: "classname" });
        pos += classMatch[0].length;
        matched = true;
        continue;
      }
      
      // Check for numbers
      const numMatch = remaining.slice(pos).match(/^(\d+\.?\d*)\b/);
      if (numMatch) {
        tokens.push({ text: numMatch[1], className: "number" });
        pos += numMatch[0].length;
        matched = true;
        continue;
      }
      
      // Check for type annotations
      const typeMatch = remaining.slice(pos).match(/^(:\s*)(string|number|boolean|any|void|never|object|symbol|bigint|Array|Map|Set|Promise|Record|Partial|Required|Readonly|Pick|Omit|HTMLElement|EventEmitter|ElementRef|QueryList|Observable|BehaviorSubject|Subject)\b/);
      if (typeMatch) {
        tokens.push({ text: typeMatch[1], className: "plain" });
        tokens.push({ text: typeMatch[2], className: "type" });
        pos += typeMatch[0].length;
        matched = true;
        continue;
      }
      
      // If nothing matched, take one character as plain text
      if (!matched) {
        // Find next special character or end of string
        let nextSpecial = remaining.length;
        for (let i = pos + 1; i < remaining.length; i++) {
          const ch = remaining[i];
          if (/[a-zA-Z@'`"]/.test(ch)) {
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
    
    // Add newline token between lines (not after last line)
    if (lineIdx < lines.length - 1) {
      tokens.push({ text: "\n", className: "plain" });
    }
  }
  
  return tokens;
}
