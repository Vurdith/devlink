-- Create enums
CREATE TYPE "ConversationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');
CREATE TYPE "ConversationInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- Create Conversation tables
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ConversationRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ConversationInvite" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "status" "ConversationInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationInvite_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageAttachment_pkey" PRIMARY KEY ("id")
);

-- Add conversationId to Message (nullable first)
ALTER TABLE "Message" ADD COLUMN "conversationId" TEXT;

-- Backfill Conversation from MessageThread
INSERT INTO "Conversation" ("id", "title", "isGroup", "createdById", "lastMessageAt", "createdAt", "updatedAt")
SELECT "id", NULL, false, NULL, "lastMessageAt", "createdAt", "updatedAt"
FROM "MessageThread";

-- Backfill Conversation members from MessageThread
INSERT INTO "ConversationMember" ("id", "conversationId", "userId", "role", "joinedAt", "createdAt")
SELECT concat("id", '_A'), "id", "userAId", 'MEMBER', "createdAt", "createdAt"
FROM "MessageThread";

INSERT INTO "ConversationMember" ("id", "conversationId", "userId", "role", "joinedAt", "createdAt")
SELECT concat("id", '_B'), "id", "userBId", 'MEMBER', "createdAt", "createdAt"
FROM "MessageThread";

-- Backfill Message.conversationId from Message.threadId
UPDATE "Message" SET "conversationId" = "threadId";

-- Enforce non-null and drop old threadId
ALTER TABLE "Message" ALTER COLUMN "conversationId" SET NOT NULL;
ALTER TABLE "Message" DROP COLUMN "threadId";

-- Drop MessageThread table
DROP TABLE "MessageThread";

-- Indexes and constraints
CREATE UNIQUE INDEX "ConversationMember_conversationId_userId_key" ON "ConversationMember"("conversationId", "userId");
CREATE INDEX "ConversationMember_conversationId_idx" ON "ConversationMember"("conversationId");
CREATE INDEX "ConversationMember_userId_idx" ON "ConversationMember"("userId");
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX "Conversation_createdById_idx" ON "Conversation"("createdById");
CREATE UNIQUE INDEX "ConversationInvite_conversationId_inviteeId_key" ON "ConversationInvite"("conversationId", "inviteeId");
CREATE INDEX "ConversationInvite_inviteeId_status_idx" ON "ConversationInvite"("inviteeId", "status");
CREATE INDEX "ConversationInvite_inviterId_status_idx" ON "ConversationInvite"("inviterId", "status");
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- Foreign keys
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationMember" ADD CONSTRAINT "ConversationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationInvite" ADD CONSTRAINT "ConversationInvite_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationInvite" ADD CONSTRAINT "ConversationInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationInvite" ADD CONSTRAINT "ConversationInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageAttachment" ADD CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
