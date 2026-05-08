export function isMediaUrl(text: string): boolean {
  const value = text.trim();
  if (!value.startsWith("http")) return false;

  return (
    /\.(jpg|jpeg|png|gif|webp|svg|mp4|avif)(\?.*)?$/i.test(value) ||
    value.includes("media.tenor.com") ||
    value.includes("media.giphy.com") ||
    value.includes("giphy.com/media") ||
    value.includes("cdn.devlink")
  );
}
