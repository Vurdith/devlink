/**
 * Parse hashtags and mentions from post content
 */

export interface ParsedContent {
  text: string;
  hashtags: string[];
  mentions: string[];
}

/**
 * Extract hashtags from text (e.g., #hashtag)
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
}

/**
 * Extract mentions from text (e.g., @username)
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(mention => mention.substring(1)) : [];
}

/**
 * Parse content to extract hashtags and mentions
 */
export function parseContent(content: string): ParsedContent {
  return {
    text: content,
    hashtags: extractHashtags(content),
    mentions: extractMentions(content)
  };
}

/**
 * Check if content contains hashtags or mentions
 */
export function hasHashtagsOrMentions(content: string): boolean {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  return hashtagRegex.test(content) || mentionRegex.test(content);
}
