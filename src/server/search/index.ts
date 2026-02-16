type SearchProvider = "prisma" | "meilisearch" | "typesense";

function getProvider(): SearchProvider {
  const provider = (process.env.SEARCH_PROVIDER || "prisma").toLowerCase();
  if (provider === "meilisearch") return "meilisearch";
  if (provider === "typesense") return "typesense";
  return "prisma";
}

export async function searchPostsIndex(query: string, limit = 20): Promise<string[]> {
  const provider = getProvider();
  if (provider === "prisma") return [];

  try {
    if (provider === "meilisearch" && process.env.MEILI_URL && process.env.MEILI_API_KEY) {
      const response = await fetch(`${process.env.MEILI_URL}/indexes/posts/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MEILI_API_KEY}`,
        },
        body: JSON.stringify({
          q: query,
          limit,
          attributesToRetrieve: ["id"],
        }),
        cache: "no-store",
      });
      if (!response.ok) return [];
      const data = (await response.json()) as { hits?: Array<{ id?: string }> };
      return (data.hits ?? []).map((h) => h.id).filter((id): id is string => Boolean(id));
    }

    if (
      provider === "typesense" &&
      process.env.TYPESENSE_URL &&
      process.env.TYPESENSE_API_KEY
    ) {
      const params = new URLSearchParams({
        q: query,
        query_by: "content",
        per_page: String(limit),
      });
      const response = await fetch(
        `${process.env.TYPESENSE_URL}/collections/posts/documents/search?${params.toString()}`,
        {
          headers: {
            "X-TYPESENSE-API-KEY": process.env.TYPESENSE_API_KEY,
          },
          cache: "no-store",
        }
      );
      if (!response.ok) return [];
      const data = (await response.json()) as { hits?: Array<{ document?: { id?: string } }> };
      return (data.hits ?? [])
        .map((h) => h.document?.id)
        .filter((id): id is string => Boolean(id));
    }
  } catch (error) {
    console.error("[Search] index lookup failed:", error);
  }

  return [];
}
