export async function safeJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    return null;
  }
}
