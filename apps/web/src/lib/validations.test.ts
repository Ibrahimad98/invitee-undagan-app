import {
  loginSchema,
  registerSchema,
  basicInfoSchema,
  eventDetailsSchema,
  guestSchema,
  rsvpSchema,
  testimonialSchema,
  giftAccountSchema,
} from './validations';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'pass123' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'pass123' });
    expect(result.success).toBe(false);
  });

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('should validate correct registration data', () => {
    const result = registerSchema.safeParse({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional phone', () => {
    const result = registerSchema.safeParse({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '081234567890',
    });
    expect(result.success).toBe(true);
  });

  it('should reject short password', () => {
    const result = registerSchema.safeParse({
      fullName: 'Test User',
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('should reject short fullName', () => {
    const result = registerSchema.safeParse({
      fullName: 'A',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      fullName: 'Test User',
      email: 'invalid',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });
});

describe('basicInfoSchema', () => {
  it('should validate correct basic info', () => {
    const result = basicInfoSchema.safeParse({
      title: 'Pernikahan Andi & Sari',
      slug: 'andi-sari',
      eventType: 'WEDDING',
    });
    expect(result.success).toBe(true);
  });

  it('should reject short title', () => {
    const result = basicInfoSchema.safeParse({
      title: 'AB',
      slug: 'ab',
      eventType: 'WEDDING',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid eventType', () => {
    const result = basicInfoSchema.safeParse({
      title: 'Test Event',
      slug: 'test-event',
      eventType: 'INVALID_TYPE',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid event types', () => {
    const types = ['WEDDING', 'KHITANAN', 'BIRTHDAY', 'AQIQAH', 'ENGAGEMENT', 'GRADUATION', 'REUNION', 'CORPORATE', 'SYUKURAN', 'ANNIVERSARY', 'WALIMAH', 'CUSTOM'];
    types.forEach((type) => {
      const result = basicInfoSchema.safeParse({ title: 'Test', slug: 'test', eventType: type });
      expect(result.success).toBe(true);
    });
  });
});

describe('eventDetailsSchema', () => {
  it('should validate correct event details', () => {
    const result = eventDetailsSchema.safeParse({
      eventName: 'Akad Nikah',
      eventDate: '2026-06-15',
      startTime: '09:00',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing eventName', () => {
    const result = eventDetailsSchema.safeParse({
      eventName: '',
      eventDate: '2026-06-15',
      startTime: '09:00',
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional venue fields', () => {
    const result = eventDetailsSchema.safeParse({
      eventName: 'Akad Nikah',
      eventDate: '2026-06-15',
      startTime: '09:00',
      venueName: 'Hotel Grand',
      venueAddress: 'Jl. Sudirman 123',
      mapUrl: 'https://maps.google.com/xxx',
    });
    expect(result.success).toBe(true);
  });
});

describe('guestSchema', () => {
  it('should validate guest with name only', () => {
    const result = guestSchema.safeParse({ name: 'John Doe' });
    expect(result.success).toBe(true);
  });

  it('should accept optional phone and email', () => {
    const result = guestSchema.safeParse({
      name: 'John Doe',
      phone: '081234567890',
      email: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = guestSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('should accept empty email string', () => {
    const result = guestSchema.safeParse({ name: 'John Doe', email: '' });
    expect(result.success).toBe(true);
  });
});

describe('rsvpSchema', () => {
  it('should validate correct RSVP data', () => {
    const result = rsvpSchema.safeParse({
      guestName: 'John Doe',
      attendance: 'ATTENDING',
      numGuests: 2,
    });
    expect(result.success).toBe(true);
  });

  it('should accept all attendance values', () => {
    ['ATTENDING', 'NOT_ATTENDING', 'MAYBE'].forEach((att) => {
      const result = rsvpSchema.safeParse({ guestName: 'Test', attendance: att, numGuests: 1 });
      expect(result.success).toBe(true);
    });
  });

  it('should reject invalid attendance', () => {
    const result = rsvpSchema.safeParse({
      guestName: 'Test',
      attendance: 'INVALID',
      numGuests: 1,
    });
    expect(result.success).toBe(false);
  });

  it('should reject numGuests < 1', () => {
    const result = rsvpSchema.safeParse({
      guestName: 'Test',
      attendance: 'ATTENDING',
      numGuests: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe('testimonialSchema', () => {
  it('should validate correct testimonial', () => {
    const result = testimonialSchema.safeParse({
      userName: 'Test User',
      message: 'This is a great platform for invitations!',
      rating: 5,
      ratingDesain: 5,
      ratingKemudahan: 4,
      ratingLayanan: 5,
    });
    expect(result.success).toBe(true);
  });

  it('should reject message shorter than 10 chars', () => {
    const result = testimonialSchema.safeParse({
      userName: 'Test',
      message: 'Short',
      rating: 5,
      ratingDesain: 5,
      ratingKemudahan: 5,
      ratingLayanan: 5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject rating > 5', () => {
    const result = testimonialSchema.safeParse({
      userName: 'Test',
      message: 'Long enough message for test',
      rating: 6,
      ratingDesain: 5,
      ratingKemudahan: 5,
      ratingLayanan: 5,
    });
    expect(result.success).toBe(false);
  });
});

describe('giftAccountSchema', () => {
  it('should validate correct gift account', () => {
    const result = giftAccountSchema.safeParse({
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'John Doe',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing bankName', () => {
    const result = giftAccountSchema.safeParse({
      bankName: '',
      accountNumber: '123',
      accountHolder: 'John',
    });
    expect(result.success).toBe(false);
  });
});
