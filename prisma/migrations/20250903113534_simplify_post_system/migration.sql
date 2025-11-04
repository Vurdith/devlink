/*
  Warnings:

  - You are about to drop the column `budget` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postType` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `projectCategory` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `projectTitle` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `timeline` on the `Post` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "replyToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Post_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("content", "createdAt", "id", "isPinned", "mediaUrl", "replyToId", "updatedAt", "userId") SELECT "content", "createdAt", "id", "isPinned", "mediaUrl", "replyToId", "updatedAt", "userId" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
