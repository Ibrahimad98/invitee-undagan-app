import { describe, it, expect } from 'vitest';
import { EVENT_TYPE_CONFIG, getEventTypeConfig, getVisibleProfileFields, isMainProfileField, isCollapsibleProfileField } from './event-type-config';

const ALL_EVENT_TYPES = [
  'WEDDING', 'ENGAGEMENT', 'WALIMAH', 'KHITANAN', 'AQIQAH',
  'BIRTHDAY', 'GRADUATION', 'REUNION', 'CORPORATE', 'SYUKURAN',
  'ANNIVERSARY', 'CUSTOM',
];

describe('EVENT_TYPE_CONFIG', () => {
  it('should have configs for all 12 event types', () => {
    expect(Object.keys(EVENT_TYPE_CONFIG)).toHaveLength(12);
    ALL_EVENT_TYPES.forEach((type) => {
      expect(EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG]).toBeDefined();
    });
  });

  it('should have required fields for every event type', () => {
    Object.values(EVENT_TYPE_CONFIG).forEach((config) => {
      expect(config.coverLabel).toBeDefined();
      expect(config.heroPrefix).toBeDefined();
      expect(config.titlePlaceholder).toBeDefined();
      expect(config.profileFields).toBeDefined();
      expect(config.profileFields.main).toBeDefined();
      expect(config.profileFields.collapsible).toBeDefined();
      expect(config.profileLabels).toBeDefined();
      expect(config.profileRoles).toBeDefined();
      expect(config.profileRoles.length).toBeGreaterThan(0);
      expect(config.defaultProfileCount).toBeGreaterThanOrEqual(1);
      expect(config.defaultEventNames).toBeDefined();
      expect(config.defaultEventNames.length).toBeGreaterThan(0);
      expect(config.defaultOpeningText).toBeDefined();
      expect(config.defaultClosingText).toBeDefined();
      expect(config.recommendedTemplates).toBeDefined();
      expect(typeof config.showAmpersand).toBe('boolean');
      expect(typeof config.showParents).toBe('boolean');
    });
  });

  it('WEDDING should have groom and bride roles', () => {
    const wedding = EVENT_TYPE_CONFIG.WEDDING;
    const roleValues = wedding.profileRoles.map((r) => r.value);
    expect(roleValues).toContain('groom');
    expect(roleValues).toContain('bride');
    expect(wedding.defaultProfileCount).toBe(2);
    expect(wedding.showAmpersand).toBe(true);
    expect(wedding.showParents).toBe(true);
  });

  it('BIRTHDAY should have single profile and no parents', () => {
    const birthday = EVENT_TYPE_CONFIG.BIRTHDAY;
    expect(birthday.defaultProfileCount).toBe(1);
    expect(birthday.showAmpersand).toBe(false);
    expect(birthday.showParents).toBe(false);
    expect(birthday.coverLabel).toContain('Ulang Tahun');
  });

  it('KHITANAN should show parents and have single profile', () => {
    const khitanan = EVENT_TYPE_CONFIG.KHITANAN;
    expect(khitanan.defaultProfileCount).toBe(1);
    expect(khitanan.showParents).toBe(true);
    expect(khitanan.coverLabel).toContain('Khitanan');
  });

  it('CORPORATE should have PIC/speaker roles', () => {
    const corporate = EVENT_TYPE_CONFIG.CORPORATE;
    const roleValues = corporate.profileRoles.map((r) => r.value);
    expect(roleValues).toContain('primary');
    expect(roleValues).toContain('speaker');
  });

  it('CUSTOM should have all template slugs recommended', () => {
    const custom = EVENT_TYPE_CONFIG.CUSTOM;
    expect(custom.recommendedTemplates.length).toBeGreaterThanOrEqual(10);
  });

  it('ANNIVERSARY should show ampersand between profiles', () => {
    const anniversary = EVENT_TYPE_CONFIG.ANNIVERSARY;
    expect(anniversary.showAmpersand).toBe(true);
    expect(anniversary.defaultProfileCount).toBe(2);
  });
});

describe('getEventTypeConfig', () => {
  it('should return config for valid event type', () => {
    const config = getEventTypeConfig('WEDDING');
    expect(config.coverLabel).toBe('Undangan Pernikahan');
  });

  it('should fallback to CUSTOM for unknown event type', () => {
    const config = getEventTypeConfig('NONEXISTENT');
    expect(config.coverLabel).toBe('Undangan');
    expect(config.heroPrefix).toBe('');
  });
});

describe('getVisibleProfileFields', () => {
  it('should return combined main + collapsible fields', () => {
    const fields = getVisibleProfileFields('WEDDING');
    expect(fields).toContain('fullName');
    expect(fields).toContain('nickname');
    expect(fields).toContain('bio'); // collapsible field
    expect(fields).toContain('dateOfBirth'); // collapsible field
  });

  it('should include age field for BIRTHDAY', () => {
    const fields = getVisibleProfileFields('BIRTHDAY');
    expect(fields).toContain('age');
  });

  it('should include jobTitle and organization for GRADUATION', () => {
    const fields = getVisibleProfileFields('GRADUATION');
    expect(fields).toContain('jobTitle');
    expect(fields).toContain('organization');
  });
});

describe('isMainProfileField', () => {
  it('should return true for main fields', () => {
    expect(isMainProfileField('WEDDING', 'fullName')).toBe(true);
    expect(isMainProfileField('WEDDING', 'nickname')).toBe(true);
    expect(isMainProfileField('WEDDING', 'parentFather')).toBe(true);
  });

  it('should return false for collapsible fields', () => {
    expect(isMainProfileField('WEDDING', 'bio')).toBe(false);
    expect(isMainProfileField('WEDDING', 'dateOfBirth')).toBe(false);
  });

  it('should return false for non-existent fields', () => {
    expect(isMainProfileField('WEDDING', 'nonExistentField')).toBe(false);
  });
});

describe('isCollapsibleProfileField', () => {
  it('should return true for collapsible fields', () => {
    expect(isCollapsibleProfileField('WEDDING', 'bio')).toBe(true);
    expect(isCollapsibleProfileField('WEDDING', 'dateOfBirth')).toBe(true);
    expect(isCollapsibleProfileField('WEDDING', 'phone')).toBe(true);
  });

  it('should return false for main fields', () => {
    expect(isCollapsibleProfileField('WEDDING', 'fullName')).toBe(false);
    expect(isCollapsibleProfileField('WEDDING', 'nickname')).toBe(false);
  });
});
