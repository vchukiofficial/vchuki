/**
 * The website renders journal posts as HTML. Staff write on the phone in simple text:
 *   blank line = new paragraph · "## " heading · "### " sub-heading · "- " bullet · **bold**
 * These two functions convert between the two so the editor round-trips existing posts.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s: string) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

export function textToHtml(text: string): string {
  const out: string[] = [];
  for (const block of text.replace(/\r/g, '').split(/\n{2,}/)) {
    const lines = block.split('\n').filter((l) => l.trim());
    if (!lines.length) continue;
    if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`);
    } else if (lines.every((l) => /^\s*\d+\.\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ''))}</li>`).join('')}</ol>`);
    } else if (/^###\s/.test(lines[0]) && lines.length === 1) {
      out.push(`<h3>${inline(lines[0].slice(4))}</h3>`);
    } else if (/^##\s/.test(lines[0]) && lines.length === 1) {
      out.push(`<h2>${inline(lines[0].slice(3))}</h2>`);
    } else {
      // A heading followed directly by text on the next line
      const [first, ...rest] = lines;
      if (/^#{2,3}\s/.test(first)) {
        out.push(first.startsWith('###') ? `<h3>${inline(first.slice(4))}</h3>` : `<h2>${inline(first.slice(3))}</h2>`);
        if (rest.length) out.push(`<p>${rest.map(inline).join('<br/>')}</p>`);
      } else {
        out.push(`<p>${lines.map(inline).join('<br/>')}</p>`);
      }
    }
  }
  return out.join('');
}

export function htmlToText(html: string): string {
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;
  return html
    .replace(/\r|\n/g, ' ')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h[34][^>]*>([\s\S]*?)<\/h[34]>/gi, '\n\n### $1\n\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n\n')
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
