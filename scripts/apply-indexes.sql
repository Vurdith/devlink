-- Post compound indexes for faster queries
CREATE INDEX IF NOT EXISTS "Post_replyToId_createdAt_idx" ON "Post"("replyToId", "createdAt");
CREATE INDEX IF NOT EXISTS "Post_userId_isPinned_createdAt_idx" ON "Post"("userId", "isPinned", "createdAt");

-- PostHashtag indexes for hashtag pages
CREATE INDEX IF NOT EXISTS "PostHashtag_hashtagId_idx" ON "PostHashtag"("hashtagId");
CREATE INDEX IF NOT EXISTS "PostHashtag_postId_idx" ON "PostHashtag"("postId");

-- PostMedia index for faster media lookup
CREATE INDEX IF NOT EXISTS "PostMedia_postId_idx" ON "PostMedia"("postId");

