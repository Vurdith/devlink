CREATE TABLE "UserNotificationSettings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "likes" BOOLEAN NOT NULL DEFAULT true,
  "reposts" BOOLEAN NOT NULL DEFAULT true,
  "replies" BOOLEAN NOT NULL DEFAULT true,
  "mentions" BOOLEAN NOT NULL DEFAULT true,
  "follows" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserNotificationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserNotificationSettings_userId_key" ON "UserNotificationSettings"("userId");

ALTER TABLE "UserNotificationSettings"
ADD CONSTRAINT "UserNotificationSettings_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
