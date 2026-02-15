import type { Metadata } from "next";
import { prisma } from "@/server/db";

export async function generateMetadata({ params }: { params: Promise<{ jobId: string }> }): Promise<Metadata> {
  const { jobId } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      title: true,
      description: true,
      location: true,
      user: { select: { username: true } },
    },
  });
  if (!job) return { title: "Job Not Found — DevLink" };
  const title = `${job.title} — DevLink Jobs`;
  const description = job.description?.slice(0, 160) || `${job.title} — posted on DevLink.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default function JobDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
