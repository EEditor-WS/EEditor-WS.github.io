/*
Converts simplified Discord/Markdown-like text to HTML.
Features in this version:
- Headers (# to ######)
- Lists: unordered (-, *, +) and ordered (1., 2., ...)
  - Nesting rule: 2 spaces = 1 nesting level
- Blockquotes:
  - "> text" — single-line quote
  - ">>>" — multi-line quote — consumes following non-empty lines until blank line
- Spoilers: ||text|| -> <span class="spoiler">text</span> (click to reveal)
- Paragraphs
- Inline formatting: bold, italic, underline, strikethrough
- Links [text](url)
- Inline code `code` and code blocks ```...```
- Proper HTML-escaping and preventing inline formatting inside code blocks

Usage:
  const html = discordMarkdownToHtml(markdownText);
*/

function discordMarkdownToHtml(input) {
  if (input == null) return '';

  // === Helpers ===
  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // placeholders for code blocks / inline code to avoid processing markup inside them
  const codeBlockPlaceholders = [];
  const inlineCodePlaceholders = [];

  // 1) extract fenced code blocks ```...``` (multiline)
  let text = input.replace(/```([\s\S]*?)```/g, (m, inner) => {
    const idx = codeBlockPlaceholders.length;
    codeBlockPlaceholders.push('<pre><code>' + escapeHtml(inner.replace(/^\n|\n$/g, '')) + '</code></pre>');
    return `\u0000CODEBLOCK${idx}\u0000`;
  });

  // 2) escape HTML in the rest
  text = escapeHtml(text);

  // 3) extract inline code `...` (any number of backticks)
  text = text.replace(/(`+)([\s\S]*?)\1/g, (m, ticks, inner) => {
    const idx = inlineCodePlaceholders.length;
    inlineCodePlaceholders.push('<code>' + escapeHtml(inner) + '</code>');
    return `\u0000INLINECODE${idx}\u0000`;
  });

  // split into lines for block-level processing
  const lines = text.split(/\r?\n/);
  let out = '';

  // stack for lists — elements: {type: 'ul'|'ol', depth: number}
  const listStack = [];
  const closeListsToDepth = (targetDepth) => {
    while (listStack.length > targetDepth) {
      const top = listStack.pop();
      out += top.type === 'ul' ? '</ul>' : '</ol>';
    }
  };

  const pushList = (type, depth) => {
    out += type === 'ul' ? '<ul>' : '<ol>';
    listStack.push({type, depth});
  };

  // iterate lines
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // blank line -> close lists and skip (paragraph boundary)
    if (/^\s*$/.test(line)) {
      closeListsToDepth(0);
      continue;
    }

    // Blockquote multi-line: >>>
    const trimmed = line.trimStart();
    if (trimmed.startsWith('&gt;&gt;&gt;') || trimmed.startsWith('>>>')) {
      // get content after >>> on same line
      let content = trimmed.replace(/^(&gt;){3}|^>{3}/, '').trimStart();
      // gather following non-empty lines until blank line or end
      let j = i + 1;
      while (j < lines.length && !/^\s*$/.test(lines[j])) {
        content += '\n' + lines[j];
        j++;
      }
      i = j - 1; // move main loop forward
      closeListsToDepth(0);
      // content still HTML-escaped; restore inline placeholders
      content = restoreInlinePlaceholders(content);
      content = processInlineFormatting(content);
      out += '<blockquote><p>' + content.replace(/\n/g, '<br/>') + '</p></blockquote>';
      continue;
    }

    // single-line blockquote: > ... (may be nested like >> but treat > as 1 level)
    const bqMatch = line.match(/^(\s*)&gt;?&gt;?\s*(.*)$/) || line.match(/^(\s*)>+\s*(.*)$/);
    if (bqMatch && /^\s*>/.test(line) || /^\s*&gt;/.test(line)) {
      // determine how many leading > characters (we already escaped > to &gt; earlier)
      const raw = line.replace(/^\s*/, '');
      const gtCount = (raw.match(/^(&gt;|>)+/) || [''])[0].replace(/(&gt;)/g, '>').length;
      // take text after the >s
      const after = raw.replace(/^(&gt;|>)+\s*/, '');
      closeListsToDepth(0);
      const content = processInlineFormatting(restoreInlinePlaceholders(after));
      // for nested single-line quotes we can nest blockquotes
      let bqHtml = content;
      for (let k = 0; k < gtCount; k++) bqHtml = '<blockquote>' + bqHtml + '</blockquote>';
      out += bqHtml;
      continue;
    }

    // Headers
    const headerMatch = line.match(/^\s*(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      closeListsToDepth(0);
      const level = headerMatch[1].length;
      const content = processInlineFormatting(restoreInlinePlaceholders(headerMatch[2].trim()));
      out += `<h${level}>${content}</h${level}>`;
      continue;
    }

    // Lists (unordered and ordered). Count leading spaces to compute depth: 2 spaces = 1 level
    const listMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (listMatch || olMatch) {
      const spaces = (listMatch ? listMatch[1] : olMatch[1]).length;
      const depth = Math.floor(spaces / 2);
      const isUl = !!listMatch;
      const itemText = (listMatch ? listMatch[3] : olMatch[3]).trim();

      // synchronize stack depth
      // If current stack deeper than needed -> close
      while (listStack.length > 0 && listStack[listStack.length - 1].depth > depth) {
        closeListsToDepth(listStack.length - 1);
      }

      // If need to open new lists to reach depth
      while (listStack.length <= depth) {
        // if we need one more level and previous top has same type, reuse; else create new
        const newType = isUl ? 'ul' : 'ol';
        pushList(newType, listStack.length);
      }

      // if current top type differs from needed, close it and open correct
      if (listStack.length && listStack[listStack.length - 1].type !== (isUl ? 'ul' : 'ol')) {
        closeListsToDepth(listStack.length - 1);
        pushList(isUl ? 'ul' : 'ol', listStack.length);
      }

      out += '<li>' + processInlineFormatting(restoreInlinePlaceholders(itemText)) + '</li>';
      continue;
    }

    // Normal paragraph
    closeListsToDepth(0);
    out += '<p>' + processInlineFormatting(restoreInlinePlaceholders(line.trim())) + '</p>';
  }

  // close any remaining lists
  closeListsToDepth(0);

  // restore inline code placeholders
  out = out.replace(/\u0000INLINECODE(\d+)\u0000/g, (_, idx) => inlineCodePlaceholders[Number(idx)] || '');
  // restore code block placeholders
  out = out.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_, idx) => codeBlockPlaceholders[Number(idx)] || '');

  return out;

  // ---- utility to restore inline placeholders before running inline formatting ----
  function restoreInlinePlaceholders(s) {
    return s.replace(/\u0000INLINECODE(\d+)\u0000/g, (_, idx) => inlineCodePlaceholders[Number(idx)] || '')
            .replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_, idx) => codeBlockPlaceholders[Number(idx)] || '');
  }

  // process inline formatting (links, spoilers, bold, italic, underline, strike)
  // allowLinks = true/false — when false, link recognition is skipped (used to avoid nested links inside link text)
  function processInlineFormatting(s, allowLinks = true) {
    if (!s) return '';

    // We'll extract top-level links first (if allowed), replace them with placeholders,
    // then run other inline processing, then restore link placeholders.
    const linkPlaceholders = [];
    if (allowLinks) {
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
        // text is already HTML-escaped upstream; but we want to allow other inline formatting
        // inside link text — except links themselves. So process the text with allowLinks = false.
        const processedText = processInlineFormatting(text, false);
        const safeUrl = escapeHtml(url);
        const idx = linkPlaceholders.length;
        // store final anchor HTML to restore after other replacements
        linkPlaceholders.push(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${processedText}</a>`);
        return `\u0000LINK${idx}\u0000`;
      });
    }

    // spoilers ||text|| -> span.spoiler with simple reveal on click
    s = s.replace(/\|\|([\s\S]+?)\|\|/g, (m, inside) => {
      const safeInside = inside; // already escaped
      return `<span class="spoiler" style="background:#444;color:#444;filter:blur(4px);cursor:pointer;" onclick="this.style.filter='none';this.style.color='inherit';this.style.background='transparent';">${safeInside}</span>`;
    });

    // strikethrough
    s = s.replace(/~~([\s\S]+?)~~/g, '<del>$1</del>');
    // bold **text**
    s = s.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
    // underline __text__
    s = s.replace(/__([\s\S]+?)__/g, '<u>$1</u>');
    // italic *text* or _text_ (avoid matching ** and __ which are handled)
    s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    s = s.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

    // restore link placeholders (if any)
    if (allowLinks && linkPlaceholders.length > 0) {
      s = s.replace(/\u0000LINK(\d+)\u0000/g, (_, idx) => linkPlaceholders[Number(idx)] || '');
    }

    return s;
  }
}

// Export for environments like Node or browsers
if (typeof module !== 'undefined' && module.exports) module.exports = { discordMarkdownToHtml };
