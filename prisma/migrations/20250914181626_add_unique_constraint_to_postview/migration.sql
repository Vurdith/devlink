/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `PostView` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostView_postId_userId_key" ON "PostView"("postId", "userId");
