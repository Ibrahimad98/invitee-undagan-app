/**
 * 🧪 DEV SEED — Comprehensive dummy data for development & demo
 *
 * This seed creates rich sample data that covers ALL features:
 * - Multiple users (Admin, Premium, Basic, Fast-Serve, Unverified)
 * - 14 templates (mix of free & premium, scroll & slide)
 * - 4 invitations (Wedding, Khitanan, Birthday, Graduation) with full child data
 * - Guests with mixed sent/unsent statuses + WA blast history
 * - RSVPs with all attendance types
 * - Testimonials (approved + pending)
 * - Notifications (read + unread)
 * - Bug feedbacks (handled + unhandled)
 * - Guest limit requests (pending + approved + rejected)
 * - Invitation comments
 * - Site settings (contact + system auto-created on startup)
 *
 * Run: NODE_ENV=development npx prisma db seed
 *   or: pnpm run db:seed:dev
 */

import {
  PrismaClient,
  Role,
  EventType,
  Attendance,
  MediaPurpose,
  LayoutType,
  GuestLimitRequestStatus,
  BugFeedbackStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function seedDev() {
  console.log('🧪 Starting DEV seed (comprehensive dummy data)...\n');

  // ═══════════════════════════════════════════════════════════
  // 🧹 Clean all tables (FK-safe order: children first)
  // ═══════════════════════════════════════════════════════════
  await prisma.notification.deleteMany();
  await prisma.bugFeedback.deleteMany();
  await prisma.guestLimitRequest.deleteMany();
  await prisma.invitationComment.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.media.deleteMany();
  await prisma.giftAccount.deleteMany();
  await prisma.coInvitor.deleteMany();
  await prisma.invitationTemplate.deleteMany();
  await prisma.invitationEvent.deleteMany();
  await prisma.personProfile.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.template.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // ═══════════════════════════════════════════════════════════
  // ⚙️ Site Settings (contact info for public pages)
  // ═══════════════════════════════════════════════════════════
  await prisma.siteSetting.createMany({
    data: [
      { category: 'contact', item: 'WhatsApp',        value: '081234567890',                description: 'Chat langsung via WhatsApp',    sortOrder: 1, isActive: true },
      { category: 'contact', item: 'Email',            value: 'support@invitee.id',           description: 'Kirim email ke tim kami',        sortOrder: 2, isActive: true },
      { category: 'contact', item: 'Instagram',        value: '@invitee.id',                  description: 'Follow kami di Instagram',       sortOrder: 3, isActive: true },
      { category: 'contact', item: 'Alamat',           value: 'Jakarta, Indonesia',           description: 'Kantor pusat kami',              sortOrder: 4, isActive: true },
      { category: 'contact', item: 'Jam Operasional',  value: 'Senin-Jumat 09:00-17:00 WIB', description: 'Waktu layanan customer support', sortOrder: 5, isActive: true },
    ],
  });
  console.log('⚙️  Contact settings seeded');

  // ═══════════════════════════════════════════════════════════
  // 👤 Users — 5 users covering all subscription tiers & roles
  // ═══════════════════════════════════════════════════════════
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@invitee.com',
      passwordHash: await hash('admin123'),
      fullName: 'Admin Invitee',
      phone: '081200000001',
      role: Role.ADMIN,
      isEmailVerified: true,
      isWhatsappVerified: true,
      isFirstLogin: false,
      maxGuests: 99999,
    },
  });

  const premiumUser = await prisma.user.create({
    data: {
      email: 'premium@invitee.com',
      passwordHash: await hash('premium123'),
      fullName: 'Rina Wulandari',
      phone: '081200000002',
      role: Role.USER,
      subscriptionType: 'PREMIUM',
      subscriptionExpireDate: new Date('2026-12-31'),
      isEmailVerified: true,
      isWhatsappVerified: true,
      isFirstLogin: false,
      maxGuests: 2000,
    },
  });

  const basicUser = await prisma.user.create({
    data: {
      email: 'basic@invitee.com',
      passwordHash: await hash('basic123'),
      fullName: 'Budi Santoso',
      phone: '081200000003',
      role: Role.USER,
      subscriptionType: 'BASIC',
      isEmailVerified: true,
      isWhatsappVerified: false,
      isFirstLogin: false,
      maxGuests: 300,
    },
  });

  const fastServeUser = await prisma.user.create({
    data: {
      email: 'fastserve@invitee.com',
      passwordHash: await hash('fast123'),
      fullName: 'PT Jaya Abadi',
      phone: '081200000004',
      role: Role.USER,
      subscriptionType: 'FAST_SERVE',
      subscriptionExpireDate: new Date('2026-06-30'),
      isEmailVerified: true,
      isWhatsappVerified: true,
      isFirstLogin: false,
      maxGuests: 5000,
    },
  });

  const newUser = await prisma.user.create({
    data: {
      email: 'newuser@invitee.com',
      passwordHash: await hash('newuser123'),
      fullName: 'Calon Pengantin Baru',
      role: Role.USER,
      subscriptionType: 'BASIC',
      isEmailVerified: false,
      isFirstLogin: true,
      maxGuests: 300,
    },
  });

  console.log('👤 5 users created (admin, premium, basic, fast-serve, new/unverified)');

  // ═══════════════════════════════════════════════════════════
  // 🎨 Templates — All 14 templates with realistic dev stats
  // ═══════════════════════════════════════════════════════════
  const templates = await Promise.all([
    prisma.template.create({ data: { name: 'Super Classic',      slug: 'super-classic',      thumbnailUrl: '/images/templates/super-classic.svg',      category: 'elegan',    tags: ['elegan','formal','classic','gold'],                    supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','KHITANAN','AQIQAH','GRADUATION','SYUKURAN','ANNIVERSARY','CORPORATE','REUNION','CUSTOM'], cssClass: 'theme-super-classic',      layoutType: LayoutType.SCROLL, usageCount: 342,  ratingAvg: 4.8, ratingCount: 15, isPremium: false, sortOrder: 1 } }),
    prisma.template.create({ data: { name: 'Simple Java',        slug: 'simple-java',        thumbnailUrl: '/images/templates/simple-java.svg',        category: 'budaya',    tags: ['budaya','jawa','batik','traditional'],                 supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','KHITANAN','SYUKURAN','REUNION','CUSTOM'], cssClass: 'theme-simple-java',        layoutType: LayoutType.SCROLL, usageCount: 189,  ratingAvg: 4.5, ratingCount: 8,  isPremium: false, sortOrder: 2 } }),
    prisma.template.create({ data: { name: 'Floral Garden',      slug: 'floral-garden',      thumbnailUrl: '/images/templates/floral-garden.svg',      category: 'bunga',     tags: ['bunga','floral','pink','romantic'],                    supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','BIRTHDAY','GRADUATION','CUSTOM'], cssClass: 'theme-floral-garden',      layoutType: LayoutType.SCROLL, usageCount: 276,  ratingAvg: 4.7, ratingCount: 12, isPremium: false, sortOrder: 3 } }),
    prisma.template.create({ data: { name: 'Golden Elegance',    slug: 'golden-elegance',    thumbnailUrl: '/images/templates/golden-elegance.svg',    category: 'gold',      tags: ['gold','formal','elegan','luxury'],                    supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','GRADUATION','CORPORATE','CUSTOM'], cssClass: 'theme-golden-elegance',    layoutType: LayoutType.SCROLL, usageCount: 156,  ratingAvg: 4.9, ratingCount: 7,  isPremium: true,  sortOrder: 4 } }),
    prisma.template.create({ data: { name: 'Royal Muslim',       slug: 'royal-muslim',       thumbnailUrl: '/images/templates/royal-muslim.svg',       category: 'muslim',    tags: ['muslim','islamic','green','gold'],                    supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','KHITANAN','AQIQAH','SYUKURAN','CUSTOM'], cssClass: 'theme-royal-muslim',       layoutType: LayoutType.SCROLL, usageCount: 198,  ratingAvg: 4.6, ratingCount: 10, isPremium: false, sortOrder: 5 } }),
    prisma.template.create({ data: { name: 'Kids Party',         slug: 'kids-party',         thumbnailUrl: '/images/templates/kids-party.svg',         category: 'anak',      tags: ['anak','colorful','fun','birthday'],                   supportedEventTypes: ['BIRTHDAY','AQIQAH','KHITANAN','CUSTOM'], cssClass: 'theme-kids-party',         layoutType: LayoutType.SCROLL, usageCount: 87,   ratingAvg: 4.4, ratingCount: 5,  isPremium: false, sortOrder: 6 } }),
    prisma.template.create({ data: { name: 'Wayang Heritage',    slug: 'wayang-heritage',    thumbnailUrl: '/images/templates/wayang-heritage.svg',    category: 'budaya',    tags: ['budaya','wayang','traditional','brown'],              supportedEventTypes: ['WEDDING','ENGAGEMENT','KHITANAN','SYUKURAN','REUNION','CUSTOM'], cssClass: 'theme-wayang-heritage',    layoutType: LayoutType.SCROLL, usageCount: 64,   ratingAvg: 4.3, ratingCount: 4,  isPremium: false, sortOrder: 7 } }),
    prisma.template.create({ data: { name: 'Modern Minimal',     slug: 'modern-minimal',     thumbnailUrl: '/images/templates/modern-minimal.svg',     category: 'simple',    tags: ['simple','minimal','clean','modern'],                  supportedEventTypes: ['WEDDING','ENGAGEMENT','BIRTHDAY','GRADUATION','REUNION','CORPORATE','ANNIVERSARY','SYUKURAN','CUSTOM'], cssClass: 'theme-modern-minimal',     layoutType: LayoutType.SCROLL, usageCount: 134,  ratingAvg: 4.6, ratingCount: 9,  isPremium: false, sortOrder: 8 } }),
    prisma.template.create({ data: { name: 'Christmas Joy',      slug: 'christmas-joy',      thumbnailUrl: '/images/templates/christmas-joy.svg',      category: 'natal',     tags: ['natal','christmas','red','green'],                    supportedEventTypes: ['BIRTHDAY','SYUKURAN','REUNION','CUSTOM'], cssClass: 'theme-christmas-joy',      layoutType: LayoutType.SCROLL, usageCount: 32,   ratingAvg: 4.2, ratingCount: 3,  isPremium: false, sortOrder: 9 } }),
    prisma.template.create({ data: { name: 'Slide Romantic',     slug: 'slide-romantic',     thumbnailUrl: '/images/templates/slide-romantic.svg',     category: 'slide',     tags: ['slide','elegan','romantic','pink'],                   supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','CUSTOM'], cssClass: 'theme-slide-romantic',     layoutType: LayoutType.SLIDE,  usageCount: 91,   ratingAvg: 4.5, ratingCount: 6,  isPremium: true,  sortOrder: 10 } }),
    prisma.template.create({ data: { name: 'Enchanted Garden',   slug: 'enchanted-garden',   thumbnailUrl: '/images/templates/enchanted-garden.svg',   category: 'garden',    tags: ['garden','bunga','elegan','romantic','sage','ivory'],  supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','CUSTOM'], cssClass: 'theme-enchanted-garden',   layoutType: LayoutType.SCROLL, usageCount: 45,   ratingAvg: 4.7, ratingCount: 3,  isPremium: true,  sortOrder: 11 } }),
    prisma.template.create({ data: { name: 'Royal Blossom',      slug: 'royal-blossom',      thumbnailUrl: '/images/templates/royal-blossom.svg',      category: 'royal',     tags: ['royal','elegan','gold','burgundy','dark','romantic'], supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','CUSTOM'], cssClass: 'theme-royal-blossom',      layoutType: LayoutType.SCROLL, usageCount: 28,   ratingAvg: 4.8, ratingCount: 2,  isPremium: true,  sortOrder: 12 } }),
    prisma.template.create({ data: { name: 'Celestial Garden',   slug: 'celestial-garden',   thumbnailUrl: '/images/templates/celestial-garden.svg',   category: 'celestial', tags: ['celestial','mystical','forest','firefly','teal','nature','bioluminescent'], supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','CUSTOM'], cssClass: 'theme-celestial-garden',   layoutType: LayoutType.SCROLL, usageCount: 12,   ratingAvg: 5.0, ratingCount: 1,  isPremium: true,  sortOrder: 13 } }),
    prisma.template.create({ data: { name: 'Ethereal Bloom',     slug: 'ethereal-bloom',     thumbnailUrl: '/images/templates/ethereal-bloom.svg',     category: 'ethereal',  tags: ['ethereal','dreamy','particles','threejs','lavender','rose-gold','luminous','gpu'], supportedEventTypes: ['WEDDING','ENGAGEMENT','WALIMAH','ANNIVERSARY','CUSTOM'], cssClass: 'theme-ethereal-bloom',     layoutType: LayoutType.SCROLL, usageCount: 8,    ratingAvg: 5.0, ratingCount: 1,  isPremium: true,  sortOrder: 14 } }),
  ]);

  console.log(`🎨 ${templates.length} templates created (with dev usage stats)`);

  // Helper to find template by slug
  const tpl = (slug: string) => templates.find(t => t.slug === slug)!;

  // ═══════════════════════════════════════════════════════════
  // 💌 Invitation 1: Wedding (Premium user) — full data
  // ═══════════════════════════════════════════════════════════
  const weddingInv = await prisma.invitation.create({
    data: {
      userId: premiumUser.id,
      slug: 'pernikahan-andi-sari',
      title: 'Pernikahan Andi & Sari',
      eventType: EventType.WEDDING,
      openingText: 'Assalamualaikum Warahmatullahi Wabarakatuh\n\nDengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami.',
      closingText: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restunya kami ucapkan terima kasih.\n\nWassalamualaikum Warahmatullahi Wabarakatuh',
      story: 'Pertemuan pertama kami di bangku kuliah tahun 2018, tak pernah kami sangka akan membawa kami ke pelaminan. Dari teman sekelas, menjadi sahabat, lalu tumbuh menjadi cinta yang kami jaga hingga hari ini.',
      isPublished: true,
      viewCount: 1247,
    },
  });

  await prisma.invitationEvent.createMany({
    data: [
      { invitationId: weddingInv.id, eventName: 'Akad Nikah', eventDate: '2026-08-20', startTime: '08:00', endTime: '10:00', venueName: 'Masjid Al-Ikhlas', venueAddress: 'Jl. Masjid Raya No. 1, Jakarta Selatan', mapUrl: 'https://maps.google.com/?q=-6.2615,106.8106', latitude: -6.2615, longitude: 106.8106, sortOrder: 0 },
      { invitationId: weddingInv.id, eventName: 'Resepsi', eventDate: '2026-08-20', startTime: '11:00', endTime: '15:00', venueName: 'Grand Ballroom Hotel Mulia', venueAddress: 'Jl. Asia Afrika, Senayan, Jakarta Selatan', mapUrl: 'https://maps.google.com/?q=-6.2253,106.8025', latitude: -6.2253, longitude: 106.8025, sortOrder: 1 },
    ],
  });

  await prisma.personProfile.createMany({
    data: [
      { invitationId: weddingInv.id, fullName: 'Andi Pratama', nickname: 'Andi', photoUrl: '/images/placeholder-groom.jpg', parentFather: 'Bapak Heru Pratama', parentMother: 'Ibu Siti Aminah', childOrder: 'Putra Pertama', role: 'groom', instagram: '@andipratama', sortOrder: 0 },
      { invitationId: weddingInv.id, fullName: 'Sari Dewi Lestari', nickname: 'Sari', photoUrl: '/images/placeholder-bride.jpg', parentFather: 'Bapak Budi Lestari', parentMother: 'Ibu Ratna Dewi', childOrder: 'Putri Kedua', role: 'bride', instagram: '@saridewi', sortOrder: 1 },
    ],
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.media.create({ data: { invitationId: weddingInv.id, userId: premiumUser.id, fileUrl: `/images/placeholder-wedding-${i}.jpg`, fileType: 'image', fileSize: 800000, originalName: `wedding-photo-${i}.jpg`, purpose: MediaPurpose.GALLERY, sortOrder: i } });
  }

  await prisma.giftAccount.createMany({ data: [
    { invitationId: weddingInv.id, bankName: 'BCA', accountNumber: '9876543210', accountHolder: 'Andi Pratama', sortOrder: 0 },
    { invitationId: weddingInv.id, bankName: 'Bank Mandiri', accountNumber: '1112233445', accountHolder: 'Sari Dewi Lestari', sortOrder: 1 },
  ]});

  await prisma.coInvitor.createMany({ data: [
    { invitationId: weddingInv.id, name: 'Bapak H. Sulaiman', title: 'Tokoh Masyarakat', sortOrder: 0 },
    { invitationId: weddingInv.id, name: 'Ibu Hj. Fatimah', title: 'Ketua PKK', sortOrder: 1 },
  ]});

  await prisma.invitationTemplate.create({ data: { invitationId: weddingInv.id, templateId: tpl('floral-garden').id, isPrimary: true } });

  // Wedding guests (15 — mix of sent & unsent)
  const weddingGuestData = [
    { name: 'Bapak & Ibu Wijaya',      phone: '081200000020', groupName: 'Keluarga Mempelai Pria', isSent: true, sentAt: new Date('2026-07-15'), sentVia: 'WHATSAPP' },
    { name: 'Keluarga Besar Lestari',   phone: '081200000021', groupName: 'Keluarga Mempelai Wanita', isSent: true, sentAt: new Date('2026-07-15'), sentVia: 'WHATSAPP' },
    { name: 'Bapak Rudi',               phone: '081200000022', groupName: 'Teman Kuliah',   isSent: true, sentAt: new Date('2026-07-16'), sentVia: 'WHATSAPP' },
    { name: 'Ibu Mega Purnama',         phone: '081200000023', groupName: 'Teman Kantor',   isSent: true, sentAt: new Date('2026-07-16'), sentVia: 'WHATSAPP' },
    { name: 'Bapak Hendra',             phone: '081200000024', groupName: 'Tetangga',       isSent: true, sentAt: new Date('2026-07-17'), sentVia: 'MANUAL' },
    { name: 'Drs. Ahmad Yani',          phone: '081200000025', groupName: 'Rekan Bisnis',   isSent: false },
    { name: 'Ibu Kartini',              phone: '081200000026', groupName: 'Teman Kantor',   isSent: false },
    { name: 'Bapak Joko Widodo',        phone: '081200000027', groupName: 'Tetangga',       isSent: false },
    { name: 'Keluarga Pak RT',          phone: '081200000028', groupName: 'Tetangga',       isSent: false },
    { name: 'Ibu Dewi Sartika',         phone: '081200000029', groupName: 'Teman Kuliah',   isSent: false },
    { name: 'Bapak Surya Darma',        phone: '081200000030', groupName: 'Keluarga Mempelai Pria', isSent: false },
    { name: 'Nona Fitri Handayani',     phone: '081200000031', groupName: 'Teman Kantor',   isSent: false },
    { name: 'Tante Lisa',               phone: '081200000032', groupName: 'Keluarga Mempelai Wanita', isSent: false },
    { name: 'Om Bambang',               phone: '081200000033', groupName: 'Keluarga Mempelai Pria', isSent: false },
    { name: 'Keluarga Besar Aminah',    phone: '',             groupName: 'Keluarga Mempelai Pria', isSent: false },
  ];
  for (const g of weddingGuestData) {
    await prisma.guest.create({ data: { invitationId: weddingInv.id, ...g } });
  }

  // Wedding RSVPs
  const weddingRsvps = [
    { invitationId: weddingInv.id, guestName: 'Bapak & Ibu Wijaya',    message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah mawaddah warahmah.', attendance: Attendance.ATTENDING, numGuests: 4 },
    { invitationId: weddingInv.id, guestName: 'Keluarga Besar Lestari', message: 'Barakallahu lakuma, semoga bahagia dunia akhirat!', attendance: Attendance.ATTENDING, numGuests: 6 },
    { invitationId: weddingInv.id, guestName: 'Bapak Rudi',             message: 'Congrats bro! Akhirnya nyusul juga 😄', attendance: Attendance.ATTENDING, numGuests: 2 },
    { invitationId: weddingInv.id, guestName: 'Ibu Mega Purnama',       message: 'Happy wedding! Semoga langgeng ya.', attendance: Attendance.MAYBE, numGuests: 1 },
    { invitationId: weddingInv.id, guestName: 'Bapak Hendra',           message: 'Maaf tidak bisa hadir, ada acara keluarga. Doa terbaik untuk kalian berdua!', attendance: Attendance.NOT_ATTENDING, numGuests: 0 },
    { invitationId: weddingInv.id, guestName: 'Tamu Tak Diundang',      message: 'Wah bagus banget undangannya! Selamat ya!', attendance: Attendance.ATTENDING, numGuests: 1 },
  ];
  for (const r of weddingRsvps) { await prisma.rsvp.create({ data: r }); }

  // Wedding invitation comments
  await prisma.invitationComment.createMany({ data: [
    { invitationId: weddingInv.id, name: 'Bapak Rudi', message: 'Undangannya keren banget! Modern dan elegan. 👏' },
    { invitationId: weddingInv.id, name: 'Nona Fitri', message: 'Wah template-nya cantik! Semoga bahagia selalu ya 🌸' },
    { invitationId: weddingInv.id, name: 'Om Bambang', message: 'Masyaallah, undangan digitalnya bagus sekali. Sukses acaranya!' },
  ]});

  console.log('💒 Wedding invitation created (15 guests, 6 RSVPs, 3 comments)');

  // ═══════════════════════════════════════════════════════════
  // 💌 Invitation 2: Khitanan (Basic user) — medium data
  // ═══════════════════════════════════════════════════════════
  const khitananInv = await prisma.invitation.create({
    data: {
      userId: basicUser.id,
      slug: 'khitanan-muhammad-zidan',
      title: 'Khitanan Muhammad Zidan',
      eventType: EventType.KHITANAN,
      openingText: 'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara Khitanan putra kami.',
      closingText: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Atas kehadiran dan doa restunya kami ucapkan terima kasih.',
      isPublished: true,
      viewCount: 356,
    },
  });

  await prisma.invitationEvent.create({ data: { invitationId: khitananInv.id, eventName: 'Khitanan', eventDate: '2026-06-15', startTime: '10:00', endTime: '14:00', venueName: 'AULA RW. 003', venueAddress: 'Jl. Raya Cempaka No. 15, RT 003/RW 003, Kel. Sukamaju, Kec. Cimanggis, Kota Depok', mapUrl: 'https://maps.google.com/?q=-6.3728,106.8574', latitude: -6.3728, longitude: 106.8574, sortOrder: 0 } });

  await prisma.personProfile.create({ data: { invitationId: khitananInv.id, fullName: 'Muhammad Zidan Febriansyah', nickname: 'Zidan', photoUrl: '/images/placeholder-child.jpg', parentFather: 'Bapak Mulyadi Yusuf', parentMother: 'Ibu Estiyanah', childOrder: 'Putra Ketiga', dateOfBirth: '2015-02-10', age: '11 tahun', gender: 'Laki-laki', role: 'primary', sortOrder: 0 } });

  for (let i = 1; i <= 3; i++) {
    await prisma.media.create({ data: { invitationId: khitananInv.id, userId: basicUser.id, fileUrl: `/images/placeholder-gallery-${i}.jpg`, fileType: 'image', fileSize: 500000, originalName: `photo-${i}.jpg`, purpose: MediaPurpose.GALLERY, sortOrder: i } });
  }

  await prisma.giftAccount.create({ data: { invitationId: khitananInv.id, bankName: 'BCA', accountNumber: '1234567890', accountHolder: 'Mulyadi Yusuf', sortOrder: 0 } });
  await prisma.coInvitor.createMany({ data: [
    { invitationId: khitananInv.id, name: 'Bapak Suhaeli', title: 'Ketua RW 003', sortOrder: 0 },
    { invitationId: khitananInv.id, name: 'Bapak Ahmad Ridwan', title: 'Ketua RT 003', sortOrder: 1 },
  ]});
  await prisma.invitationTemplate.create({ data: { invitationId: khitananInv.id, templateId: tpl('super-classic').id, isPrimary: true } });

  const khitananGuests = [
    { name: 'Bapak Budi',  phone: '081200000010', groupName: 'Keluarga',     isSent: true, sentAt: new Date('2026-06-01'), sentVia: 'WHATSAPP' },
    { name: 'Ibu Susi',    phone: '081200000011', groupName: 'Keluarga',     isSent: true, sentAt: new Date('2026-06-01'), sentVia: 'WHATSAPP' },
    { name: 'Bapak Agus',  phone: '081200000012', groupName: 'Tetangga',     isSent: true, sentAt: new Date('2026-06-02'), sentVia: 'MANUAL' },
    { name: 'Bapak Dedi',  phone: '081200000013', groupName: 'Teman Kantor', isSent: false },
    { name: 'Ibu Rina',    phone: '081200000014', groupName: 'Teman Kantor', isSent: false },
    { name: 'Pak Lurah',   phone: '081200000015', groupName: 'Tokoh',        isSent: false },
    { name: 'Ibu Yanti',   phone: '',             groupName: 'Tetangga',     isSent: false },
  ];
  for (const g of khitananGuests) { await prisma.guest.create({ data: { invitationId: khitananInv.id, ...g } }); }

  const khitananRsvps = [
    { invitationId: khitananInv.id, guestName: 'Bapak Budi', message: 'Semoga acaranya lancar, insya Allah hadir!', attendance: Attendance.ATTENDING, numGuests: 2 },
    { invitationId: khitananInv.id, guestName: 'Ibu Susi', message: 'Turut berbahagia! Semoga sehat selalu.', attendance: Attendance.ATTENDING, numGuests: 3 },
    { invitationId: khitananInv.id, guestName: 'Bapak Agus', message: 'Maaf belum bisa konfirmasi', attendance: Attendance.MAYBE, numGuests: 1 },
    { invitationId: khitananInv.id, guestName: 'Bapak Dedi', message: 'Mohon maaf tidak bisa hadir, ada tugas keluar kota.', attendance: Attendance.NOT_ATTENDING, numGuests: 0 },
  ];
  for (const r of khitananRsvps) { await prisma.rsvp.create({ data: r }); }

  await prisma.invitationComment.createMany({ data: [
    { invitationId: khitananInv.id, name: 'Bapak Budi', message: 'Semoga Zidan sehat selalu dan jadi anak yang sholeh! 🤲' },
    { invitationId: khitananInv.id, name: 'Ibu Susi', message: 'MasyaAllah, undangannya bagus! Sampai ketemu di acara ya.' },
  ]});

  console.log('🧒 Khitanan invitation created (7 guests, 4 RSVPs, 2 comments)');

  // ═══════════════════════════════════════════════════════════
  // 💌 Invitation 3: Birthday (Premium user, second invitation)
  // ═══════════════════════════════════════════════════════════
  const birthdayInv = await prisma.invitation.create({
    data: {
      userId: premiumUser.id,
      slug: 'ultah-ke-30-rina',
      title: 'Ulang Tahun ke-30 Rina',
      eventType: EventType.BIRTHDAY,
      openingText: 'You are invited to celebrate! 🎉\n\nWith joy in our hearts, we invite you to join us for a special birthday celebration.',
      closingText: 'Your presence is the greatest gift. See you there! 🎂',
      isPublished: true,
      viewCount: 89,
    },
  });

  await prisma.invitationEvent.create({ data: { invitationId: birthdayInv.id, eventName: 'Birthday Party', eventDate: '2026-09-15', startTime: '18:00', endTime: '22:00', venueName: 'Rooftop Café Jakarta', venueAddress: 'Jl. Sudirman No. 100, Lt. 20, Jakarta Pusat', mapUrl: 'https://maps.google.com/?q=-6.2088,106.8456', latitude: -6.2088, longitude: 106.8456, sortOrder: 0 } });
  await prisma.personProfile.create({ data: { invitationId: birthdayInv.id, fullName: 'Rina Wulandari', nickname: 'Rina', photoUrl: '/images/placeholder-birthday.jpg', dateOfBirth: '1996-09-15', age: '30 tahun', role: 'primary', sortOrder: 0 } });

  for (let i = 1; i <= 4; i++) {
    await prisma.media.create({ data: { invitationId: birthdayInv.id, userId: premiumUser.id, fileUrl: `/images/placeholder-birthday-${i}.jpg`, fileType: 'image', fileSize: 600000, originalName: `birthday-${i}.jpg`, purpose: MediaPurpose.GALLERY, sortOrder: i } });
  }

  await prisma.invitationTemplate.create({ data: { invitationId: birthdayInv.id, templateId: tpl('kids-party').id, isPrimary: true } });

  const birthdayGuests = [
    { name: 'Sarah', phone: '081200000040', groupName: 'Best Friends', isSent: true, sentAt: new Date('2026-09-01'), sentVia: 'WHATSAPP' },
    { name: 'Diana', phone: '081200000041', groupName: 'Best Friends', isSent: true, sentAt: new Date('2026-09-01'), sentVia: 'WHATSAPP' },
    { name: 'Yoga', phone: '081200000042', groupName: 'Kantor', isSent: false },
    { name: 'Tina', phone: '081200000043', groupName: 'Kantor', isSent: false },
    { name: 'Kevin', phone: '081200000044', groupName: 'Komunitas', isSent: false },
  ];
  for (const g of birthdayGuests) { await prisma.guest.create({ data: { invitationId: birthdayInv.id, ...g } }); }

  await prisma.rsvp.createMany({ data: [
    { invitationId: birthdayInv.id, guestName: 'Sarah', message: 'Happy birthday bestie! 🎉 Can\'t wait!', attendance: Attendance.ATTENDING, numGuests: 1 },
    { invitationId: birthdayInv.id, guestName: 'Diana', message: 'Count me in! 🎂', attendance: Attendance.ATTENDING, numGuests: 2 },
  ]});

  console.log('🎂 Birthday invitation created (5 guests, 2 RSVPs)');

  // ═══════════════════════════════════════════════════════════
  // 💌 Invitation 4: Graduation (Fast-Serve user) — draft
  // ═══════════════════════════════════════════════════════════
  const gradInv = await prisma.invitation.create({
    data: {
      userId: fastServeUser.id,
      slug: 'wisuda-universitas-jaya',
      title: 'Perayaan Wisuda Universitas Jaya 2026',
      eventType: EventType.GRADUATION,
      openingText: 'Dengan penuh syukur, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri perayaan wisuda.',
      closingText: 'Terima kasih atas doa dan dukungan yang diberikan selama ini.',
      isPublished: false, // Draft — belum dipublish
      viewCount: 0,
    },
  });

  await prisma.invitationEvent.create({ data: { invitationId: gradInv.id, eventName: 'Wisuda', eventDate: '2026-11-01', startTime: '09:00', endTime: '13:00', venueName: 'Balai Sidang Universitas Jaya', venueAddress: 'Jl. Pendidikan No. 1, Bandung', sortOrder: 0 } });
  await prisma.personProfile.create({ data: { invitationId: gradInv.id, fullName: 'Angkatan 2022', nickname: 'Wisudawan/ti', role: 'primary', sortOrder: 0 } });
  await prisma.invitationTemplate.create({ data: { invitationId: gradInv.id, templateId: tpl('modern-minimal').id, isPrimary: true } });

  console.log('🎓 Graduation invitation created (draft, no guests yet)');

  // ═══════════════════════════════════════════════════════════
  // ⭐ Testimonials — 6 testimonials (4 approved, 2 pending)
  // ═══════════════════════════════════════════════════════════
  const testimonials = [
    { userName: 'Ahmad Fajar',       message: 'Platform undangan digital terbaik! Mudah digunakan dan tampilannya sangat elegan. Tamu undangan saya banyak yang memuji.',                  rating: 5, ratingDesain: 5, ratingKemudahan: 5, ratingLayanan: 5, templateId: tpl('super-classic').id,    isApproved: true },
    { userName: 'Dewi Anggraini',    message: 'Sangat membantu untuk acara pernikahan kami. Template-nya bagus-bagus dan banyak pilihan. Terima kasih Invitee!',                            rating: 5, ratingDesain: 5, ratingKemudahan: 4, ratingLayanan: 5, templateId: tpl('floral-garden').id,    isApproved: true },
    { userName: 'Siti Nurhaliza',    message: 'Undangan digitalnya keren banget! Fitur RSVP-nya sangat berguna untuk menghitung jumlah tamu.',                                              rating: 5, ratingDesain: 5, ratingKemudahan: 5, ratingLayanan: 4, templateId: tpl('wayang-heritage').id,  isApproved: true },
    { userName: 'Hendra Gunawan',    message: 'Fitur blast WA sangat memudahkan. Tidak perlu kirim satu-satu. Recommended banget!',                                                        rating: 5, ratingDesain: 4, ratingKemudahan: 5, ratingLayanan: 5, templateId: tpl('golden-elegance').id, isApproved: true },
    { userName: 'Rizki Hidayat',     message: 'Good app, cuma kadang loading-nya agak lama kalau banyak foto. Semoga bisa lebih cepat.',                                                    rating: 4, ratingDesain: 4, ratingKemudahan: 3, ratingLayanan: 4, templateId: tpl('modern-minimal').id,  isApproved: false },
    { userName: 'Maya Putri',        message: 'Baru coba bikin undangan, templatenya cantik-cantik! Belum selesai sih tapi so far so good.',                                                rating: 4, ratingDesain: 5, ratingKemudahan: 4, ratingLayanan: 3, templateId: tpl('enchanted-garden').id, isApproved: false },
  ];
  for (const t of testimonials) { await prisma.testimonial.create({ data: t }); }

  console.log('⭐ 6 testimonials created (4 approved, 2 pending)');

  // ═══════════════════════════════════════════════════════════
  // 🔔 Notifications — Mix of read & unread for admin + users
  // ═══════════════════════════════════════════════════════════
  await prisma.notification.createMany({ data: [
    // Admin notifications
    { userId: adminUser.id, type: 'PREMIUM_REQUEST',   title: 'Permintaan Akses Premium',         message: 'Budi Santoso (basic@invitee.com) mengajukan request akses fitur Premium. Alasan: Butuh template premium untuk acara khitanan.', linkUrl: '/dashboard/users', isRead: false },
    { userId: adminUser.id, type: 'BUG_FEEDBACK_NEW',  title: 'Laporan Bug Baru',                  message: 'Budi Santoso melaporkan bug: "Foto gallery tidak muncul di mobile view".',                                                        linkUrl: '/dashboard/settings', isRead: false },
    { userId: adminUser.id, type: 'TESTIMONIAL_NEW',   title: 'Testimoni Baru Perlu Review',       message: 'Rizki Hidayat memberikan testimoni baru (rating 4/5). Perlu disetujui oleh admin.',                                               linkUrl: '/dashboard/settings', isRead: true },
    { userId: adminUser.id, type: 'TESTIMONIAL_NEW',   title: 'Testimoni Baru Perlu Review',       message: 'Maya Putri memberikan testimoni baru (rating 4/5). Perlu disetujui oleh admin.',                                                  linkUrl: '/dashboard/settings', isRead: true },
    // User notifications
    { userId: premiumUser.id, type: 'REQUEST_APPROVED', title: 'Akses Premium Disetujui! 🎉',      message: 'Selamat! Permintaan akses Premium Anda telah disetujui. Anda sekarang memiliki akses ke semua fitur Premium dengan kuota 2000 tamu.', linkUrl: '/dashboard/subscription', isRead: true },
    { userId: basicUser.id,   type: 'REQUEST_REJECTED', title: 'Permintaan Premium Ditolak',        message: 'Permintaan akses Premium Anda belum dapat disetujui saat ini. Alasan: Kuota premium bulan ini sudah penuh, silakan coba lagi bulan depan.', linkUrl: '/dashboard/subscription', isRead: false },
  ]});

  console.log('🔔 6 notifications created (mix of read/unread)');

  // ═══════════════════════════════════════════════════════════
  // 🐛 Bug Feedbacks — 3 reports (2 unhandled, 1 handled)
  // ═══════════════════════════════════════════════════════════
  await prisma.bugFeedback.createMany({ data: [
    { userId: basicUser.id,   userName: 'Budi Santoso',    subject: 'Foto gallery tidak muncul di mobile',       message: 'Saat buka undangan di HP (Chrome Android), foto gallery tidak tampil. Hanya muncul placeholder. Sudah coba clear cache tapi tetap sama.', category: 'bug',     status: BugFeedbackStatus.UNHANDLED },
    { userId: premiumUser.id, userName: 'Rina Wulandari',  subject: 'Request fitur dark mode',                    message: 'Apakah bisa ditambahkan opsi dark mode untuk template undangan? Akan sangat bagus untuk tema acara malam hari.', category: 'feature', status: BugFeedbackStatus.UNHANDLED },
    { userId: basicUser.id,   userName: 'Budi Santoso',    subject: 'Typo di halaman pricing',                    message: 'Di halaman pricing ada typo "Premum" seharusnya "Premium".',                                                                           category: 'bug',     status: BugFeedbackStatus.HANDLED, adminNote: 'Sudah diperbaiki. Terima kasih laporannya!' },
  ]});

  console.log('🐛 3 bug feedbacks created (2 unhandled, 1 handled)');

  // ═══════════════════════════════════════════════════════════
  // 📋 Guest Limit Requests — 3 statuses
  // ═══════════════════════════════════════════════════════════
  await prisma.guestLimitRequest.createMany({ data: [
    { userId: basicUser.id, currentLimit: 300, requestedAmount: 2000, reason: '[Request Premium] Butuh template premium dan kuota tamu lebih banyak untuk acara khitanan anak.', status: GuestLimitRequestStatus.PENDING },
    { userId: premiumUser.id, currentLimit: 300, requestedAmount: 2000, reason: '[Request Premium] Ingin akses template premium untuk pernikahan.', status: GuestLimitRequestStatus.APPROVED, adminNote: 'Disetujui. Selamat menikah!' },
    { userId: fastServeUser.id, currentLimit: 300, requestedAmount: 5000, reason: '[Request Enterprise] Kami perusahaan event organizer, butuh kuota besar.', status: GuestLimitRequestStatus.REJECTED, adminNote: 'Sudah di-upgrade secara langsung ke FAST_SERVE oleh admin.' },
  ]});

  console.log('📋 3 guest limit requests created (pending/approved/rejected)');

  // ═══════════════════════════════════════════════════════════
  // 📊 Summary
  // ═══════════════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════');
  console.log('✅ DEV seed completed! Summary:');
  console.log('───────────────────────────────────────────────');
  console.log('  👤 5 users (admin, premium, basic, fast-serve, new)');
  console.log('  🎨 14 templates (with dev usage stats)');
  console.log('  💌 4 invitations:');
  console.log('     └─ Wedding  (published, 15 guests, 6 RSVPs, 3 comments)');
  console.log('     └─ Khitanan (published, 7 guests, 4 RSVPs, 2 comments)');
  console.log('     └─ Birthday (published, 5 guests, 2 RSVPs)');
  console.log('     └─ Graduation (draft, 0 guests)');
  console.log('  ⭐ 6 testimonials (4 approved, 2 pending)');
  console.log('  🔔 6 notifications (mix read/unread)');
  console.log('  🐛 3 bug feedbacks (2 unhandled, 1 handled)');
  console.log('  📋 3 guest limit requests (pending/approved/rejected)');
  console.log('  ⚙️  5 contact settings');
  console.log('═══════════════════════════════════════════════');
  console.log('\n🔑 Login credentials:');
  console.log('  Admin:       admin@invitee.com    / admin123');
  console.log('  Premium:     premium@invitee.com  / premium123');
  console.log('  Basic:       basic@invitee.com    / basic123');
  console.log('  Fast-Serve:  fastserve@invitee.com / fast123');
  console.log('  New User:    newuser@invitee.com  / newuser123');
}
