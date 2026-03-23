import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteSettingDto, UpdateSiteSettingDto } from './dto/site-setting.dto';

/** Default system settings that should always exist.
 *  Category 'system' is reserved for built-in toggles.
 *  Item keys are used as exact identifiers — do NOT rename without updating consumers.
 */
const DEFAULT_SETTINGS = [
  {
    category: 'system',
    item: 'email_verification',
    value: 'false',
    description: 'Wajibkan verifikasi email sebelum akun bisa digunakan',
    sortOrder: 1,
    isActive: true,
  },
  {
    category: 'system',
    item: 'beta_mode',
    value: 'true',
    description: 'Aktifkan mode beta — semua fitur gratis dengan kuota terbatas',
    sortOrder: 2,
    isActive: true,
  },
  {
    category: 'system',
    item: 'default_max_guests',
    value: '300',
    description: 'Batas default jumlah tamu untuk pengguna baru',
    sortOrder: 3,
    isActive: true,
  },
  {
    category: 'system',
    item: 'beta_max_invitations_basic',
    value: '1',
    description: 'Maks undangan untuk user Basic saat beta',
    sortOrder: 4,
    isActive: true,
  },
  {
    category: 'system',
    item: 'beta_max_invitations_premium',
    value: '3',
    description: 'Maks undangan untuk user Premium saat beta',
    sortOrder: 5,
    isActive: true,
  },
  {
    category: 'system',
    item: 'beta_max_invitations_enterprise',
    value: '1',
    description: 'Maks undangan untuk user Enterprise saat beta (0 = unlimited)',
    sortOrder: 6,
    isActive: true,
  },
];

/**
 * Legacy settings that should be migrated into the canonical 'system' entries.
 * Each mapping says: "if this old row exists, copy its value into the matching
 * system row, then delete the old row."
 */
const LEGACY_MAPPINGS: { category: string; item: string; systemItem: string }[] = [
  { category: 'registration', item: 'Email Verification', systemItem: 'email_verification' },
  { category: 'general',      item: 'Beta Mode',          systemItem: 'beta_mode' },
  { category: 'general',      item: 'Default Max Guests',  systemItem: 'default_max_guests' },
  { category: 'beta',         item: 'is_beta_active',      systemItem: 'beta_mode' },
  { category: 'beta',         item: 'default_max_guests',  systemItem: 'default_max_guests' },
];

/** Stale legacy items that are no longer referenced by any code */
const STALE_ITEMS: { category: string; item: string }[] = [
  { category: 'beta', item: 'require_registration_approval' },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  /** Auto-create default settings on startup if they don't exist */
  async onModuleInit() {
    await this.ensureDefaults();
  }

  async ensureDefaults() {
    // ── Step 1: Migrate legacy rows into canonical 'system' entries ──
    for (const legacy of LEGACY_MAPPINGS) {
      const oldRow = await this.prisma.siteSetting.findFirst({
        where: { category: legacy.category, item: legacy.item },
      });
      if (oldRow) {
        // Ensure the system row exists first
        const systemRow = await this.prisma.siteSetting.findFirst({
          where: { category: 'system', item: legacy.systemItem },
        });
        if (systemRow) {
          // Copy value from old row into the system row (user's chosen value wins)
          await this.prisma.siteSetting.update({
            where: { id: systemRow.id },
            data: { value: oldRow.value },
          });
          this.logger.log(`Migrated [${legacy.category}] ${legacy.item} → [system] ${legacy.systemItem} = ${oldRow.value}`);
        }
        // Delete the old duplicate
        await this.prisma.siteSetting.delete({ where: { id: oldRow.id } });
        this.logger.log(`Removed legacy setting: [${legacy.category}] ${legacy.item}`);
      }
    }

    // ── Step 2: Create default system settings if they don't exist ──
    for (const def of DEFAULT_SETTINGS) {
      const existing = await this.prisma.siteSetting.findFirst({
        where: { category: def.category, item: def.item },
      });
      if (!existing) {
        await this.prisma.siteSetting.create({ data: def });
        this.logger.log(`Created default setting: [${def.category}] ${def.item} = ${def.value}`);
      }
    }

    // ── Step 3: Remove stale orphaned items ──
    for (const stale of STALE_ITEMS) {
      const row = await this.prisma.siteSetting.findFirst({
        where: { category: stale.category, item: stale.item },
      });
      if (row) {
        await this.prisma.siteSetting.delete({ where: { id: row.id } });
        this.logger.log(`Removed stale setting: [${stale.category}] ${stale.item}`);
      }
    }
  }

  /** Get a single system setting value by exact item key */
  async getSystemValue(itemKey: string): Promise<string | null> {
    const setting = await this.prisma.siteSetting.findFirst({
      where: { category: 'system', item: itemKey, isActive: true },
    });
    return setting?.value ?? null;
  }

  /** Get all settings (admin) */
  async findAll(category?: string) {
    const where = category ? { category } : {};
    return this.prisma.siteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /** Get active settings by category (public) */
  async findPublic(category?: string) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    return this.prisma.siteSetting.findMany({
      where,
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        category: true,
        item: true,
        value: true,
        description: true,
        sortOrder: true,
      },
    });
  }

  /** Create a new setting */
  async create(dto: CreateSiteSettingDto) {
    return this.prisma.siteSetting.create({ data: dto });
  }

  /** Update a setting */
  async update(id: string, dto: UpdateSiteSettingDto) {
    return this.prisma.siteSetting.update({ where: { id }, data: dto });
  }

  /** Delete a setting */
  async remove(id: string) {
    return this.prisma.siteSetting.delete({ where: { id } });
  }
}
