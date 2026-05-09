-- Add composite indexes for user-scoped escrow contract pagination.
CREATE INDEX "EscrowContract_clientId_createdAt_idx" ON "EscrowContract"("clientId", "createdAt");
CREATE INDEX "EscrowContract_developerId_createdAt_idx" ON "EscrowContract"("developerId", "createdAt");
