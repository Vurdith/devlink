/**
 * Migration script to update R2 URLs from pub-xxx.r2.dev to cdn.devlink.ink
 * Run with: npx ts-node scripts/migrate-cdn-urls.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OLD_URL = "pub-ea722416a40b40849162fc1e5c82e2b5.r2.dev";
const NEW_URL = "cdn.devlink.ink";

async function migrateUrls() {
  console.log("🚀 Starting CDN URL migration...\n");
  console.log(`Old URL: ${OLD_URL}`);
  console.log(`New URL: ${NEW_URL}\n`);

  // 1. Update Profile avatarUrl
  const avatarResult = await prisma.$executeRaw`
    UPDATE "Profile" 
    SET "avatarUrl" = REPLACE("avatarUrl", ${OLD_URL}, ${NEW_URL})
    WHERE "avatarUrl" LIKE ${"%" + OLD_URL + "%"}
  `;
  console.log(`✅ Updated ${avatarResult} profile avatars`);

  // 2. Update Profile bannerUrl
  const bannerResult = await prisma.$executeRaw`
    UPDATE "Profile" 
    SET "bannerUrl" = REPLACE("bannerUrl", ${OLD_URL}, ${NEW_URL})
    WHERE "bannerUrl" LIKE ${"%" + OLD_URL + "%"}
  `;
  console.log(`✅ Updated ${bannerResult} profile banners`);

  // 3. Update PostMedia mediaUrl
  const mediaResult = await prisma.$executeRaw`
    UPDATE "PostMedia" 
    SET "mediaUrl" = REPLACE("mediaUrl", ${OLD_URL}, ${NEW_URL})
    WHERE "mediaUrl" LIKE ${"%" + OLD_URL + "%"}
  `;
  console.log(`✅ Updated ${mediaResult} post media URLs`);

  // 4. Update PortfolioItem mediaUrls (JSON string)
  const portfolioResult = await prisma.$executeRaw`
    UPDATE "PortfolioItem" 
    SET "mediaUrls" = REPLACE("mediaUrls", ${OLD_URL}, ${NEW_URL})
    WHERE "mediaUrls" LIKE ${"%" + OLD_URL + "%"}
  `;
  console.log(`✅ Updated ${portfolioResult} portfolio items`);

  // 5. Update User image (if any are from R2)
  const userImageResult = await prisma.$executeRaw`
    UPDATE "User" 
    SET "image" = REPLACE("image", ${OLD_URL}, ${NEW_URL})
    WHERE "image" LIKE ${"%" + OLD_URL + "%"}
  `;
  console.log(`✅ Updated ${userImageResult} user images`);

  console.log("\n🎉 Migration complete!");
  
  // Show summary
  const totalUpdated = avatarResult + bannerResult + mediaResult + portfolioResult + userImageResult;
  console.log(`\nTotal records updated: ${totalUpdated}`);
}

async function main() {
  try {
    await migrateUrls();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

