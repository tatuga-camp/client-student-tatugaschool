const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** True when a draft has nothing to send. */
export function commentDraftIsEmpty(text: string): boolean {
  return text.trim().length === 0;
}

/**
 * Comment bodies are HTML (the teacher app renders them as such), so a plain
 * text draft is escaped and its line breaks kept before it is sent.
 */
export function plainTextToCommentHtml(text: string): string {
  const body = text
    .trim()
    .replace(/[&<>"']/g, (ch) => ESCAPES[ch])
    .replace(/\r\n|\r|\n/g, "<br>");
  return `<p>${body}</p>`;
}
