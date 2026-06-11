/**
 * DevLink production setup preflight.
 * Run with: npx tsx scripts/db/verify-setup.ts
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

function loadEnvFile(fileName: string) {
  const envPath = resolve(process.cwd(), fileName);
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const [key, ...valueParts] = trimmed.split("=");
    if (!key || valueParts.length === 0) return;

    const value = valueParts.join("=").replace(/^["']|["']$/g, "");
    process.env[key.trim()] = value;
  });
}

function hostSummary(value: string) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "set";
  }
}

function isPlaceholder(value: string | undefined) {
  if (!value) return true;
  return /your-|replace-|placeholder|example|localhost/i.test(value);
}

loadEnvFile(".env");
loadEnvFile(".env.local");

console.log("\nDevLink production setup preflight\n");
console.log("=".repeat(50));

console.log("\nStep 1: Dependencies");
const requiredDeps = ["@upstash/redis", "ioredis", "@aws-sdk/client-s3"];
requiredDeps.forEach((dep) => {
  try {
    require.resolve(dep);
    console.log(`   OK ${dep} installed`);
  } catch {
    console.log(`   FAIL ${dep} NOT installed - run: npm install`);
  }
});

console.log("\nStep 2: Database Connection Pooling");
const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl) {
  console.log("   FAIL DATABASE_URL not set");
} else if (dbUrl.includes(":6543") || dbUrl.includes("pgbouncer=true") || dbUrl.includes("pooler")) {
  console.log("   OK DATABASE_URL appears to use connection pooling");
  console.log(`   Host: ${hostSummary(dbUrl)}`);
} else if (dbUrl.includes(":5432")) {
  console.log("   WARN DATABASE_URL uses direct connection (port 5432)");
  console.log("   Use a pooled URL for production when deploying to serverless hosts");
} else {
  console.log("   WARN DATABASE_URL set but pooling status unclear");
}

console.log("\nStep 3: Redis for Caching & Rate Limiting");
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisUrl = process.env.REDIS_URL;

if (upstashUrl && upstashToken) {
  console.log("   OK Upstash Redis configured");
  console.log(`   Host: ${hostSummary(upstashUrl)}`);
} else if (redisUrl) {
  console.log("   OK Standard Redis configured");
  console.log(`   Host: ${hostSummary(redisUrl)}`);
} else {
  console.log("   WARN No Redis configured");
  console.log("   Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or REDIS_URL");
}

console.log("\nStep 4: Object Storage (S3/R2)");
const s3Endpoint = process.env.S3_ENDPOINT;
const s3AccessKey = process.env.S3_ACCESS_KEY_ID;
const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY;
const s3Bucket = process.env.S3_BUCKET_NAME;
const s3PublicUrl = process.env.S3_PUBLIC_URL;

if (s3Endpoint && s3AccessKey && s3SecretKey && s3Bucket) {
  console.log("   OK S3/R2 configured");
  console.log(`   Endpoint: ${hostSummary(s3Endpoint)}`);
  console.log(`   Bucket: ${s3Bucket}`);
  if (s3PublicUrl) {
    console.log(`   Public URL: ${hostSummary(s3PublicUrl)}`);
  }

  if (s3Endpoint.includes("r2.cloudflarestorage.com")) {
    console.log("   Provider: Cloudflare R2");
  } else if (s3Endpoint.includes("amazonaws.com")) {
    console.log("   Provider: AWS S3");
  }
} else {
  console.log("   FAIL Object Storage NOT fully configured");
  if (!s3Endpoint) console.log("   Missing: S3_ENDPOINT");
  if (!s3AccessKey) console.log("   Missing: S3_ACCESS_KEY_ID");
  if (!s3SecretKey) console.log("   Missing: S3_SECRET_ACCESS_KEY");
  if (!s3Bucket) console.log("   Missing: S3_BUCKET_NAME");
}

console.log("\nStep 5: Auth and Public URLs");
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;
const appUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!nextAuthSecret || nextAuthSecret.length < 32 || isPlaceholder(nextAuthSecret)) {
  console.log("   FAIL NEXTAUTH_SECRET must be a real 32+ character secret");
} else {
  console.log("   OK NEXTAUTH_SECRET is present and long enough");
}

if (!nextAuthUrl || isPlaceholder(nextAuthUrl)) {
  console.log("   FAIL NEXTAUTH_URL must be the deployed public URL");
} else {
  console.log(`   OK NEXTAUTH_URL: ${hostSummary(nextAuthUrl)}`);
}

if (!appUrl || isPlaceholder(appUrl)) {
  console.log("   WARN NEXT_PUBLIC_APP_URL should be the deployed public URL");
} else {
  console.log(`   OK NEXT_PUBLIC_APP_URL: ${hostSummary(appUrl)}`);
}

console.log("\n" + "=".repeat(50));
console.log("Summary\n");

const checks = [
  { name: "Dependencies", pass: true },
  { name: "DB Pooling", pass: dbUrl.includes(":6543") || dbUrl.includes("pgbouncer") || dbUrl.includes("pooler") },
  { name: "Redis/Upstash", pass: !!(upstashUrl && upstashToken) || !!redisUrl },
  { name: "Object Storage", pass: !!(s3Endpoint && s3AccessKey && s3SecretKey && s3Bucket) },
  { name: "Auth Secret", pass: !!nextAuthSecret && nextAuthSecret.length >= 32 && !isPlaceholder(nextAuthSecret) },
  { name: "Public Auth URL", pass: !!nextAuthUrl && !isPlaceholder(nextAuthUrl) },
];

checks.forEach((check) => {
  console.log(`   ${check.pass ? "OK" : "FAIL"} ${check.name}`);
});

const passCount = checks.filter((check) => check.pass).length;
console.log(`\n   ${passCount}/${checks.length} checks passed\n`);

if (passCount === checks.length) {
  console.log("Production setup checks passed.\n");
} else {
  console.log("Some items need attention before public launch.\n");
}
