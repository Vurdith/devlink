-- CreateEnum
CREATE TYPE "MessagePermission" AS ENUM ('EVERYONE', 'FOLLOWERS', 'FOLLOWING', 'MUTUALS', 'NONE');

-- CreateEnum
CREATE TYPE "MessageRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "UserMessagingSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "allowFrom" "MessagePermission" NOT NULL DEFAULT 'EVERYONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMessagingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" "MessageRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMessagingSettings_userId_key" ON "UserMessagingSettings"("userId");

-- CreateIndex
CREATE INDEX "MessageRequest_recipientId_status_idx" ON "MessageRequest"("recipientId", "status");

-- CreateIndex
CREATE INDEX "MessageRequest_senderId_status_idx" ON "MessageRequest"("senderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRequest_senderId_recipientId_key" ON "MessageRequest"("senderId", "recipientId");

-- AddForeignKey
ALTER TABLE "UserMessagingSettings" ADD CONSTRAINT "UserMessagingSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRequest" ADD CONSTRAINT "MessageRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRequest" ADD CONSTRAINT "MessageRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
