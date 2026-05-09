import type { Prisma } from "@prisma/client";
import { jobUserSelect } from "@/server/jobs/selects";

export const escrowMilestoneSelect = {
  id: true,
  contractId: true,
  title: true,
  amount: true,
  status: true,
  submittedAt: true,
  releasedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EscrowMilestoneSelect;

export const escrowContractSelect = {
  id: true,
  clientId: true,
  developerId: true,
  jobId: true,
  amount: true,
  currency: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  client: { select: jobUserSelect },
  developer: { select: jobUserSelect },
  milestone: { select: escrowMilestoneSelect },
  job: {
    select: {
      id: true,
      userId: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.EscrowContractSelect;
