import type { Prisma } from "@prisma/client";

export const jobUserSelect = {
  id: true,
  username: true,
  name: true,
  image: true,
  profile: {
    select: {
      id: true,
      userId: true,
      avatarUrl: true,
      bannerUrl: true,
      profileType: true,
      verified: true,
      bio: true,
      website: true,
      location: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;

export const jobSummarySelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  budgetMin: true,
  budgetMax: true,
  currency: true,
  skills: true,
  location: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: { select: jobUserSelect },
  _count: { select: { applications: true } },
} satisfies Prisma.JobSelect;

export const jobApplicationSelect = {
  id: true,
  jobId: true,
  applicantId: true,
  status: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  applicant: { select: jobUserSelect },
} satisfies Prisma.JobApplicationSelect;

export const jobApplicationWithJobSelect = {
  id: true,
  jobId: true,
  applicantId: true,
  status: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  job: { select: jobSummarySelect },
} satisfies Prisma.JobApplicationSelect;
