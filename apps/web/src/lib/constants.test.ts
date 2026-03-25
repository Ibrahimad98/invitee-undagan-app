import { NAV_ITEMS, STEPPER_LABELS, CATEGORY_COLORS } from './constants';

describe('NAV_ITEMS', () => {
  it('should have required nav items', () => {
    expect(NAV_ITEMS.length).toBeGreaterThan(0);

    const labels = NAV_ITEMS.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Undangan Saya');
    expect(labels).toContain('Template');
    expect(labels).toContain('Profil');
  });

  it('should have valid hrefs', () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.href).toMatch(/^\/dashboard/);
    });
  });

  it('should have icon for every item', () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.icon).toBeDefined();
    });
  });

  it('should mark admin-only items', () => {
    const adminItems = NAV_ITEMS.filter((item) => item.adminOnly);
    expect(adminItems.length).toBeGreaterThan(0);

    const adminLabels = adminItems.map((i) => i.label);
    expect(adminLabels).toContain('Kelola User');
    expect(adminLabels).toContain('Pengaturan');
  });
});

describe('STEPPER_LABELS', () => {
  it('should have 7 steps', () => {
    expect(STEPPER_LABELS.length).toBe(7);
  });

  it('should start with "Info Dasar" and end with "Preview"', () => {
    expect(STEPPER_LABELS[0]).toBe('Info Dasar');
    expect(STEPPER_LABELS[STEPPER_LABELS.length - 1]).toBe('Preview');
  });
});

describe('CATEGORY_COLORS', () => {
  it('should have at least 5 categories', () => {
    expect(Object.keys(CATEGORY_COLORS).length).toBeGreaterThanOrEqual(5);
  });

  it('should have tailwind classes for each category', () => {
    Object.values(CATEGORY_COLORS).forEach((value) => {
      expect(value).toMatch(/bg-/);
      expect(value).toMatch(/text-/);
    });
  });

  it('should include common categories', () => {
    expect(CATEGORY_COLORS['elegan']).toBeDefined();
    expect(CATEGORY_COLORS['budaya']).toBeDefined();
    expect(CATEGORY_COLORS['bunga']).toBeDefined();
  });
});
