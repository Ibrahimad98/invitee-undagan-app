import { describe, it, expect } from 'vitest';
import { GALLERY_SAMPLES } from './gallery-samples';

describe('GALLERY_SAMPLES', () => {
  it('should be an array of 6 sample URLs', () => {
    expect(Array.isArray(GALLERY_SAMPLES)).toBe(true);
    expect(GALLERY_SAMPLES).toHaveLength(6);
  });

  it('should contain valid image URLs', () => {
    GALLERY_SAMPLES.forEach((url) => {
      expect(url).toMatch(/\/assets\/images\/gallery\/sample-\d+\.jpg$/);
    });
  });

  it('should contain numbered samples 1-6', () => {
    for (let i = 1; i <= 6; i++) {
      const match = GALLERY_SAMPLES.some((url) => url.includes(`sample-${i}.jpg`));
      expect(match).toBe(true);
    }
  });

  it('should use the API URL base', () => {
    GALLERY_SAMPLES.forEach((url) => {
      expect(url).toMatch(/\/api\/assets\//);
    });
  });
});
