import { PrismaClient, Role, EventType, Attendance, MediaPurpose, LayoutType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
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
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // --- Users ---
  const adminPassword = await bcrypt.hash('admin123', 12);
  const demoPassword = await bcrypt.hash('demo123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@invitee.com',
      passwordHash: adminPassword,
      fullName: 'Admin Invitee',
      phone: '081200000001',
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@invitee.com',
      passwordHash: demoPassword,
      fullName: 'Demo User',
      phone: '081200000002',
      role: Role.USER,
    },
  });

  console.log('👤 Users created');

  // --- Templates ---
  const templates = await Promise.all([
    prisma.template.create({
      data: {
        name: 'Super Classic',
        slug: 'super-classic',
        thumbnailUrl: '/images/templates/super-classic.svg',
        category: 'elegan',
        tags: ['elegan', 'formal', 'classic', 'gold'],
        cssClass: 'theme-super-classic',
        layoutType: LayoutType.SCROLL,
        usageCount: 3340,
        ratingAvg: 4.8,
        isPremium: false,
        sortOrder: 1,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Simple Java',
        slug: 'simple-java',
        thumbnailUrl: '/images/templates/simple-java.svg',
        category: 'budaya',
        tags: ['budaya', 'jawa', 'batik', 'traditional'],
        cssClass: 'theme-simple-java',
        layoutType: LayoutType.SCROLL,
        usageCount: 1414,
        ratingAvg: 4.6,
        isPremium: false,
        sortOrder: 2,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Floral Garden',
        slug: 'floral-garden',
        thumbnailUrl: '/images/templates/floral-garden.svg',
        category: 'bunga',
        tags: ['bunga', 'floral', 'pink', 'romantic'],
        cssClass: 'theme-floral-garden',
        layoutType: LayoutType.SCROLL,
        usageCount: 987,
        ratingAvg: 4.7,
        isPremium: false,
        sortOrder: 3,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Golden Elegance',
        slug: 'golden-elegance',
        thumbnailUrl: '/images/templates/golden-elegance.svg',
        category: 'gold',
        tags: ['gold', 'formal', 'elegan', 'luxury'],
        cssClass: 'theme-golden-elegance',
        layoutType: LayoutType.SCROLL,
        usageCount: 756,
        ratingAvg: 4.9,
        isPremium: true,
        sortOrder: 4,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Royal Muslim',
        slug: 'royal-muslim',
        thumbnailUrl: '/images/templates/royal-muslim.svg',
        category: 'muslim',
        tags: ['muslim', 'islamic', 'green', 'gold'],
        cssClass: 'theme-royal-muslim',
        layoutType: LayoutType.SCROLL,
        usageCount: 623,
        ratingAvg: 4.5,
        isPremium: false,
        sortOrder: 5,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Kids Party',
        slug: 'kids-party',
        thumbnailUrl: '/images/templates/kids-party.svg',
        category: 'anak',
        tags: ['anak', 'colorful', 'fun', 'birthday'],
        cssClass: 'theme-kids-party',
        layoutType: LayoutType.SCROLL,
        usageCount: 412,
        ratingAvg: 4.4,
        isPremium: false,
        sortOrder: 6,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Wayang Heritage',
        slug: 'wayang-heritage',
        thumbnailUrl: '/images/templates/wayang-heritage.svg',
        category: 'budaya',
        tags: ['budaya', 'wayang', 'traditional', 'brown'],
        cssClass: 'theme-wayang-heritage',
        layoutType: LayoutType.SCROLL,
        usageCount: 298,
        ratingAvg: 4.3,
        isPremium: false,
        sortOrder: 7,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Modern Minimal',
        slug: 'modern-minimal',
        thumbnailUrl: '/images/templates/modern-minimal.svg',
        category: 'simple',
        tags: ['simple', 'minimal', 'clean', 'modern'],
        cssClass: 'theme-modern-minimal',
        layoutType: LayoutType.SCROLL,
        usageCount: 534,
        ratingAvg: 4.6,
        isPremium: false,
        sortOrder: 8,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Christmas Joy',
        slug: 'christmas-joy',
        thumbnailUrl: '/images/templates/christmas-joy.svg',
        category: 'natal',
        tags: ['natal', 'christmas', 'red', 'green'],
        cssClass: 'theme-christmas-joy',
        layoutType: LayoutType.SCROLL,
        usageCount: 189,
        ratingAvg: 4.2,
        isPremium: false,
        sortOrder: 9,
      },
    }),
    prisma.template.create({
      data: {
        name: 'Slide Romantic',
        slug: 'slide-romantic',
        thumbnailUrl: '/images/templates/slide-romantic.svg',
        category: 'slide',
        tags: ['slide', 'elegan', 'romantic', 'pink'],
        cssClass: 'theme-slide-romantic',
        layoutType: LayoutType.SLIDE,
        usageCount: 367,
        ratingAvg: 4.5,
        isPremium: true,
        sortOrder: 10,
      },
    }),
  ]);

  console.log(`🎨 ${templates.length} templates created`);

  // --- Demo Invitation 1: Khitanan ---
  const khitananInv = await prisma.invitation.create({
    data: {
      userId: demoUser.id,
      slug: 'khitanan-muhammad-zidan-febriansyah',
      title: 'Khitanan Muhammad Zidan Febriansyah',
      eventType: EventType.KHITANAN,
      openingText:
        'Dengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara Khitanan putra kami.',
      closingText:
        'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Atas kehadiran dan doa restunya kami ucapkan terima kasih.',
      isPublished: true,
      viewCount: 142,
    },
  });

  await prisma.invitationEvent.create({
    data: {
      invitationId: khitananInv.id,
      eventName: 'Khitanan',
      eventDate: '2025-06-15',
      startTime: '10:00',
      endTime: '14:00',
      venueName: 'AULA RW. 003',
      venueAddress: 'Jl. Raya Cempaka No. 15, RT 003/RW 003, Kel. Sukamaju, Kec. Cimanggis, Kota Depok',
      mapUrl: 'https://maps.google.com/?q=-6.3728,106.8574',
      latitude: -6.3728,
      longitude: 106.8574,
      sortOrder: 0,
    },
  });

  await prisma.personProfile.create({
    data: {
      invitationId: khitananInv.id,
      fullName: 'Muhammad Zidan Febriansyah',
      nickname: 'Zidan',
      photoUrl: '/images/placeholder-child.jpg',
      parentFather: 'Bapak Mulyadi Yusuf',
      parentMother: 'Ibu Estiyanah',
      childOrder: 'Putra Ketiga',
      role: 'primary',
      sortOrder: 0,
    },
  });

  // Gallery
  for (let i = 1; i <= 3; i++) {
    await prisma.media.create({
      data: {
        invitationId: khitananInv.id,
        userId: demoUser.id,
        fileUrl: `/images/placeholder-gallery-${i}.jpg`,
        fileType: 'image',
        fileSize: 500000,
        originalName: `photo-${i}.jpg`,
        purpose: MediaPurpose.GALLERY,
        sortOrder: i,
      },
    });
  }

  await prisma.giftAccount.create({
    data: {
      invitationId: khitananInv.id,
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'Mulyadi Yusuf',
      sortOrder: 0,
    },
  });

  await prisma.coInvitor.createMany({
    data: [
      { invitationId: khitananInv.id, name: 'Bapak Suhaeli', title: 'Ketua RW 003', sortOrder: 0 },
      { invitationId: khitananInv.id, name: 'Bapak Ahmad Ridwan', title: 'Ketua RT 003', sortOrder: 1 },
    ],
  });

  await prisma.invitationTemplate.create({
    data: {
      invitationId: khitananInv.id,
      templateId: templates[0].id, // Super Classic
      isPrimary: true,
    },
  });

  // --- Demo Invitation 2: Wedding ---
  const weddingInv = await prisma.invitation.create({
    data: {
      userId: demoUser.id,
      slug: 'pernikahan-andi-sari',
      title: 'Pernikahan Andi & Sari',
      eventType: EventType.WEDDING,
      openingText:
        'Assalamualaikum Warahmatullahi Wabarakatuh\n\nDengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami.',
      closingText:
        'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restunya kami ucapkan terima kasih.\n\nWassalamualaikum Warahmatullahi Wabarakatuh',
      isPublished: true,
      viewCount: 256,
    },
  });

  await prisma.invitationEvent.createMany({
    data: [
      {
        invitationId: weddingInv.id,
        eventName: 'Akad Nikah',
        eventDate: '2025-08-20',
        startTime: '08:00',
        endTime: '10:00',
        venueName: 'Masjid Al-Ikhlas',
        venueAddress: 'Jl. Masjid Raya No. 1, Jakarta Selatan',
        mapUrl: 'https://maps.google.com/?q=-6.2615,106.8106',
        latitude: -6.2615,
        longitude: 106.8106,
        sortOrder: 0,
      },
      {
        invitationId: weddingInv.id,
        eventName: 'Resepsi',
        eventDate: '2025-08-20',
        startTime: '11:00',
        endTime: '15:00',
        venueName: 'Grand Ballroom Hotel Mulia',
        venueAddress: 'Jl. Asia Afrika, Senayan, Jakarta Selatan',
        mapUrl: 'https://maps.google.com/?q=-6.2253,106.8025',
        latitude: -6.2253,
        longitude: 106.8025,
        sortOrder: 1,
      },
    ],
  });

  await prisma.personProfile.createMany({
    data: [
      {
        invitationId: weddingInv.id,
        fullName: 'Andi Pratama',
        nickname: 'Andi',
        photoUrl: '/images/placeholder-groom.jpg',
        parentFather: 'Bapak Heru Pratama',
        parentMother: 'Ibu Siti Aminah',
        childOrder: 'Putra Pertama',
        role: 'groom',
        instagram: '@andipratama',
        sortOrder: 0,
      },
      {
        invitationId: weddingInv.id,
        fullName: 'Sari Dewi Lestari',
        nickname: 'Sari',
        photoUrl: '/images/placeholder-bride.jpg',
        parentFather: 'Bapak Budi Lestari',
        parentMother: 'Ibu Ratna Dewi',
        childOrder: 'Putri Kedua',
        role: 'bride',
        instagram: '@saridewi',
        sortOrder: 1,
      },
    ],
  });

  // Gallery for wedding
  for (let i = 1; i <= 3; i++) {
    await prisma.media.create({
      data: {
        invitationId: weddingInv.id,
        userId: demoUser.id,
        fileUrl: `/images/placeholder-wedding-${i}.jpg`,
        fileType: 'image',
        fileSize: 800000,
        originalName: `wedding-photo-${i}.jpg`,
        purpose: MediaPurpose.GALLERY,
        sortOrder: i,
      },
    });
  }

  await prisma.giftAccount.createMany({
    data: [
      {
        invitationId: weddingInv.id,
        bankName: 'BCA',
        accountNumber: '9876543210',
        accountHolder: 'Andi Pratama',
        sortOrder: 0,
      },
      {
        invitationId: weddingInv.id,
        bankName: 'Bank Mandiri',
        accountNumber: '1112233445',
        accountHolder: 'Sari Dewi Lestari',
        sortOrder: 1,
      },
    ],
  });

  await prisma.coInvitor.createMany({
    data: [
      { invitationId: weddingInv.id, name: 'Bapak H. Sulaiman', title: 'Tokoh Masyarakat', sortOrder: 0 },
      { invitationId: weddingInv.id, name: 'Ibu Hj. Fatimah', title: 'Ketua PKK', sortOrder: 1 },
    ],
  });

  await prisma.invitationTemplate.create({
    data: {
      invitationId: weddingInv.id,
      templateId: templates[2].id, // Floral Garden
      isPrimary: true,
    },
  });

  console.log('💌 2 demo invitations created');

  // --- Guests ---
  const khitananGuests = [
    { name: 'Bapak Budi', phone: '081200000010', groupName: 'Keluarga' },
    { name: 'Ibu Susi', phone: '081200000011', groupName: 'Keluarga' },
    { name: 'Bapak Agus', phone: '081200000012', groupName: 'Tetangga' },
    { name: 'Bapak Dedi', phone: '081200000013', groupName: 'Teman Kantor' },
    { name: 'Ibu Rina', phone: '081200000014', groupName: 'Teman Kantor' },
  ];

  const weddingGuests = [
    { name: 'Bapak & Ibu Wijaya', phone: '081200000020', groupName: 'Keluarga Mempelai Pria' },
    { name: 'Keluarga Besar Lestari', phone: '081200000021', groupName: 'Keluarga Mempelai Wanita' },
    { name: 'Bapak Rudi', phone: '081200000022', groupName: 'Teman Kuliah' },
    { name: 'Ibu Mega', phone: '081200000023', groupName: 'Teman Kantor' },
    { name: 'Bapak Hendra', phone: '081200000024', groupName: 'Tetangga' },
  ];

  for (const g of khitananGuests) {
    await prisma.guest.create({
      data: { invitationId: khitananInv.id, ...g },
    });
  }

  for (const g of weddingGuests) {
    await prisma.guest.create({
      data: { invitationId: weddingInv.id, ...g },
    });
  }

  console.log('👥 10 guests created');

  // --- RSVPs ---
  const rsvpData = [
    { invitationId: khitananInv.id, guestName: 'Bapak Budi', message: 'Semoga acaranya lancar, insya Allah hadir!', attendance: Attendance.ATTENDING, numGuests: 2 },
    { invitationId: khitananInv.id, guestName: 'Ibu Susi', message: 'Turut berbahagia! Semoga sehat selalu.', attendance: Attendance.ATTENDING, numGuests: 3 },
    { invitationId: khitananInv.id, guestName: 'Bapak Agus', message: 'Maaf belum bisa konfirmasi', attendance: Attendance.MAYBE, numGuests: 1 },
    { invitationId: khitananInv.id, guestName: 'Bapak Dedi', message: 'Mohon maaf tidak bisa hadir, ada tugas keluar kota.', attendance: Attendance.NOT_ATTENDING, numGuests: 1 },
    { invitationId: weddingInv.id, guestName: 'Bapak & Ibu Wijaya', message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah mawaddah warahmah.', attendance: Attendance.ATTENDING, numGuests: 4 },
    { invitationId: weddingInv.id, guestName: 'Keluarga Besar Lestari', message: 'Barakallahu lakuma, semoga bahagia dunia akhirat!', attendance: Attendance.ATTENDING, numGuests: 5 },
    { invitationId: weddingInv.id, guestName: 'Bapak Rudi', message: 'Congrats bro! Akhirnya nyusul juga 😄', attendance: Attendance.ATTENDING, numGuests: 2 },
    { invitationId: weddingInv.id, guestName: 'Ibu Mega', message: 'Happy wedding! Semoga langgeng ya.', attendance: Attendance.MAYBE, numGuests: 1 },
  ];

  for (const r of rsvpData) {
    await prisma.rsvp.create({ data: r });
  }

  console.log('📨 8 RSVPs created');

  // --- Testimonials ---
  const testimonials = [
    { userName: 'Ahmad Fajar', message: 'Platform undangan digital terbaik! Mudah digunakan dan tampilannya sangat elegan. Tamu undangan saya banyak yang memuji.', rating: 5, isApproved: true },
    { userName: 'Dewi Anggraini', message: 'Sangat membantu untuk acara pernikahan kami. Template-nya bagus-bagus dan banyak pilihan. Terima kasih Invitee!', rating: 5, isApproved: true },
    { userName: 'Rizki Hidayat', message: 'Good app, cuma kadang loading-nya agak lama kalau banyak foto.', rating: 4, isApproved: false },
    { userName: 'Siti Nurhaliza', message: 'Undangan digitalnya keren banget! Fitur RSVP-nya sangat berguna untuk menghitung jumlah tamu.', rating: 5, isApproved: false },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log('⭐ 4 testimonials created');
  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
