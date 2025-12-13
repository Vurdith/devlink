-- Create PortfolioItemSkill join table (baseline hotfix)
-- NOTE: This is safe to run once on an existing database that lacks the table.

CREATE TABLE IF NOT EXISTS "PortfolioItemSkill" (
  "id" TEXT NOT NULL,
  "portfolioItemId" TEXT NOT NULL,
  "skillId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PortfolioItemSkill_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PortfolioItemSkill_portfolioItemId_idx" ON "PortfolioItemSkill"("portfolioItemId");
CREATE INDEX IF NOT EXISTS "PortfolioItemSkill_skillId_idx" ON "PortfolioItemSkill"("skillId");
CREATE UNIQUE INDEX IF NOT EXISTS "PortfolioItemSkill_portfolioItemId_skillId_key" ON "PortfolioItemSkill"("portfolioItemId", "skillId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PortfolioItemSkill_portfolioItemId_fkey'
  ) THEN
    ALTER TABLE "PortfolioItemSkill"
      ADD CONSTRAINT "PortfolioItemSkill_portfolioItemId_fkey"
      FOREIGN KEY ("portfolioItemId")
      REFERENCES "PortfolioItem"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PortfolioItemSkill_skillId_fkey'
  ) THEN
    ALTER TABLE "PortfolioItemSkill"
      ADD CONSTRAINT "PortfolioItemSkill_skillId_fkey"
      FOREIGN KEY ("skillId")
      REFERENCES "Skill"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;


