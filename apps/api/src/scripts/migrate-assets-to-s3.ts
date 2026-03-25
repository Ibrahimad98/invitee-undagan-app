/**
 * S3 Static Assets Migration Script
 *
 * Uploads all files from apps/web/public/images/ to the S3 bucket
 * under the "assets/images/" prefix.
 *
 * Usage:
 *   cd apps/api
 *   npx ts-node src/scripts/migrate-assets-to-s3.ts
 *
 * Or from root:
 *   cd apps/api && npx ts-node src/scripts/migrate-assets-to-s3.ts
 *
 * Requires: S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY in ../../.env
 */

import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Simple .env loader (no dotenv dependency needed)
function loadEnv(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    const val = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(path.resolve(__dirname, '../../.env'));
loadEnv(path.resolve(__dirname, '../../../../.env'));

const bucket = process.env.S3_BUCKET!;
const region = process.env.S3_REGION!;
const accessKeyId = process.env.S3_ACCESS_KEY!;
const secretAccessKey = process.env.S3_SECRET_KEY!;

if (!bucket || !region || !accessKeyId || !secretAccessKey) {
  console.error('Missing S3 env vars. Check .env file.');
  process.exit(1);
}

const s3 = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.json': 'application/json',
    '.ico': 'image/x-icon', '.txt': 'text/plain',
  };
  return map[ext] || 'application/octet-stream';
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

async function fileExists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Resolve the web app's public/images directory
  const webImagesDir = path.resolve(__dirname, '../../../web/public/images');

  if (!fs.existsSync(webImagesDir)) {
    console.error(`Images directory not found: ${webImagesDir}`);
    process.exit(1);
  }

  console.log(`\n🚀 Migrating static assets to S3`);
  console.log(`   Bucket: ${bucket}`);
  console.log(`   Region: ${region}`);
  console.log(`   Source: ${webImagesDir}\n`);

  const files = walkDir(webImagesDir);
  console.log(`Found ${files.length} files to upload.\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of files) {
    const relativePath = path.relative(webImagesDir, filePath).replace(/\\/g, '/');
    const s3Key = `assets/images/${relativePath}`;
    const contentType = getMimeType(filePath);

    // Check if already uploaded
    const exists = await fileExists(s3Key);
    if (exists) {
      console.log(`  ⏭️  Skip (exists): ${s3Key}`);
      skipped++;
      continue;
    }

    try {
      const buffer = fs.readFileSync(filePath);
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
      console.log(`  ✅ Uploaded: ${s3Key} (${(buffer.length / 1024).toFixed(1)}KB)`);
      uploaded++;
    } catch (err: any) {
      console.log(`  ❌ Failed: ${s3Key} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Skipped:  ${skipped}`);
  console.log(`   Failed:   ${failed}`);
  console.log(`   Total:    ${files.length}\n`);
}

main().catch(console.error);
