'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInvitationStore } from '@/stores/invitation-store';
import { useUIStore } from '@/stores/ui-store';
import { useCreateInvitation } from '@/hooks/queries/use-invitations';
import { useTemplates } from '@/hooks/queries/use-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { STEPPER_LABELS } from '@/lib/constants';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
import { slugify } from '@invitee/shared';
import { cn } from '@/lib/utils';
import { getEventTypeConfig } from '@/lib/event-type-config';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Star,
  Upload,
  Eye,
} from 'lucide-react';

/* ── Invitation preview components ── */
import CoverScreen from '@/components/invitation/cover-screen';
import HeroSection from '@/components/invitation/hero-section';
import CountdownTimer from '@/components/invitation/countdown-timer';
import PersonProfileSection from '@/components/invitation/person-profile';
import EventDetailsSection from '@/components/invitation/event-details';
import GallerySection from '@/components/invitation/gallery';
import DigitalGiftSection from '@/components/invitation/digital-gift';
import ClosingSection from '@/components/invitation/closing-section';

/* ── Theme config for preview (same as preview page) ── */
const THEME_CONFIG: Record<string, {
  frameBg: string;
  coverBg: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  ornamentTop: string;
  ornamentBottom: string;
}> = {
  'super-classic': {
    frameBg: '#1e1a12', coverBg: 'linear-gradient(135deg, #2c2418 0%, #3d3122 40%, #2c2418 100%)',
    accent: '#c9a84c', textPrimary: '#c9a84c', textSecondary: 'rgba(201,168,76,0.7)', borderColor: '#c9a84c',
    ornamentTop: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#c9a84c"/></svg>`,
    ornamentBottom: `<svg width="32" height="32" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#c9a84c" opacity="0.5"/></svg>`,
  },
  'simple-java': {
    frameBg: '#2e2416', coverBg: 'linear-gradient(135deg, #3b2f20, #5a4730, #3b2f20)',
    accent: '#8b6914', textPrimary: '#d4b254', textSecondary: 'rgba(212,178,84,0.65)', borderColor: '#8b6914',
    ornamentTop: `<svg width="60" height="24" viewBox="0 0 60 20"><path d="M10,2 L20,10 L10,18 L0,10Z" fill="#8b6914" opacity="0.7"/><path d="M30,4 L38,10 L30,16 L22,10Z" fill="none" stroke="#8b6914" stroke-width="1.2"/><path d="M50,2 L60,10 L50,18 L40,10Z" fill="#8b6914" opacity="0.7"/></svg>`,
    ornamentBottom: `<svg width="40" height="24" viewBox="0 0 40 20"><path d="M10,2 L20,10 L10,18 L0,10Z" fill="#8b6914" opacity="0.4"/><path d="M30,2 L40,10 L30,18 L20,10Z" fill="#8b6914" opacity="0.4"/></svg>`,
  },
  'golden-elegance': {
    frameBg: '#080806', coverBg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1508 50%, #0d0d0d 100%)',
    accent: '#d4a843', textPrimary: '#d4a843', textSecondary: 'rgba(212,168,67,0.7)', borderColor: '#d4a843',
    ornamentTop: `<svg width="44" height="44" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#d4a843"/></svg>`,
    ornamentBottom: `<svg width="36" height="36" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#d4a843" opacity="0.6"/></svg>`,
  },
  'royal-muslim': {
    frameBg: '#142218', coverBg: 'linear-gradient(160deg, #1d3225, #264d35, #1d3225)',
    accent: '#2d6a4f', textPrimary: '#c9a84c', textSecondary: 'rgba(201,168,76,0.65)', borderColor: '#2d6a4f',
    ornamentTop: `<svg width="48" height="48" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="none" stroke="#2d6a4f" stroke-width="1.5" opacity="0.6"/></svg>`,
    ornamentBottom: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="none" stroke="#2d6a4f" stroke-width="1" opacity="0.35"/></svg>`,
  },
  'kids-party': {
    frameBg: '#3d2d6b', coverBg: 'linear-gradient(135deg, #6c5ce7, #fd79a8 40%, #fdcb6e 80%)',
    accent: '#ff6b35', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.8)', borderColor: '#ff6b35',
    ornamentTop: `<svg width="36" height="44" viewBox="0 0 28 28"><path d="M14,2 L19,20 L9,20Z" fill="#ff6b35" opacity="0.8"/></svg>`,
    ornamentBottom: `<svg width="60" height="16" viewBox="0 0 60 12"><circle cx="10" cy="6" r="4" fill="#ff6b6b" opacity="0.6"/><circle cx="30" cy="6" r="5" fill="#feca57" opacity="0.7"/><circle cx="50" cy="6" r="4" fill="#48dbfb" opacity="0.6"/></svg>`,
  },
  'wayang-heritage': {
    frameBg: '#1e1610', coverBg: 'linear-gradient(145deg, #2a1f14, #3d2d1a 50%, #2a1f14)',
    accent: '#8b4513', textPrimary: '#d4a86a', textSecondary: 'rgba(212,168,106,0.65)', borderColor: '#8b4513',
    ornamentTop: `<svg width="60" height="24" viewBox="0 0 60 20"><path d="M10,2 L18,10 L10,18 L2,10Z" fill="none" stroke="#8b4513" stroke-width="1.5" opacity="0.5"/></svg>`,
    ornamentBottom: `<svg width="40" height="16" viewBox="0 0 40 16"><path d="M20,2 L28,8 L20,14 L12,8Z" fill="none" stroke="#8b4513" stroke-width="1.2" opacity="0.4"/></svg>`,
  },
  'modern-minimal': {
    frameBg: '#111111', coverBg: '#1a1a1a',
    accent: '#1a1a1a', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)',
    ornamentTop: `<svg width="60" height="4" viewBox="0 0 60 2"><line x1="0" y1="1" x2="60" y2="1" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/></svg>`,
    ornamentBottom: `<svg width="60" height="4" viewBox="0 0 60 2"><line x1="0" y1="1" x2="60" y2="1" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/></svg>`,
  },
  'floral-garden': {
    frameBg: '#3a1a28', coverBg: 'linear-gradient(160deg, #4a2332, #6b3a4e 40%, #4a2332)',
    accent: '#d4688e', textPrimary: '#f9e8ed', textSecondary: 'rgba(249,232,237,0.7)', borderColor: '#d4688e',
    ornamentTop: `<svg width="40" height="40" viewBox="0 0 24 24"><circle cx="12" cy="4" r="3.5" fill="#d4688e" opacity="0.8"/></svg>`,
    ornamentBottom: `<svg width="36" height="36" viewBox="0 0 32 32"><circle cx="16" cy="16" r="4" fill="#d4688e" opacity="0.12"/></svg>`,
  },
  'christmas-joy': {
    frameBg: '#121e16', coverBg: 'linear-gradient(160deg, #1a3c2a, #2d1b1b 60%, #1a3c2a)',
    accent: '#c0392b', textPrimary: '#f0e6d0', textSecondary: 'rgba(240,230,208,0.65)', borderColor: '#c0392b',
    ornamentTop: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="#c0392b" opacity="0.5"/></svg>`,
    ornamentBottom: `<svg width="32" height="32" viewBox="0 0 24 24"><path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8Z" fill="#27ae60" opacity="0.35"/></svg>`,
  },
  'slide-romantic': {
    frameBg: '#2e1620', coverBg: 'linear-gradient(135deg, #3d1e28, #5c2f3e 40%, #3d1e28)',
    accent: '#e8758a', textPrimary: '#fef6f4', textSecondary: 'rgba(254,246,244,0.7)', borderColor: '#e8758a',
    ornamentTop: `<svg width="40" height="36" viewBox="0 0 24 22"><path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="#e8758a" opacity="0.25"/></svg>`,
    ornamentBottom: `<svg width="32" height="28" viewBox="0 0 24 22"><path d="M12 20l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54L12 20z" fill="#e8758a" opacity="0.15"/></svg>`,
  },
};

