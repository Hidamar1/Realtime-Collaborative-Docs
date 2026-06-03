const entityMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function sanitizeCommentText(input: string): string {
  return input.replace(/[&<>"']/g, (char) => entityMap[char]);
}

export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function sanitizeRichTextHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\s+on[a-z]+="[^"]*"/gi, '')
    .replace(/\s+on[a-z]+='[^']*'/gi, '');
}
