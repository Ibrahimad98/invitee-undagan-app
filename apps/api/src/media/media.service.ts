import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_SERVICE, IStorageService } from '../storage/storage.interface';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private storageService: IStorageService,
  ) {}

  async upload(
    file: Express.Multer.File,
    invitationId: string | undefined,
    userId: string,
    purpose: string,
    sortOrder = 0,
  ) {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = `${purpose.toLowerCase()}/${fileName}`;

    const storedPath = await this.storageService.upload(file, filePath);

    const media = await this.prisma.media.create({
      data: {
        fileUrl: storedPath,
        fileType: file.mimetype.startsWith('image/') ? 'image' : file.mimetype.startsWith('video/') ? 'video' : 'audio',
        fileSize: file.size,
        originalName: file.originalname,
        purpose: purpose as any,
        sortOrder,
        ...(invitationId && { invitationId }),
        userId,
      },
    });

    return {
      ...media,
      fileUrl: this.storageService.getUrl(media.fileUrl),
    };
  }

  async findById(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');
    return {
      ...media,
      fileUrl: this.storageService.getUrl(media.fileUrl),
    };
  }

  async remove(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Media not found');

    await this.storageService.delete(media.fileUrl);
    await this.prisma.media.delete({ where: { id } });

    return { message: 'Media deleted' };
  }

  async findByInvitation(invitationId: string) {
    const mediaList = await this.prisma.media.findMany({
      where: { invitationId },
      orderBy: { sortOrder: 'asc' },
    });

    return mediaList.map((m) => ({
      ...m,
      fileUrl: this.storageService.getUrl(m.fileUrl),
    }));
  }
}
