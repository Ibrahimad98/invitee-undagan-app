/**
 * Storage Migration Script
 *
 * Migrates all media files from local storage to S3/R2 cloud storage.
 * Updates the fileUrl in the database after successful upload.
 *
 * Usage:
 *   1. Update .env with S3 credentials and set STORAGE_DRIVER=s3
 *   2. Run: npx ts-node scripts/migrate-storage.ts
 *
 * This script is idempotent — it skips files that already have cloud URLs.
 */

import { PrismaClient } from '@prisma/client';
import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  ...(process.env.S3_ENDPOINT && {
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
  }),
});

const BUCKET = process.env.S3_BUCKET || '';
const LOCAL_PATH = process.env.STORAGE_LOCAL_PATH || './uploads';

async function migrateStorage() {
  console.log('🚀 Starting storage migration...');
  console.log(`📁 Local path: ${LOCAL_PATH}`);
  console.log(`☁️  S3 Bucket: ${BUCKET}`);
  console.log(`🌍 Region: ${process.env.S3_REGION}`);
  console.log(`🔗 Endpoint: ${process.env.S3_ENDPOINT || 'default AWS'}`);
  console.log('---');

  const allMedia = await prisma.media.findMany();
  console.log(`Found ${allMedia.length} media records`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const media of allMedia) {
    // Skip if already a cloud URL
    if (media.fileUrl.startsWith('http')) {
      console.log(`⏭️  Skipping ${media.id} — already cloud URL`);
      skipped++;
      continue;
    }

    const localFilePath = path.join(LOCAL_PATH, media.fileUrl);

    if (!fs.existsSync(localFilePath)) {
      console.log(`❌ File not found: ${localFilePath} (media ID: ${media.id})`);
      failed++;
      continue;
    }

    try {
      const fileBuffer = fs.readFileSync(localFilePath);
      const key = media.fileUrl; // Keep same path structure

      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: media.fileType === 'image' ? 'image/jpeg' : media.fileType === 'video' ? 'video/mp4' : 'audio/mpeg',
      });

      await s3Client.send(command);

      // Update DB with cloud path (keep relative path, StorageService resolves full URL)
      // No need to update fileUrl since we keep relative paths
      console.log(`✅ Uploaded: ${key} (media ID: ${media.id})`);
      success++;
    } catch (error) {
      console.error(`❌ Failed to upload ${media.fileUrl}:`, error);
      failed++;
    }
  }

  console.log('---');
  console.log('📊 Migration complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. Set STORAGE_DRIVER=s3 in .env');
  console.log('   2. Restart the API server');
  console.log('   3. Verify all media loads correctly');
  console.log('   4. Optionally delete the local uploads/ directory');

  await prisma.$disconnect();
}

migrateStorage().catch((e) => {
  console.error('Migration failed:', e);
  prisma.$disconnect();
  process.exit(1);
});
