export const EVENT_TYPES = {
  WEDDING: 'WEDDING',
  KHITANAN: 'KHITANAN',
  BIRTHDAY: 'BIRTHDAY',
  AQIQAH: 'AQIQAH',
  ENGAGEMENT: 'ENGAGEMENT',
  GRADUATION: 'GRADUATION',
  REUNION: 'REUNION',
  CORPORATE: 'CORPORATE',
  SYUKURAN: 'SYUKURAN',
  ANNIVERSARY: 'ANNIVERSARY',
  WALIMAH: 'WALIMAH',
  CUSTOM: 'CUSTOM',
} as const;

export const EVENT_TYPE_LABELS: Record<string, string> = {
  WEDDING: 'Pernikahan',
  KHITANAN: 'Khitanan',
  BIRTHDAY: 'Ulang Tahun',
  AQIQAH: 'Aqiqah',
  ENGAGEMENT: 'Pertunangan',
  GRADUATION: 'Wisuda',
  REUNION: 'Reuni',
  CORPORATE: 'Acara Perusahaan',
  SYUKURAN: 'Syukuran',
  ANNIVERSARY: 'Anniversary',
  WALIMAH: 'Walimatul Ursy',
  CUSTOM: 'Lainnya',
};

export const TEMPLATE_CATEGORIES = [
  'elegan',
  'budaya',
  'bunga',
  'gold',
  'muslim',
  'anak',
  'wayang',
  'simple',
  'natal',
  'slide',
  'formal',
  'colorful',
] as const;

export const TEMPLATE_CATEGORY_LABELS: Record<string, string> = {
  elegan: 'Elegan',
  budaya: 'Budaya',
  bunga: 'Bunga',
  gold: 'Gold',
  muslim: 'Muslim',
  anak: 'Anak',
  wayang: 'Wayang',
  simple: 'Simple',
  natal: 'Natal',
  slide: 'Slide',
  formal: 'Formal',
  colorful: 'Colorful',
};

export const ATTENDANCE_STATUS = {
  ATTENDING: 'ATTENDING',
  NOT_ATTENDING: 'NOT_ATTENDING',
  MAYBE: 'MAYBE',
  PENDING: 'PENDING',
} as const;

export const ATTENDANCE_LABELS: Record<string, string> = {
  ATTENDING: 'Hadir',
  NOT_ATTENDING: 'Tidak Hadir',
  MAYBE: 'Mungkin',
  PENDING: 'Belum Konfirmasi',
};

export const MEDIA_PURPOSE = {
  GALLERY: 'GALLERY',
  COVER: 'COVER',
  PROFILE: 'PROFILE',
  MUSIC: 'MUSIC',
} as const;

export const STORAGE_DRIVERS = {
  LOCAL: 'local',
  S3: 's3',
  R2: 'r2',
} as const;

export const SENT_VIA = {
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms',
} as const;
