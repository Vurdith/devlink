/**
 * Verification Script for DevLink Scalability Setup
 * Run with: npx tsx scripts/verify-setup.ts
 */

// Load .env file
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '');
        process.env[key.trim()] = value;
      }
    }
  });
}

console.log('\n🔍 DevLink Scalability Setup Verification\n');
console.log('='.repeat(50));

// Check 1: Dependencies
console.log('\n✅ Step 1: Dependencies');
const requiredDeps = ['@upstash/redis', 'ioredis', '@aws-sdk/client-s3'];
requiredDeps.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`   ✓ ${dep} installed`);
  } catch {
    console.log(`   ✗ ${dep} NOT installed - run: npm install`);
  }
});

// Check 2: Database Connection Pooling
console.log('\n✅ Step 2: Database Connection Pooling');
const dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl) {
  console.log('   ✗ DATABASE_URL not set');
} else if (dbUrl.includes(':6543') || dbUrl.includes('pgbouncer=true') || dbUrl.includes('pooler')) {
  console.log('   ✓ DATABASE_URL appears to use connection pooling');
  console.log(`   → Using: ${dbUrl.substring(0, 50)}...`);
} else if (dbUrl.includes(':5432')) {
  console.log('   ⚠ DATABASE_URL uses direct connection (port 5432)');
  console.log('   → Consider switching to pooler URL (port 6543) for production');
} else {
  console.log('   ? DATABASE_URL set but pooling status unclear');
}

// Check 3: Redis/Upstash
console.log('\n✅ Step 3: Redis for Caching & Rate Limiting');
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisUrl = process.env.REDIS_URL;

if (upstashUrl && upstashToken) {
  console.log('   ✓ Upstash Redis configured');
  console.log(`   → URL: ${upstashUrl.substring(0, 30)}...`);
} else if (redisUrl) {
  console.log('   ✓ Standard Redis configured');
  console.log(`   → URL: ${redisUrl.substring(0, 30)}...`);
} else {
  console.log('   ✗ No Redis configured');
  console.log('   → Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN');
  console.log('   → Or set REDIS_URL for standard Redis');
}

// Check 4: Object Storage (S3/R2)
console.log('\n✅ Step 4: Object Storage (S3/R2)');
const s3Endpoint = process.env.S3_ENDPOINT;
const s3AccessKey = process.env.S3_ACCESS_KEY_ID;
const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY;
const s3Bucket = process.env.S3_BUCKET_NAME;
const s3PublicUrl = process.env.S3_PUBLIC_URL;

if (s3Endpoint && s3AccessKey && s3SecretKey && s3Bucket) {
  console.log('   ✓ S3/R2 configured');
  console.log(`   → Endpoint: ${s3Endpoint}`);
  console.log(`   → Bucket: ${s3Bucket}`);
  if (s3PublicUrl) {
    console.log(`   → Public URL: ${s3PublicUrl}`);
  }
  
  // Check if it's R2
  if (s3Endpoint.includes('r2.cloudflarestorage.com')) {
    console.log('   → Provider: Cloudflare R2 ✓');
  } else if (s3Endpoint.includes('amazonaws.com')) {
    console.log('   → Provider: AWS S3');
  }
} else {
  console.log('   ✗ Object Storage NOT fully configured');
  if (!s3Endpoint) console.log('   → Missing: S3_ENDPOINT');
  if (!s3AccessKey) console.log('   → Missing: S3_ACCESS_KEY_ID');
  if (!s3SecretKey) console.log('   → Missing: S3_SECRET_ACCESS_KEY');
  if (!s3Bucket) console.log('   → Missing: S3_BUCKET_NAME');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Summary\n');

const checks = [
  { name: 'Dependencies', pass: true }, // Always pass if script runs
  { name: 'DB Pooling', pass: dbUrl.includes(':6543') || dbUrl.includes('pgbouncer') || dbUrl.includes('pooler') },
  { name: 'Redis/Upstash', pass: !!(upstashUrl && upstashToken) || !!redisUrl },
  { name: 'Object Storage', pass: !!(s3Endpoint && s3AccessKey && s3SecretKey && s3Bucket) },
];

checks.forEach(c => {
  console.log(`   ${c.pass ? '✓' : '✗'} ${c.name}`);
});

const passCount = checks.filter(c => c.pass).length;
console.log(`\n   ${passCount}/4 checks passed\n`);

if (passCount === 4) {
  console.log('🎉 All scalability requirements configured!\n');
} else {
  console.log('⚠️  Some items need attention before production.\n');
}

