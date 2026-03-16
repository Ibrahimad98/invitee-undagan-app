import type { EventType } from '@invitee/shared';

/**
 * Profile field visibility configuration per event type.
 * - `main`: fields always visible in the main form section
 * - `collapsible`: fields inside the "Info Tambahan" collapsible section
 */
export interface ProfileFieldConfig {
  /** Fields shown in the main profile form */
  main: string[];
  /** Fields shown in the collapsible "Info Tambahan" section */
  collapsible: string[];
}

export interface ProfileRoleOption {
  value: string;
  label: string;
}

export interface EventTypeConfig {
  /** Label shown on the cover screen, e.g. "Undangan Pernikahan" */
  coverLabel: string;
  /** Prefix shown before names in hero section, e.g. "Pernikahan" */
  heroPrefix: string;
  /** Placeholder for the title field, e.g. "Pernikahan Budi & Ani" */
  titlePlaceholder: string;
  /** Which profile fields to show (main + collapsible) */
  profileFields: ProfileFieldConfig;
  /** Custom labels for profile fields */
  profileLabels: Record<string, string>;
  /** Available roles for profiles in this event type */
  profileRoles: ProfileRoleOption[];
  /** Default number of profiles to create */
  defaultProfileCount: number;
  /** Default event names for this type */
  defaultEventNames: string[];
  /** Default opening text */
  defaultOpeningText: string;
  /** Default closing text */
  defaultClosingText: string;
  /** Template slugs recommended for this event type */
  recommendedTemplates: string[];
  /** Whether to show the "&" separator between profiles */
  showAmpersand: boolean;
  /** Whether to show parent info on the invitation display */
  showParents: boolean;
}

const DEFAULT_CLOSING = 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Atas kehadiran dan doa restunya kami ucapkan terima kasih.';

const ALL_TEMPLATE_SLUGS = [
  'super-classic', 'simple-java', 'floral-garden', 'golden-elegance',
  'royal-muslim', 'kids-party', 'wayang-heritage', 'modern-minimal',
  'christmas-joy', 'slide-romantic',
];

