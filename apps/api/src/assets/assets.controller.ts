import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AssetsService } from './assets.service';
import * as path from 'path';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  private readonly logger = new Logger(AssetsController.name);

  constructor(private assetsService: AssetsService) {}

  /**
   * Migration endpoint: uploads all static files from the web app's public/images
   * directory to S3 under the assets/ prefix.
   * Protected by JWT (admin only).
   */
  @Post('migrate')
  @ApiOperation({ summary: 'Migrate static assets to S3 (admin)' })
  async migrateAssets(@Res() res: Response) {
    try {
      const webPublicDir = path.resolve(process.cwd(), '../web/public/images');
      this.logger.log(`Starting migration from: ${webPublicDir}`);
      const result = await this.assetsService.migrateStaticAssets(webPublicDir);
      return res.json({
        message: 'Migration complete',
        uploaded: result.uploaded.length,
        errors: result.errors.length,
        details: result,
      });
    } catch (error: any) {
      this.logger.error(`Migration failed: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Migration failed',
        error: error.message,
      });
    }
  }

  /**
   * PUBLIC endpoint: serves a static asset from S3 by streaming through the backend.
   * Usage: GET /api/assets/images/gallery/sample-1.jpg
   *   → Streams the file content directly with correct Content-Type.
   *
   * This avoids CORS issues that arise with 302 redirects to S3 presigned URLs.
   */
  @Public()
  @Get('*')
  @ApiOperation({ summary: 'Get a static asset (streams from S3)' })
  async getAsset(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract the wildcard path
      let assetPath = req.params?.[0] || req.params?.['0'] || '';

      // Fallback: parse from URL path (remove /api/assets/ prefix)
      if (!assetPath) {
        const url = req.originalUrl || req.url;
        const prefix = '/api/assets/';
        const idx = url.indexOf(prefix);
        if (idx !== -1) {
          assetPath = url.substring(idx + prefix.length).split('?')[0];
        }
      }

      if (!assetPath) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Asset path required' });
      }

      // Security: prevent path traversal
      const normalized = path.normalize(assetPath).replace(/\\/g, '/');
      if (normalized.startsWith('..') || normalized.includes('../')) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid path' });
      }

      this.logger.debug(`Serving asset: ${normalized}`);

      const { stream, contentType, contentLength } = await this.assetsService.getAssetStream(normalized);

      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=86400, immutable');
      if (contentLength) {
        res.set('Content-Length', String(contentLength));
      }

      stream.pipe(res);
    } catch (error: any) {
      this.logger.error(`Asset not found: ${error.message}`);
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'Asset not found' });
    }
  }
}
