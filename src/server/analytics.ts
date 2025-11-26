import { prisma } from "@/server/db";
import { differenceInDays, eachDayOfInterval, format } from "date-fns";

export async function getPostAnalyticsTimeSeries(postId: string) {
  // 1. Fetch the post creation date
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { createdAt: true },
  });

  if (!post) return [];

  const now = new Date();
  const startDate = post.createdAt;

  // 2. Fetch all interaction timestamps (optimized for large datasets)
  // In a massive scale app, we'd use groupBy/date_trunc in SQL. 
  // For "thousands of users", fetching timestamps of ~10k interactions is still < 10ms.
  const [views, likes, reposts, replies, saves] = await Promise.all([
    prisma.postView.findMany({
      where: { postId },
      select: { viewedAt: true },
      orderBy: { viewedAt: "asc" },
    }),
    prisma.postLike.findMany({
      where: { postId },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.postRepost.findMany({
      where: { postId },
      select: { createdAt: true },
    }),
    prisma.post.findMany({
      where: { replyToId: postId },
      select: { createdAt: true },
    }),
    prisma.savedPost.findMany({
      where: { postId },
      select: { createdAt: true },
    }),
  ]);

  // 3. Generate a map of all dates from creation to now
  // This ensures the chart doesn't have "missing days" (which look like gaps)
  const dayMap = new Map<string, { views: number; likes: number; engagements: number }>();
  
  // If post is less than 24h old, show hourly segments? 
  // For simplicity and robustness, we'll stick to daily for "activity over time" 
  // unless it's very new, but let's just do daily for now to match the UI request.
  const days = eachDayOfInterval({
    start: startDate,
    end: now,
  });

  // Initialize all days with 0
  days.forEach((day) => {
    dayMap.set(format(day, "yyyy-MM-dd"), { views: 0, likes: 0, engagements: 0 });
  });

  // Helper to fill data
  const fill = (items: { createdAt?: Date; viewedAt?: Date }[], type: "views" | "likes" | "engagements") => {
    items.forEach((item) => {
      const date = item.createdAt || item.viewedAt;
      if (!date) return;
      const key = format(date, "yyyy-MM-dd");
      const entry = dayMap.get(key);
      if (entry) {
        entry[type]++;
        dayMap.set(key, entry);
      } else {
         // If for some reason the date is outside our interval (e.g. time zone edge cases), add it
         // This shouldn't strictly happen with 'eachDayOfInterval' covering start->end, 
         // but 'now' might have moved slightly.
         // We'll ignore out-of-bounds for graph cleanliness or add them if strictly needed.
         // Let's ignore to keep the x-axis clean.
      }
    });
  };

  fill(views, "views");
  fill(likes, "likes");
  // Engagements = Likes + Reposts + Replies + Saves
  fill(likes, "engagements");
  fill(reposts, "engagements");
  fill(replies, "engagements");
  fill(saves, "engagements");

  // 4. Convert to array and format for Recharts
  return Array.from(dayMap.entries()).map(([dateStr, data]) => ({
    date: format(new Date(dateStr), "MMM d"), // "Jan 1"
    ...data,
    // Keep the raw ISO string for sorting if needed, but Map insertion order 
    // + eachDayOfInterval usually keeps it sorted.
  }));
}