export default function NewInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const createInvitation = useCreateInvitation();

  const {
    draft,
    currentStep,
    setField,
    setDraft,
    nextStep,
    prevStep,
    goToStep,
    reset,
  } = useInvitationStore();

  // Template filtering by eventType with toggle
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const { data: templatesData } = useTemplates(
    showAllTemplates ? { limit: 50 } : { limit: 50, eventType: draft.eventType }
  );
  const templates = templatesData?.data || [];

  // Cancel confirmation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Track collapsible "Info Tambahan" state per profile
  const [expandedProfiles, setExpandedProfiles] = useState<Record<number, boolean>>({});

  // Get event type config
  const eventConfig = getEventTypeConfig(draft.eventType);

  useEffect(() => {
    reset();
    const templateId = searchParams.get('templateId');
    if (templateId) {
      setField('templateId', templateId);
    }
  }, []);

  // Track the previous event type so we can detect auto-filled (untouched) defaults
  const prevEventTypeRef = useRef<string>('');

  // Auto-fill defaults when eventType changes
  const handleEventTypeChange = (newType: string) => {
    const prevConfig = getEventTypeConfig(prevEventTypeRef.current);
    setField('eventType', newType);

    // If user selects the empty placeholder, clear all auto-filled fields
    if (!newType) {
      const currentOpening = draft.openingText.trim();
      if (!currentOpening || currentOpening === prevConfig.defaultOpeningText.trim()) {
        setField('openingText', '');
      }
      const currentClosing = draft.closingText.trim();
      if (!currentClosing || currentClosing === prevConfig.defaultClosingText.trim()) {
        setField('closingText', '');
      }
      const currentEventNames = draft.events.map(e => e.eventName.trim()).filter(Boolean);
      const prevDefaultNames = prevConfig.defaultEventNames;
      const eventsAreDefault = currentEventNames.length === 0 ||
        (currentEventNames.length === prevDefaultNames.length &&
         currentEventNames.every((name, i) => name === prevDefaultNames[i]));
      if (eventsAreDefault) {
        setDraft({ events: [{ eventName: '', eventDate: '', startTime: '', endTime: '', venueName: '', venueAddress: '', mapUrl: '' }] });
      }
      const hasCustomProfiles = draft.personProfiles.some(p => p.fullName.trim());
      if (!hasCustomProfiles) {
        setDraft({ personProfiles: [{ fullName: '', nickname: '', photoUrl: '', parentFather: '', parentMother: '', childOrder: '', role: 'primary', instagram: '', dateOfBirth: '', bio: '', gender: '', address: '', phone: '', age: '', jobTitle: '', organization: '' }] });
      }
      prevEventTypeRef.current = '';
      setShowAllTemplates(false);
      return;
    }

    const newConfig = getEventTypeConfig(newType);

    // Auto-fill opening text if empty OR still matches the previous type's default
    const currentOpening = draft.openingText.trim();
    if (!currentOpening || currentOpening === prevConfig.defaultOpeningText.trim()) {
      setField('openingText', newConfig.defaultOpeningText);
    }

    // Auto-fill closing text if empty OR still matches the previous type's default
    const currentClosing = draft.closingText.trim();
    if (!currentClosing || currentClosing === prevConfig.defaultClosingText.trim()) {
      setField('closingText', newConfig.defaultClosingText);
    }

    // Auto-fill events if empty OR all event names still match previous defaults
    const currentEventNames = draft.events.map(e => e.eventName.trim()).filter(Boolean);
    const prevDefaultNames = prevConfig.defaultEventNames;
    const eventsAreDefault = currentEventNames.length === 0 ||
      (currentEventNames.length === prevDefaultNames.length &&
       currentEventNames.every((name, i) => name === prevDefaultNames[i]));
    if (eventsAreDefault) {
      const defaultEvents = newConfig.defaultEventNames.map(name => ({
        eventName: name,
        eventDate: '',
        startTime: '',
        endTime: '',
        venueName: '',
        venueAddress: '',
        mapUrl: '',
      }));
      setDraft({ events: defaultEvents });
    }

    // Auto-adjust profiles if empty/no names filled
    const hasCustomProfiles = draft.personProfiles.some(p => p.fullName.trim());
    if (!hasCustomProfiles) {
      const defaultProfiles = Array.from({ length: newConfig.defaultProfileCount }, (_, i) => ({
        fullName: '',
        nickname: '',
        photoUrl: '',
        parentFather: '',
        parentMother: '',
        childOrder: '',
        role: newConfig.profileRoles[i]?.value || 'primary',
        instagram: '',
        dateOfBirth: '',
        bio: '',
        gender: '',
        address: '',
        phone: '',
        age: '',
        jobTitle: '',
        organization: '',
      }));
      setDraft({ personProfiles: defaultProfiles });
    }

    // Update ref & reset template filter
    prevEventTypeRef.current = newType;
    setShowAllTemplates(false);
  };

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      if (!draft.title.trim() || !draft.slug.trim() || !draft.eventType) return false;
    }
    if (step === 1) {
      const validEvents = draft.events.filter((e) => e.eventName && e.eventDate);
      if (validEvents.length === 0) return false;
    }
    if (step === 2) {
      const validProfiles = draft.personProfiles.filter((p) => p.fullName);
      if (validProfiles.length === 0) return false;
    }
    return true;
  };

  const handleStepperClick = (targetStep: number) => {
    // Allow going backward freely
    if (targetStep <= currentStep) {
      goToStep(targetStep);
      return;
    }
    // For forward navigation, validate all steps up to (but not including) the target
    for (let s = currentStep; s < targetStep; s++) {
      if (!validateStep(s)) {
        const stepNames = ['Informasi Dasar', 'Detail Acara', 'Profil'];
        if (s <= 2) {
          addToast(`Lengkapi form "${stepNames[s]}" terlebih dahulu`, 'error');
        }
        goToStep(s);
        return;
      }
    }
    goToStep(targetStep);
  };

  const handleNextStep = () => {
    // Per-step validation
    if (currentStep === 0) {
      if (!draft.title.trim()) {
        addToast('Judul undangan wajib diisi', 'error');
        return;
      }
      if (!draft.slug.trim()) {
        addToast('Slug URL wajib diisi', 'error');
        return;
      }
      if (!draft.eventType) {
        addToast('Tipe acara wajib dipilih', 'error');
        return;
      }
    }

    if (currentStep === 1) {
      const validEvents = draft.events.filter((e) => e.eventName && e.eventDate);
      if (validEvents.length === 0) {
        addToast('Minimal satu acara dengan nama dan tanggal wajib diisi', 'error');
        return;
      }
    }

    if (currentStep === 2) {
      const validProfiles = draft.personProfiles.filter((p) => p.fullName);
      if (validProfiles.length === 0) {
        addToast('Minimal satu profil dengan nama lengkap wajib diisi', 'error');
        return;
      }
    }

    nextStep();
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        title: draft.title,
        slug: draft.slug,
        eventType: draft.eventType,
        openingText: draft.openingText || undefined,
        closingText: draft.closingText || undefined,
        musicUrl: draft.musicUrl || undefined,
        events: draft.events.filter((e) => e.eventName && e.eventDate),
        personProfiles: draft.personProfiles.filter((p) => p.fullName),
        giftAccounts: draft.giftAccounts.filter((g) => g.bankName && g.accountNumber),
        coInvitors: draft.coInvitors.filter((c) => c.name),
        templateId: draft.templateId || undefined,
      };
      await createInvitation.mutateAsync(payload);
      addToast('Undangan berhasil dibuat!', 'success');
      reset();
      router.push('/dashboard');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal membuat undangan', 'error');
    }
  };

  const eventTypeOptions = [
    { value: '', label: '-- Pilih Tipe Acara --' },
    ...Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buat Undangan Baru</h1>
        <p className="text-gray-500 mt-1">Isi form di bawah untuk membuat undangan digital</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPPER_LABELS.map((label, index) => (
          <button
            key={label}
            onClick={() => handleStepperClick(index)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              index === currentStep
                ? 'bg-primary-600 text-white'
                : index < currentStep
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-gray-100 text-gray-500',
            )}
          >
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs',
                index === currentStep
                  ? 'bg-white text-primary-600'
                  : index < currentStep
                    ? 'bg-primary-200 text-primary-800'
                    : 'bg-gray-200 text-gray-500',
              )}
            >
              {index < currentStep ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {/* Step 0: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Informasi Dasar</CardTitle>
              </CardHeader>
              <Select
                label="Tipe Acara"
                options={eventTypeOptions}
                value={draft.eventType}
                onChange={(e) => handleEventTypeChange(e.target.value)}
              />
              <Input
                label="Judul Undangan"
                placeholder={eventConfig.titlePlaceholder}
                value={draft.title}
                onChange={(e) => {
                  setField('title', e.target.value);
                  setField('slug', slugify(e.target.value));
                }}
              />
              <Input
                label="Slug URL"
                placeholder="pernikahan-andi-sari"
                value={draft.slug}
                onChange={(e) => setField('slug', e.target.value)}
              />
              <Textarea
                label="Teks Pembuka"
                placeholder="Assalamualaikum Warahmatullahi Wabarakatuh..."
                value={draft.openingText}
                onChange={(e) => setField('openingText', e.target.value)}
                rows={4}
              />
              <Textarea
                label="Teks Penutup"
                placeholder="Merupakan suatu kehormatan dan kebahagiaan..."
                value={draft.closingText}
                onChange={(e) => setField('closingText', e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Step 1: Event Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Detail Acara</CardTitle>
              </CardHeader>
              {draft.events.map((event, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  {draft.events.length > 1 && (
                    <button
                      onClick={() => {
                        const newEvents = draft.events.filter((_, i) => i !== index);
                        setDraft({ events: newEvents });
                      }}
                      className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <Input
                    label="Nama Acara"
                    placeholder="Akad Nikah / Resepsi / Khitanan"
                    value={event.eventName}
                    onChange={(e) => setField(`events.${index}.eventName`, e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Tanggal"
                      type="date"
                      value={event.eventDate}
                      onChange={(e) => setField(`events.${index}.eventDate`, e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Mulai"
                        type="time"
                        value={event.startTime}
                        onChange={(e) => setField(`events.${index}.startTime`, e.target.value)}
                      />
                      <Input
                        label="Selesai"
                        type="time"
                        value={event.endTime}
                        onChange={(e) => setField(`events.${index}.endTime`, e.target.value)}
                      />
                    </div>
                  </div>
                  <Input
                    label="Nama Tempat"
                    placeholder="Grand Ballroom Hotel"
                    value={event.venueName}
                    onChange={(e) => setField(`events.${index}.venueName`, e.target.value)}
                  />
                  <Textarea
                    label="Alamat"
                    placeholder="Jl. Contoh No. 123"
                    value={event.venueAddress}
                    onChange={(e) => setField(`events.${index}.venueAddress`, e.target.value)}
                    rows={2}
                  />
                  <Input
                    label="Google Maps URL"
                    placeholder="https://maps.google.com/..."
                    value={event.mapUrl}
                    onChange={(e) => setField(`events.${index}.mapUrl`, e.target.value)}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setDraft({
                    events: [
                      ...draft.events,
                      { eventName: '', eventDate: '', startTime: '', endTime: '', venueName: '', venueAddress: '', mapUrl: '' },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Acara
              </Button>
            </div>
          )}

          {/* Step 2: Person Profiles — category-driven fields */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Profil</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Field disesuaikan dengan tipe acara: <span className="font-medium text-primary-600">{EVENT_TYPE_LABELS[draft.eventType]}</span>
                </p>
              </CardHeader>
              {draft.personProfiles.map((person, index) => {
                const roleLabel = eventConfig.profileRoles[index]?.label || eventConfig.profileRoles[0]?.label || 'Profil';
                const isExpanded = expandedProfiles[index] ?? false;
                const mainFields = eventConfig.profileFields.main;
                const collapsibleFields = eventConfig.profileFields.collapsible;
                const labels = eventConfig.profileLabels;

                return (
                  <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                    {/* Role badge */}
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-medium">
                      {roleLabel}
                    </span>

                    {draft.personProfiles.length > 1 && (
                      <button
                        onClick={() => {
                          const newProfiles = draft.personProfiles.filter((_, i) => i !== index);
                          setDraft({ personProfiles: newProfiles });
                        }}
                        className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {/* Main fields — rendered in grid based on config */}
                    <div className="grid grid-cols-2 gap-4">
                      {mainFields.includes('fullName') && (
                        <Input
                          label={labels.fullName || 'Nama Lengkap'}
                          value={person.fullName}
                          onChange={(e) => setField(`personProfiles.${index}.fullName`, e.target.value)}
                        />
                      )}
                      {mainFields.includes('nickname') && (
                        <Input
                          label={labels.nickname || 'Nama Panggilan'}
                          value={person.nickname}
                          onChange={(e) => setField(`personProfiles.${index}.nickname`, e.target.value)}
                        />
                      )}
                    </div>
                    {(mainFields.includes('parentFather') || mainFields.includes('parentMother')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('parentFather') && (
                          <Input
                            label={labels.parentFather || 'Nama Ayah'}
                            value={person.parentFather}
                            onChange={(e) => setField(`personProfiles.${index}.parentFather`, e.target.value)}
                          />
                        )}
                        {mainFields.includes('parentMother') && (
                          <Input
                            label={labels.parentMother || 'Nama Ibu'}
                            value={person.parentMother}
                            onChange={(e) => setField(`personProfiles.${index}.parentMother`, e.target.value)}
                          />
                        )}
                      </div>
                    )}
                    {(mainFields.includes('childOrder') || mainFields.includes('instagram')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('childOrder') && (
                          <Input
                            label={labels.childOrder || 'Anak Ke-'}
                            value={person.childOrder}
                            onChange={(e) => setField(`personProfiles.${index}.childOrder`, e.target.value)}
                          />
                        )}
                        {mainFields.includes('instagram') && (
                          <Input
                            label={labels.instagram || 'Instagram (@username)'}
                            placeholder="@username"
                            value={person.instagram}
                            onChange={(e) => setField(`personProfiles.${index}.instagram`, e.target.value)}
                          />
                        )}
                      </div>
                    )}
                    {(mainFields.includes('dateOfBirth') || mainFields.includes('age')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('dateOfBirth') && (
                          <Input
                            label={labels.dateOfBirth || 'Tanggal Lahir'}
                            type="date"
                            value={person.dateOfBirth}
                            onChange={(e) => setField(`personProfiles.${index}.dateOfBirth`, e.target.value)}
                          />
                        )}
                        {mainFields.includes('age') && (
                          <Input
                            label={labels.age || 'Usia'}
                            placeholder="10 tahun"
                            value={person.age}
                            onChange={(e) => setField(`personProfiles.${index}.age`, e.target.value)}
                          />
                        )}
                      </div>
                    )}
                    {(mainFields.includes('jobTitle') || mainFields.includes('organization')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('jobTitle') && (
                          <Input
                            label={labels.jobTitle || 'Jabatan / Gelar'}
                            value={person.jobTitle}
                            onChange={(e) => setField(`personProfiles.${index}.jobTitle`, e.target.value)}
                          />
                        )}
                        {mainFields.includes('organization') && (
                          <Input
                            label={labels.organization || 'Organisasi / Institusi'}
                            value={person.organization}
                            onChange={(e) => setField(`personProfiles.${index}.organization`, e.target.value)}
                          />
                        )}
                      </div>
                    )}

                    {/* Collapsible "Info Tambahan" section */}
                    {collapsibleFields.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <button
                          type="button"
                          onClick={() => setExpandedProfiles(prev => ({ ...prev, [index]: !prev[index] }))}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors w-full"
                        >
                          <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                          <span>Info Tambahan</span>
                          <span className="text-xs text-gray-400">(opsional)</span>
                        </button>
                        {isExpanded && (
                          <div className="mt-3 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              {collapsibleFields.includes('dateOfBirth') && (
                                <Input
                                  label={labels.dateOfBirth || 'Tanggal Lahir'}
                                  type="date"
                                  value={person.dateOfBirth}
                                  onChange={(e) => setField(`personProfiles.${index}.dateOfBirth`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('age') && (
                                <Input
                                  label={labels.age || 'Usia'}
                                  placeholder="10 tahun"
                                  value={person.age}
                                  onChange={(e) => setField(`personProfiles.${index}.age`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('gender') && (
                                <Select
                                  label={labels.gender || 'Jenis Kelamin'}
                                  options={[
                                    { value: '', label: 'Pilih...' },
                                    { value: 'Laki-laki', label: 'Laki-laki' },
                                    { value: 'Perempuan', label: 'Perempuan' },
                                  ]}
                                  value={person.gender}
                                  onChange={(e) => setField(`personProfiles.${index}.gender`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('instagram') && (
                                <Input
                                  label={labels.instagram || 'Instagram (@username)'}
                                  placeholder="@username"
                                  value={person.instagram}
                                  onChange={(e) => setField(`personProfiles.${index}.instagram`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('jobTitle') && (
                                <Input
                                  label={labels.jobTitle || 'Jabatan / Gelar'}
                                  value={person.jobTitle}
                                  onChange={(e) => setField(`personProfiles.${index}.jobTitle`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('organization') && (
                                <Input
                                  label={labels.organization || 'Organisasi / Institusi'}
                                  value={person.organization}
                                  onChange={(e) => setField(`personProfiles.${index}.organization`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('parentFather') && (
                                <Input
                                  label={labels.parentFather || 'Nama Ayah'}
                                  value={person.parentFather}
                                  onChange={(e) => setField(`personProfiles.${index}.parentFather`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('parentMother') && (
                                <Input
                                  label={labels.parentMother || 'Nama Ibu'}
                                  value={person.parentMother}
                                  onChange={(e) => setField(`personProfiles.${index}.parentMother`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('childOrder') && (
                                <Input
                                  label={labels.childOrder || 'Anak Ke-'}
                                  value={person.childOrder}
                                  onChange={(e) => setField(`personProfiles.${index}.childOrder`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('address') && (
                                <Input
                                  label={labels.address || 'Alamat'}
                                  value={person.address}
                                  onChange={(e) => setField(`personProfiles.${index}.address`, e.target.value)}
                                />
                              )}
                              {collapsibleFields.includes('phone') && (
                                <Input
                                  label={labels.phone || 'No. HP'}
                                  value={person.phone}
                                  onChange={(e) => setField(`personProfiles.${index}.phone`, e.target.value)}
                                />
                              )}
                            </div>
                            {collapsibleFields.includes('bio') && (
                              <Textarea
                                label={labels.bio || 'Bio / Deskripsi'}
                                value={person.bio}
                                onChange={(e) => setField(`personProfiles.${index}.bio`, e.target.value)}
                                rows={2}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <Button
                variant="outline"
                onClick={() =>
                  setDraft({
                    personProfiles: [
                      ...draft.personProfiles,
                      { fullName: '', nickname: '', photoUrl: '', parentFather: '', parentMother: '', childOrder: '', role: eventConfig.profileRoles[draft.personProfiles.length]?.value || 'secondary', instagram: '', dateOfBirth: '', bio: '', gender: '', address: '', phone: '', age: '', jobTitle: '', organization: '' },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Profil
              </Button>
            </div>
          )}

          {/* Step 3: Gallery */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Galeri Foto</CardTitle>
              </CardHeader>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="mt-4 text-sm text-gray-500">
                  Upload foto akan tersedia setelah undangan dibuat.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Anda bisa menambahkan foto di halaman edit undangan.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Gift Accounts */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Amplop Digital</CardTitle>
              </CardHeader>
              {draft.giftAccounts.map((gift, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  <button
                    onClick={() => {
                      const newGifts = draft.giftAccounts.filter((_, i) => i !== index);
                      setDraft({ giftAccounts: newGifts });
                    }}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Input
                    label="Nama Bank"
                    placeholder="BCA / Mandiri / BNI"
                    value={gift.bankName}
                    onChange={(e) => setField(`giftAccounts.${index}.bankName`, e.target.value)}
                  />
                  <Input
                    label="Nomor Rekening"
                    placeholder="1234567890"
                    value={gift.accountNumber}
                    onChange={(e) => setField(`giftAccounts.${index}.accountNumber`, e.target.value)}
                  />
                  <Input
                    label="Atas Nama"
                    value={gift.accountHolder}
                    onChange={(e) => setField(`giftAccounts.${index}.accountHolder`, e.target.value)}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setDraft({
                    giftAccounts: [
                      ...draft.giftAccounts,
                      { bankName: '', accountNumber: '', accountHolder: '' },
                    ],
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Rekening
              </Button>
            </div>
          )}

          {/* Step 5: Template Selection — filtered by eventType */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Pilih Tema</CardTitle>
              </CardHeader>

              {/* Filter notice + toggle */}
              <div className="flex items-center justify-between bg-primary-50 px-4 py-3 rounded-lg">
                <p className="text-sm text-primary-700">
                  {showAllTemplates
                    ? 'Menampilkan semua template'
                    : `Menampilkan template untuk ${EVENT_TYPE_LABELS[draft.eventType] || draft.eventType}`}
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllTemplates(!showAllTemplates)}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 underline"
                >
                  {showAllTemplates ? 'Filter berdasarkan tipe acara' : 'Tampilkan Semua'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((template: any) => {
                  const isRecommended = eventConfig.recommendedTemplates.includes(template.slug);
                  return (
                    <button
                      key={template.id}
                      onClick={() => setField('templateId', template.id)}
                      className={cn(
                        'p-4 border-2 rounded-lg text-left transition-all relative',
                        draft.templateId === template.id
                          ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300',
                      )}
                    >
                      {isRecommended && (
                        <span className="absolute -top-2.5 -right-2 text-[11px] bg-yellow-100 text-yellow-800 border border-yellow-400 px-2 py-0.5 rounded-full font-semibold shadow">
                          ⭐ Direkomendasikan
                        </span>
                      )}
                      <div className="h-32 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
                        {/* Fallback letter */}
                        <span className="text-2xl font-serif text-primary-300 absolute">
                          {template.name.charAt(0)}
                        </span>
                        <img
                          src={`/images/templates/${template.slug}.svg`}
                          alt={template.name}
                          className="w-full h-full object-cover relative z-[1]"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-500">{template.ratingAvg.toFixed(1)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 6: Preview (rendered outside the Card for full-width) */}
      {currentStep === 6 && (
        <InvitationPreviewStep draft={draft} templates={templates} />
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? () => setShowCancelConfirm(true) : prevStep}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Batal' : 'Sebelumnya'}
        </Button>

        {currentStep < 6 ? (
          <Button onClick={handleNextStep}>
            {currentStep === 5 ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Lihat Preview
              </>
            ) : (
              <>
                Selanjutnya
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={createInvitation.isPending}>
            <Check className="w-4 h-4 mr-2" />
            Buat Undangan
          </Button>
        )}
      </div>

      {/* Cancel Confirmation */}
      <ConfirmModal
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          reset();
          router.push('/dashboard/invitations');
        }}
        title="Batalkan Pembuatan Undangan?"
        description="Data yang sudah Anda isi belum disimpan dan akan hilang. Apakah Anda yakin ingin membatalkan?"
        confirmLabel="Ya, Batalkan"
        cancelLabel="Lanjut Mengisi"
        variant="warning"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PREVIEW STEP — Live invitation preview with placeholders
   ═══════════════════════════════════════════════════ */
function InvitationPreviewStep({ draft, templates }: { draft: any; templates: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  // Find the selected template
  const selectedTemplate = templates.find((t: any) => t.id === draft.templateId);
  const themeSlug = selectedTemplate?.slug || 'super-classic';
  const themeClass = `theme-${themeSlug}`;
  const themeConf = THEME_CONFIG[themeSlug] || THEME_CONFIG['super-classic'];

  // Build preview data with placeholders for empty fields
  const previewData = useMemo(() => {
    const config = getEventTypeConfig(draft.eventType);
    const title = draft.title?.trim() || config.titlePlaceholder;

    const openingText = draft.openingText?.trim() || config.defaultOpeningText;
    const closingText = draft.closingText?.trim() || config.defaultClosingText;

    // Person profiles with placeholders
    const validProfiles = draft.personProfiles?.filter((p: any) => p.fullName?.trim()) || [];
    const personProfiles = validProfiles.length > 0
      ? validProfiles.map((p: any) => ({
          fullName: p.fullName,
          nickname: p.nickname || p.fullName.split(' ')[0],
          photoUrl: p.photoUrl || '',
          parentFather: p.parentFather || (config.showParents ? 'Nama Ayah' : ''),
          parentMother: p.parentMother || (config.showParents ? 'Nama Ibu' : ''),
          childOrder: p.childOrder || '',
          role: p.role || 'primary',
          instagram: p.instagram || '',
          dateOfBirth: p.dateOfBirth || '',
          bio: p.bio || '',
          jobTitle: p.jobTitle || '',
          organization: p.organization || '',
          age: p.age || '',
        }))
      : Array.from({ length: config.defaultProfileCount }, (_, i) => ({
          fullName: config.profileRoles[i]?.label || 'Nama',
          nickname: '',
          photoUrl: '',
          parentFather: config.showParents ? 'Nama Ayah' : '',
          parentMother: config.showParents ? 'Nama Ibu' : '',
          childOrder: '',
          role: config.profileRoles[i]?.value || 'primary',
          instagram: '',
          dateOfBirth: '',
          bio: '',
          jobTitle: '',
          organization: '',
          age: '',
        }));

    // Events with placeholders
    const validEvents = draft.events?.filter((e: any) => e.eventName?.trim() && e.eventDate) || [];
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];

    const events = validEvents.length > 0
      ? validEvents.map((e: any) => ({
          eventName: e.eventName,
          eventDate: e.eventDate,
          startTime: e.startTime || '08:00',
          endTime: e.endTime || '10:00',
          venueName: e.venueName || 'Nama Tempat',
          venueAddress: e.venueAddress || 'Alamat Lengkap',
          mapUrl: e.mapUrl || '',
        }))
      : config.defaultEventNames.map(name => ({
          eventName: name,
          eventDate: dateStr,
          startTime: '08:00',
          endTime: '10:00',
          venueName: 'Nama Tempat',
          venueAddress: 'Alamat Lengkap',
          mapUrl: '',
        }));

    // First event date for countdown
    const eventDate = validEvents.length > 0 && validEvents[0].eventDate
      ? new Date(validEvents[0].eventDate)
      : futureDate;

    // Gallery - use sample images as placeholder
    const media = [
      '/images/gallery/sample-1.jpg',
      '/images/gallery/sample-2.jpg',
      '/images/gallery/sample-3.jpg',
      '/images/gallery/sample-4.jpg',
      '/images/gallery/sample-5.jpg',
      '/images/gallery/sample-6.jpg',
    ].map((url, i) => ({ id: `preview-${i}`, url, fileUrl: url, purpose: 'GALLERY' }));

    // Gift accounts with placeholders
    const validGifts = draft.giftAccounts?.filter((g: any) => g.bankName?.trim() && g.accountNumber?.trim()) || [];
    const giftAccounts = validGifts.length > 0
      ? validGifts
      : [{ bankName: 'Nama Bank', accountNumber: '1234567890', accountHolder: 'Nama Pemilik' }];

    // Co-invitors
    const validCoInvitors = draft.coInvitors?.filter((c: any) => c.name?.trim()) || [];
    const coInvitors = validCoInvitors.length > 0
      ? validCoInvitors.map((c: any) => ({ name: c.name, role: c.title || '' }))
      : [{ name: 'Keluarga Besar', role: 'Orang Tua Mempelai' }];

    return { title, openingText, closingText, personProfiles, events, eventDate, media, giftAccounts, coInvitors };
  }, [draft]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Eye className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Preview Undangan</h3>
                <p className="text-xs text-gray-500">Berikut tampilan undangan Anda. Data yang belum diisi menggunakan placeholder.</p>
              </div>
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Belum Disimpan</span>
          </div>
        </CardContent>
      </Card>

      {/* Phone Frame Preview */}
      <div className="flex justify-center">
        <div
          className="w-full max-w-[430px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 relative border border-gray-200"
          style={{ height: '700px', background: themeConf.frameBg }}
        >
          <style>{`
            .preview-frame .invitation-cover {
              position: absolute !important;
            }
            .preview-frame .invitation-content {
              height: 100% !important;
            }
            .preview-frame .invitation-section {
              min-height: 100% !important;
            }
          `}</style>
          <div className={`preview-frame invitation-root ${themeClass} h-full`} style={{ background: themeConf.frameBg }}>
            {!isOpen && (
              <CoverScreen
                title={previewData.title}
                guestName="Tamu Undangan"
                eventDate={previewData.eventDate}
                onOpen={() => setIsOpen(true)}
                themeConfig={themeConf}
                eventType={draft.eventType}
              />
            )}
            {isOpen && (
              <main className="invitation-content">
                <HeroSection
                  openingText={previewData.openingText}
                  title={previewData.title}
                  eventType={draft.eventType}
                />
                <PersonProfileSection profiles={previewData.personProfiles} eventType={draft.eventType} />
                <CountdownTimer targetDate={previewData.eventDate} />
                <EventDetailsSection events={previewData.events} />
                <GallerySection media={previewData.media} />
                <DigitalGiftSection accounts={previewData.giftAccounts} />
                <ClosingSection
                  closingText={previewData.closingText}
                  coInvitors={previewData.coInvitors}
                />
              </main>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
