export const REVIEW_PREVIEW_CHARS = 120;

/** Keep short reviews intact; reserve one character for the ellipsis. */
export function reviewExcerpt(text: string, limit = REVIEW_PREVIEW_CHARS) {
  const characters = Array.from(text);
  if (characters.length <= limit) return { text, truncated: false };

  let preview = characters.slice(0, Math.max(0, limit - 1)).join('').trimEnd();
  // Prefer a whole word, unless the review begins with a single long word.
  if (characters[limit - 1] && !/\s/.test(characters[limit - 1]!)) {
    const wordBoundary = preview.lastIndexOf(' ');
    if (wordBoundary > 0) preview = preview.slice(0, wordBoundary).trimEnd();
  }
  return { text: `${preview}…`, truncated: true };
}
