-- CreateTable
CREATE TABLE "NotificationActor" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationActor_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "NotificationActor_notificationId_actorId_key" ON "NotificationActor"("notificationId", "actorId");
CREATE INDEX "NotificationActor_notificationId_idx" ON "NotificationActor"("notificationId");
CREATE INDEX "NotificationActor_actorId_idx" ON "NotificationActor"("actorId");
CREATE INDEX "NotificationActor_createdAt_idx" ON "NotificationActor"("createdAt");

-- FKs
ALTER TABLE "NotificationActor"
ADD CONSTRAINT "NotificationActor_notificationId_fkey"
FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationActor"
ADD CONSTRAINT "NotificationActor_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


