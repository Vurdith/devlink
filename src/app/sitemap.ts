import { MetadataRoute } from 'next';
import { prisma } from '@/server/db';

/**
 * Dynamic sitemap generation for SEO
 * Includes static pages and dynamic user profiles
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://devlink.ink';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic user profiles (verified users or users with posts)
  try {
    const [users, posts, jobs] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { profile: { verified: true } },
            { posts: { some: {} } },
          ],
        },
        select: {
          username: true,
          updatedAt: true,
        },
        take: 1000,
        orderBy: { updatedAt: 'desc' },
      }),

      // Published top-level posts (not replies, not scheduled)
      prisma.post.findMany({
        where: {
          replyToId: null,
          isScheduled: false,
        },
        select: { id: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      }),

      // Active job listings
      prisma.job.findMany({
        where: { status: 'OPEN' },
        select: { id: true, updatedAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1000,
      }),
    ]);

    const userPages: MetadataRoute.Sitemap = users.map((user) => ({
      url: `${baseUrl}/u/${user.username}`,
      lastModified: user.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/p/${post.id}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    const jobUrls: MetadataRoute.Sitemap = jobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    return [...staticPages, ...userPages, ...postUrls, ...jobUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only if database query fails
    return staticPages;
  }
}