export const EVENT_TYPE_CONFIG: Record<EventType, EventTypeConfig> = {
  WEDDING: {
    coverLabel: 'Undangan Pernikahan',
    heroPrefix: 'Pernikahan',
    titlePlaceholder: 'Pernikahan Budi & Ani',
    profileFields: {
      main: ['fullName', 'nickname', 'parentFather', 'parentMother', 'childOrder', 'instagram'],
      collapsible: ['bio', 'dateOfBirth', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap Mempelai',
      nickname: 'Nama Panggilan',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      childOrder: 'Anak Ke- (contoh: Putra Pertama)',
      instagram: 'Instagram (@username)',
      bio: 'Bio Singkat',
      dateOfBirth: 'Tanggal Lahir',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'groom', label: 'Mempelai Pria' },
      { value: 'bride', label: 'Mempelai Wanita' },
    ],
    defaultProfileCount: 2,
    defaultEventNames: ['Akad Nikah', 'Resepsi'],
    defaultOpeningText: 'Assalamualaikum Warahmatullahi Wabarakatuh\n\nDengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami.',
    defaultClosingText: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restunya kami ucapkan terima kasih.\n\nWassalamualaikum Warahmatullahi Wabarakatuh',
    recommendedTemplates: ['super-classic', 'floral-garden', 'golden-elegance', 'royal-muslim', 'slide-romantic', 'simple-java'],
    showAmpersand: true,
    showParents: true,
  },

  ENGAGEMENT: {
    coverLabel: 'Undangan Pertunangan',
    heroPrefix: 'Pertunangan',
    titlePlaceholder: 'Pertunangan Rudi & Maya',
    profileFields: {
      main: ['fullName', 'nickname', 'parentFather', 'parentMother', 'childOrder', 'instagram'],
      collapsible: ['bio', 'dateOfBirth', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap',
      nickname: 'Nama Panggilan',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      childOrder: 'Anak Ke-',
      instagram: 'Instagram (@username)',
      bio: 'Bio Singkat',
      dateOfBirth: 'Tanggal Lahir',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'groom', label: 'Calon Mempelai Pria' },
      { value: 'bride', label: 'Calon Mempelai Wanita' },
    ],
    defaultProfileCount: 2,
    defaultEventNames: ['Pertunangan'],
    defaultOpeningText: 'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara pertunangan putra-putri kami.',
    defaultClosingText: DEFAULT_CLOSING,
    recommendedTemplates: ['floral-garden', 'golden-elegance', 'super-classic', 'slide-romantic', 'modern-minimal'],
    showAmpersand: true,
    showParents: true,
  },

  WALIMAH: {
    coverLabel: 'Undangan Walimatul Ursy',
    heroPrefix: 'Walimatul Ursy',
    titlePlaceholder: 'Walimatul Ursy Ahmad & Fatimah',
    profileFields: {
      main: ['fullName', 'nickname', 'parentFather', 'parentMother', 'childOrder', 'instagram'],
      collapsible: ['bio', 'dateOfBirth', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap Mempelai',
      nickname: 'Nama Panggilan',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      childOrder: 'Anak Ke-',
      instagram: 'Instagram (@username)',
      bio: 'Bio Singkat',
      dateOfBirth: 'Tanggal Lahir',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'groom', label: 'Mempelai Pria' },
      { value: 'bride', label: 'Mempelai Wanita' },
    ],
    defaultProfileCount: 2,
    defaultEventNames: ['Walimatul Ursy'],
    defaultOpeningText: 'Bismillahirrahmanirrahim\n\nDengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan Walimatul Ursy putra-putri kami.',
    defaultClosingText: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.\n\nWassalamualaikum Warahmatullahi Wabarakatuh',
    recommendedTemplates: ['royal-muslim', 'super-classic', 'golden-elegance', 'simple-java'],
    showAmpersand: true,
    showParents: true,
  },

  KHITANAN: {
    coverLabel: 'Undangan Khitanan',
    heroPrefix: 'Khitanan',
    titlePlaceholder: 'Khitanan Muhammad Zidan',
    profileFields: {
      main: ['fullName', 'nickname', 'parentFather', 'parentMother', 'childOrder'],
      collapsible: ['dateOfBirth', 'age', 'bio', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap Anak',
      nickname: 'Nama Panggilan',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      childOrder: 'Anak Ke- (contoh: Putra Ketiga)',
      dateOfBirth: 'Tanggal Lahir',
      age: 'Usia',
      bio: 'Tentang Anak',
      address: 'Alamat',
      phone: 'No. HP Orang Tua',
    },
    profileRoles: [
      { value: 'primary', label: 'Anak yang Dikhitan' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Khitanan'],
    defaultOpeningText: 'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara Khitanan putra kami.',
    defaultClosingText: DEFAULT_CLOSING,
    recommendedTemplates: ['royal-muslim', 'super-classic', 'kids-party', 'simple-java', 'wayang-heritage'],
    showAmpersand: false,
    showParents: true,
  },

  AQIQAH: {
    coverLabel: 'Undangan Aqiqah',
    heroPrefix: 'Aqiqah',
    titlePlaceholder: 'Aqiqah Ananda Hakim',
    profileFields: {
      main: ['fullName', 'nickname', 'parentFather', 'parentMother'],
      collapsible: ['dateOfBirth', 'age', 'gender', 'bio', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap Anak',
      nickname: 'Nama Panggilan',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      dateOfBirth: 'Tanggal Lahir',
      age: 'Usia',
      gender: 'Jenis Kelamin',
      bio: 'Tentang Anak',
      address: 'Alamat',
      phone: 'No. HP Orang Tua',
    },
    profileRoles: [
      { value: 'primary', label: 'Anak' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Aqiqah'],
    defaultOpeningText: 'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara Aqiqah putra/putri kami.',
    defaultClosingText: DEFAULT_CLOSING,
    recommendedTemplates: ['royal-muslim', 'kids-party', 'super-classic', 'modern-minimal'],
    showAmpersand: false,
    showParents: true,
  },

  BIRTHDAY: {
    coverLabel: 'Undangan Ulang Tahun',
    heroPrefix: 'Ulang Tahun',
    titlePlaceholder: 'Ulang Tahun Sarah ke-7',
    profileFields: {
      main: ['fullName', 'nickname', 'dateOfBirth', 'age'],
      collapsible: ['bio', 'instagram', 'address', 'phone', 'gender'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap',
      nickname: 'Nama Panggilan',
      dateOfBirth: 'Tanggal Lahir',
      age: 'Usia',
      bio: 'Tentang yang Berulang Tahun',
      instagram: 'Instagram (@username)',
      address: 'Alamat',
      phone: 'No. HP',
      gender: 'Jenis Kelamin',
    },
    profileRoles: [
      { value: 'primary', label: 'Yang Berulang Tahun' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Pesta Ulang Tahun'],
    defaultOpeningText: 'Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara/i untuk merayakan hari ulang tahun.',
    defaultClosingText: 'Kehadiran Anda akan membuat perayaan ini semakin bermakna. Atas kehadiran dan doa baiknya, kami ucapkan terima kasih.',
    recommendedTemplates: ['kids-party', 'modern-minimal', 'christmas-joy', 'floral-garden'],
    showAmpersand: false,
    showParents: false,
  },

  GRADUATION: {
    coverLabel: 'Undangan Wisuda',
    heroPrefix: 'Wisuda',
    titlePlaceholder: 'Wisuda Sarjana Dina Pratiwi',
    profileFields: {
      main: ['fullName', 'nickname', 'jobTitle', 'organization', 'instagram'],
      collapsible: ['bio', 'dateOfBirth', 'parentFather', 'parentMother', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap Wisudawan/i',
      nickname: 'Nama Panggilan',
      jobTitle: 'Gelar / Jurusan',
      organization: 'Universitas / Institusi',
      instagram: 'Instagram (@username)',
      bio: 'Bio / Prestasi',
      dateOfBirth: 'Tanggal Lahir',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'primary', label: 'Wisudawan/i' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Wisuda'],
    defaultOpeningText: 'Dengan rasa syukur dan kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara wisuda.',
    defaultClosingText: 'Kehadiran dan doa restu Anda merupakan kebahagiaan tersendiri bagi kami. Terima kasih.',
    recommendedTemplates: ['modern-minimal', 'golden-elegance', 'super-classic', 'floral-garden'],
    showAmpersand: false,
    showParents: false,
  },

  REUNION: {
    coverLabel: 'Undangan Reuni',
    heroPrefix: 'Reuni',
    titlePlaceholder: 'Reuni Akbar SMA Negeri 1 Angkatan 2010',
    profileFields: {
      main: ['fullName', 'organization'],
      collapsible: ['bio', 'jobTitle', 'instagram', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Panitia / PIC',
      organization: 'Nama Sekolah / Institusi',
      bio: 'Deskripsi Acara',
      jobTitle: 'Jabatan / Peran',
      instagram: 'Instagram',
      address: 'Alamat',
      phone: 'No. HP PIC',
    },
    profileRoles: [
      { value: 'primary', label: 'Panitia / PIC' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Reuni'],
    defaultOpeningText: 'Dengan penuh kegembiraan, kami mengundang seluruh alumni untuk bersilaturahmi dalam acara reuni.',
    defaultClosingText: 'Mari kita pertemukan kembali kenangan dan persahabatan. Kehadiran Anda sangat kami nantikan!',
    recommendedTemplates: ['modern-minimal', 'super-classic', 'wayang-heritage', 'simple-java'],
    showAmpersand: false,
    showParents: false,
  },

  CORPORATE: {
    coverLabel: 'Undangan Acara',
    heroPrefix: 'Acara',
    titlePlaceholder: 'Grand Opening PT Maju Bersama',
    profileFields: {
      main: ['fullName', 'jobTitle', 'organization'],
      collapsible: ['bio', 'instagram', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama PIC / Narasumber',
      jobTitle: 'Jabatan',
      organization: 'Perusahaan / Organisasi',
      bio: 'Deskripsi',
      instagram: 'Instagram',
      address: 'Alamat Kantor',
      phone: 'No. HP PIC',
    },
    profileRoles: [
      { value: 'primary', label: 'PIC / Penyelenggara' },
      { value: 'speaker', label: 'Narasumber / Pembicara' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Acara Utama'],
    defaultOpeningText: 'Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara yang akan kami selenggarakan.',
    defaultClosingText: 'Kehadiran Bapak/Ibu/Saudara/i sangat kami harapkan. Atas perhatiannya, kami ucapkan terima kasih.',
    recommendedTemplates: ['modern-minimal', 'golden-elegance', 'super-classic'],
    showAmpersand: false,
    showParents: false,
  },

  SYUKURAN: {
    coverLabel: 'Undangan Syukuran',
    heroPrefix: 'Syukuran',
    titlePlaceholder: 'Syukuran Rumah Baru Keluarga Hendra',
    profileFields: {
      main: ['fullName', 'nickname'],
      collapsible: ['bio', 'instagram', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Penyelenggara',
      nickname: 'Nama Panggilan',
      bio: 'Deskripsi Acara',
      instagram: 'Instagram',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'primary', label: 'Penyelenggara' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Syukuran'],
    defaultOpeningText: 'Dengan rasa syukur kepada Allah SWT, kami bermaksud menyelenggarakan acara syukuran.',
    defaultClosingText: DEFAULT_CLOSING,
    recommendedTemplates: ['royal-muslim', 'modern-minimal', 'super-classic', 'simple-java'],
    showAmpersand: false,
    showParents: false,
  },

  ANNIVERSARY: {
    coverLabel: 'Undangan Anniversary',
    heroPrefix: 'Anniversary',
    titlePlaceholder: 'Anniversary ke-25 Bpk. Joko & Ibu Sri',
    profileFields: {
      main: ['fullName', 'nickname', 'instagram'],
      collapsible: ['bio', 'dateOfBirth', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap',
      nickname: 'Nama Panggilan',
      instagram: 'Instagram (@username)',
      bio: 'Bio Singkat',
      dateOfBirth: 'Tanggal Lahir',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'primary', label: 'Pasangan 1' },
      { value: 'secondary', label: 'Pasangan 2' },
    ],
    defaultProfileCount: 2,
    defaultEventNames: ['Perayaan Anniversary'],
    defaultOpeningText: 'Dengan penuh rasa syukur dan kebahagiaan, kami mengundang Bapak/Ibu/Saudara/i untuk merayakan anniversary kami.',
    defaultClosingText: 'Kehadiran dan doa restu Anda akan menambah kebahagiaan perayaan ini. Terima kasih.',
    recommendedTemplates: ['floral-garden', 'golden-elegance', 'super-classic', 'slide-romantic', 'modern-minimal'],
    showAmpersand: true,
    showParents: false,
  },

  CUSTOM: {
    coverLabel: 'Undangan',
    heroPrefix: '',
    titlePlaceholder: 'Nama Acara Anda',
    profileFields: {
      main: ['fullName', 'nickname', 'instagram'],
      collapsible: ['parentFather', 'parentMother', 'childOrder', 'dateOfBirth', 'age', 'bio', 'gender', 'jobTitle', 'organization', 'address', 'phone'],
    },
    profileLabels: {
      fullName: 'Nama Lengkap',
      nickname: 'Nama Panggilan',
      instagram: 'Instagram (@username)',
      parentFather: 'Nama Ayah',
      parentMother: 'Nama Ibu',
      childOrder: 'Anak Ke-',
      dateOfBirth: 'Tanggal Lahir',
      age: 'Usia',
      bio: 'Bio / Deskripsi',
      gender: 'Jenis Kelamin',
      jobTitle: 'Jabatan / Gelar',
      organization: 'Organisasi / Institusi',
      address: 'Alamat',
      phone: 'No. HP',
    },
    profileRoles: [
      { value: 'primary', label: 'Utama' },
      { value: 'secondary', label: 'Tambahan' },
    ],
    defaultProfileCount: 1,
    defaultEventNames: ['Acara'],
    defaultOpeningText: 'Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara yang akan kami selenggarakan.',
    defaultClosingText: DEFAULT_CLOSING,
    recommendedTemplates: ALL_TEMPLATE_SLUGS,
    showAmpersand: false,
    showParents: false,
  },
};

/**
 * Get config for a given event type, with CUSTOM as fallback
 */
export function getEventTypeConfig(eventType: string): EventTypeConfig {
  return EVENT_TYPE_CONFIG[eventType as EventType] || EVENT_TYPE_CONFIG.CUSTOM;
}

/**
 * Get all profile field keys that should be visible for a given event type
 */
export function getVisibleProfileFields(eventType: string): string[] {
  const config = getEventTypeConfig(eventType);
  return [...config.profileFields.main, ...config.profileFields.collapsible];
}

/**
 * Check if a profile field should be shown in the main section
 */
export function isMainProfileField(eventType: string, field: string): boolean {
  const config = getEventTypeConfig(eventType);
  return config.profileFields.main.includes(field);
}

/**
 * Check if a profile field should be shown in the collapsible section
 */
export function isCollapsibleProfileField(eventType: string, field: string): boolean {
  const config = getEventTypeConfig(eventType);
  return config.profileFields.collapsible.includes(field);
}
