import { Image } from 'expo-image';
import { View } from 'react-native';
import { img } from '@/lib/api';
import { colors, fonts, radius } from '@/theme';
import { T } from './ui';

/**
 * Renders blog HTML (or Markdown-ish text) natively, without a WebView.
 * Handles the blocks the journal uses: headings, paragraphs, lists, quotes, images, links (as text).
 */
type Block =
  | { k: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { k: 'li'; text: string; n?: number }
  | { k: 'img'; src: string };

const decode = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, '’')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .trim();

function parse(src: string): Block[] {
  const out: Block[] = [];
  if (!/<[a-z][\s\S]*>/i.test(src)) {
    // Markdown-ish plain text
    let n = 0;
    for (const raw of src.split(/\n{1,}/)) {
      const line = raw.trim();
      if (!line) continue;
      if (/^###\s/.test(line)) out.push({ k: 'h3', text: decode(line.replace(/^###\s/, '')) });
      else if (/^##?\s/.test(line)) out.push({ k: 'h2', text: decode(line.replace(/^##?\s/, '')) });
      else if (/^[-*]\s/.test(line)) out.push({ k: 'li', text: decode(line.slice(2)) });
      else if (/^\d+\.\s/.test(line)) out.push({ k: 'li', text: decode(line.replace(/^\d+\.\s/, '')), n: ++n });
      else if (/^>\s?/.test(line)) out.push({ k: 'quote', text: decode(line.replace(/^>\s?/, '')) });
      else out.push({ k: 'p', text: decode(line) });
    }
    return out;
  }
  const tokens = src.replace(/\r/g, '').split(/(?=<(?:h[1-6]|p|li|blockquote|img|ol|ul)\b)/i);
  let olCount = 0;
  let inOl = false;
  for (const t of tokens) {
    const m = /^<(h[1-6]|p|li|blockquote|img|ol|ul)\b([^>]*)>([\s\S]*)/i.exec(t);
    if (!m) {
      const text = decode(t);
      if (text) out.push({ k: 'p', text });
      continue;
    }
    const tag = m[1].toLowerCase();
    const body = m[3].replace(new RegExp(`</${tag}>[\\s\\S]*$`, 'i'), '');
    if (tag === 'ol') {
      inOl = true;
      olCount = 0;
      continue;
    }
    if (tag === 'ul') {
      inOl = false;
      continue;
    }
    if (tag === 'img') {
      const s = /src=["']([^"']+)/i.exec(m[2])?.[1];
      if (s) out.push({ k: 'img', src: s });
      continue;
    }
    const text = decode(body);
    if (!text) continue;
    if (tag === 'h1' || tag === 'h2') out.push({ k: 'h2', text });
    else if (tag.startsWith('h')) out.push({ k: 'h3', text });
    else if (tag === 'li') out.push({ k: 'li', text, n: inOl ? ++olCount : undefined });
    else if (tag === 'blockquote') out.push({ k: 'quote', text });
    else out.push({ k: 'p', text });
  }
  return out;
}

export function RichText({ html }: { html: string }) {
  const blocks = parse(html || '');
  return (
    <View>
      {blocks.map((b, i) => {
        switch (b.k) {
          case 'h2':
            return (
              <T key={i} v="h2" style={{ marginTop: 26, marginBottom: 8 }}>
                {b.text}
              </T>
            );
          case 'h3':
            return (
              <T key={i} v="h3" style={{ marginTop: 20, marginBottom: 6 }}>
                {b.text}
              </T>
            );
          case 'li':
            return (
              <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 8, paddingLeft: 4 }}>
                <T v="body" style={{ color: colors.accentDeep, fontFamily: fonts.semibold, width: 18 }}>
                  {b.n ? `${b.n}.` : '•'}
                </T>
                <T v="body" style={{ flex: 1, fontSize: 16, lineHeight: 26 }}>
                  {b.text}
                </T>
              </View>
            );
          case 'quote':
            return (
              <View key={i} style={{ borderLeftWidth: 2, borderColor: colors.accent, paddingLeft: 16, marginVertical: 14 }}>
                <T style={{ fontFamily: fonts.displayItalic, fontSize: 19, lineHeight: 28, color: colors.ink }}>{b.text}</T>
              </View>
            );
          case 'img':
            return <Image key={i} source={{ uri: img(b.src) }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md, marginVertical: 14, backgroundColor: colors.sand }} contentFit="cover" />;
          default:
            return (
              <T key={i} v="body" style={{ fontSize: 16, lineHeight: 27, marginBottom: 14 }}>
                {b.text}
              </T>
            );
        }
      })}
    </View>
  );
}
