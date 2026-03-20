import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "span"];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title"],
  span: ["class"],
};

export function sanitizeContent(content: string): string {
  return sanitizeHtml(content, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    disallowedTagsMode: "discard",
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
  });
}

export function sanitizePlainText(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

export function sanitizeLocation(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}
