export function parseCommaSeparated(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function capitalizeCategory(category?: string): string {
  if (!category) return "";
  return category.charAt(0).toUpperCase() + category.slice(1);
}
