-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "rates" TEXT,
    "bannerUrl" TEXT,
    "avatarUrl" TEXT,
    "location" TEXT,
    "website" TEXT,
    "profileType" TEXT NOT NULL DEFAULT 'DEVELOPER',
    "themeColor" TEXT,
    "availability" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("availability", "avatarUrl", "bannerUrl", "bio", "id", "location", "rates", "themeColor", "userId", "verified", "website") SELECT "availability", "avatarUrl", "bannerUrl", "bio", "id", "location", "rates", "themeColor", "userId", "verified", "website" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
