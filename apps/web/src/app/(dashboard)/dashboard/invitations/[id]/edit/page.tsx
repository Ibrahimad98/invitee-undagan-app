'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useInvitation, useUpdateInvitation } from '@/hooks/queries/use-invitations';
import { useUploadMedia, useDeleteMedia } from '@/hooks/queries/use-media';
import { useInvitationStore } from '@/stores/invitation-store';
import { useAuthStore } from '@/stores/auth-store';
import { GALLERY_SAMPLES } from '@/lib/gallery-samples';
import { useUIStore } from '@/stores/ui-store';
import { useTemplates } from '@/hooks/queries/use-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { STEPPER_LABELS } from '@/lib/constants';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
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
  Save,
  Eye,
  Upload,
  ImageIcon,
  X,
  Loader2,
  Crown,
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
import { PremiumUpgradeModal } from '@/components/ui/premium-upgrade-modal';

/* ── Theme config (same as new page) ── */
const THEME_CONFIG: Record<string, {
  frameBg: string; coverBg: string; accent: string;
  textPrimary: string; textSecondary: string; borderColor: string;
  ornamentTop: string; ornamentBottom: string;
}> = {
  'super-classic': { frameBg: '#1e1a12', coverBg: 'linear-gradient(135deg, #2c2418 0%, #3d3122 40%, #2c2418 100%)', accent: '#c9a84c', textPrimary: '#c9a84c', textSecondary: 'rgba(201,168,76,0.7)', borderColor: '#c9a84c', ornamentTop: `<svg width="40" height="40" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#c9a84c"/></svg>`, ornamentBottom: `<svg width="32" height="32" viewBox="0 0 24 24"><polygon points="12,0 14.7,8.3 24,8.3 16.6,13.4 19.1,22 12,17 4.9,22 7.4,13.4 0,8.3 9.3,8.3" fill="#c9a84c" opacity="0.5"/></svg>` },
  'simple-java': { frameBg: '#2e2416', coverBg: 'linear-gradient(135deg, #3b2f20, #5a4730, #3b2f20)', accent: '#8b6914', textPrimary: '#d4b254', textSecondary: 'rgba(212,178,84,0.65)', borderColor: '#8b6914', ornamentTop: '', ornamentBottom: '' },
  'golden-elegance': { frameBg: '#080806', coverBg: 'linear-gradient(135deg, #0d0d0d 0%, #1a1508 50%, #0d0d0d 100%)', accent: '#d4a843', textPrimary: '#d4a843', textSecondary: 'rgba(212,168,67,0.7)', borderColor: '#d4a843', ornamentTop: '', ornamentBottom: '' },
  'royal-muslim': { frameBg: '#142218', coverBg: 'linear-gradient(160deg, #1d3225, #264d35, #1d3225)', accent: '#2d6a4f', textPrimary: '#c9a84c', textSecondary: 'rgba(201,168,76,0.65)', borderColor: '#2d6a4f', ornamentTop: '', ornamentBottom: '' },
  'kids-party': { frameBg: '#3d2d6b', coverBg: 'linear-gradient(135deg, #6c5ce7, #fd79a8 40%, #fdcb6e 80%)', accent: '#ff6b35', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.8)', borderColor: '#ff6b35', ornamentTop: '', ornamentBottom: '' },
  'wayang-heritage': { frameBg: '#1e1610', coverBg: 'linear-gradient(145deg, #2a1f14, #3d2d1a 50%, #2a1f14)', accent: '#8b4513', textPrimary: '#d4a86a', textSecondary: 'rgba(212,168,106,0.65)', borderColor: '#8b4513', ornamentTop: '', ornamentBottom: '' },
  'modern-minimal': { frameBg: '#111111', coverBg: '#1a1a1a', accent: '#1a1a1a', textPrimary: '#ffffff', textSecondary: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', ornamentTop: '', ornamentBottom: '' },
  'floral-garden': { frameBg: '#3a1a28', coverBg: 'linear-gradient(160deg, #4a2332, #6b3a4e 40%, #4a2332)', accent: '#d4688e', textPrimary: '#f9e8ed', textSecondary: 'rgba(249,232,237,0.7)', borderColor: '#d4688e', ornamentTop: '', ornamentBottom: '' },
  'christmas-joy': { frameBg: '#121e16', coverBg: 'linear-gradient(160deg, #1a3c2a, #2d1b1b 60%, #1a3c2a)', accent: '#c0392b', textPrimary: '#f0e6d0', textSecondary: 'rgba(240,230,208,0.65)', borderColor: '#c0392b', ornamentTop: '', ornamentBottom: '' },
  'slide-romantic': { frameBg: '#2e1620', coverBg: 'linear-gradient(135deg, #3d1e28, #5c2f3e 40%, #3d1e28)', accent: '#e8758a', textPrimary: '#fef6f4', textSecondary: 'rgba(254,246,244,0.7)', borderColor: '#e8758a', ornamentTop: '', ornamentBottom: '' },
};

export default function EditInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: invitation, isLoading } = useInvitation(id);
  const updateInvitation = useUpdateInvitation();
  const { addToast } = useUIStore();
  const { user } = useAuthStore();

  // Premium check
  const isPremiumUser = user?.subscriptionType === 'PREMIUM' || user?.subscriptionType === 'FAST_SERVE' || user?.role === 'ADMIN';
  const [showPremiumBlockModal, setShowPremiumBlockModal] = useState(false);

  const {
    draft,
    currentStep,
    setField,
    setDraft,
    nextStep,
    prevStep,
    goToStep,
    loadFromExisting,
  } = useInvitationStore();

  // Template filtering by eventType with toggle
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const { data: templatesData } = useTemplates(
    showAllTemplates ? { limit: 50 } : { limit: 50, eventType: draft.eventType }
  );
  const templates = templatesData?.data || [];

  // Track collapsible "Info Tambahan" state per profile
  const [expandedProfiles, setExpandedProfiles] = useState<Record<number, boolean>>({});

  // Get event type config
  const eventConfig = getEventTypeConfig(draft.eventType);

  // ── Gallery media upload ──
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryMedia, setGalleryMedia] = useState<Array<{ id: string; fileUrl: string; purpose: string }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  // Sync gallery media from invitation data
  useEffect(() => {
    if (invitation?.media) {
      setGalleryMedia(
        invitation.media
          .filter((m: any) => m.purpose === 'GALLERY')
          .map((m: any) => ({ id: m.id, fileUrl: m.fileUrl, purpose: m.purpose }))
      );
    }
  }, [invitation]);

  const handleGalleryUpload = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      const tempId = `uploading-${Date.now()}-${file.name}`;
      setUploadingFiles((prev) => new Set(prev).add(tempId));
      try {
        const result = await uploadMedia.mutateAsync({
          file,
          invitationId: id,
          purpose: 'GALLERY',
          sortOrder: galleryMedia.length,
        });
        setGalleryMedia((prev) => [...prev, { id: result.id, fileUrl: result.fileUrl, purpose: 'GALLERY' }]);
      } catch (err) {
        addToast('Gagal mengupload foto', 'error');
      } finally {
        setUploadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }
    }
  }, [id, galleryMedia.length, uploadMedia, addToast]);

  const handleDeleteGalleryMedia = useCallback(async (mediaId: string) => {
    try {
      await deleteMedia.mutateAsync(mediaId);
      setGalleryMedia((prev) => prev.filter((m) => m.id !== mediaId));
      addToast('Foto berhasil dihapus', 'success');
    } catch {
      addToast('Gagal menghapus foto', 'error');
    }
  }, [deleteMedia, addToast]);

  useEffect(() => {
    if (invitation) {
      loadFromExisting(invitation);
    }
  }, [invitation]);

  const handleSubmit = async () => {
    // Check if selected template is premium and user is not premium
    const selectedTemplate = templates.find((t: any) => t.id === draft.templateId);
    if (selectedTemplate?.isPremium && !isPremiumUser) {
      setShowPremiumBlockModal(true);
      return;
    }

    try {
      const payload = {
        title: draft.title,
        slug: draft.slug,
        eventType: draft.eventType,
        openingText: draft.openingText || undefined,
        closingText: draft.closingText || undefined,
        story: draft.story || undefined,
        musicUrl: draft.musicUrl || undefined,
        events: draft.events
          .filter((e) => e.eventName && e.eventDate)
          .map(({ eventName, eventDate, startTime, endTime, venueName, venueAddress, mapUrl }) => ({
            eventName, eventDate, startTime, endTime, venueName, venueAddress, mapUrl,
          })),
        personProfiles: draft.personProfiles
          .filter((p) => p.fullName)
          .map(({ fullName, nickname, photoUrl, parentFather, parentMother, childOrder, role, instagram, dateOfBirth, bio, gender, address, phone, age, jobTitle, organization }) => ({
            fullName, nickname, photoUrl, parentFather, parentMother, childOrder, role, instagram, dateOfBirth, bio, gender, address, phone, age, jobTitle, organization,
          })),
        giftAccounts: draft.giftAccounts
          .filter((g) => g.bankName && g.accountNumber)
          .map(({ bankName, accountNumber, accountHolder }) => ({
            bankName, accountNumber, accountHolder,
          })),
        coInvitors: draft.coInvitors
          .filter((c) => c.name)
          .map(({ name, title }) => ({
            name, title,
          })),
        templateId: draft.templateId || undefined,
      };
      await updateInvitation.mutateAsync({ id, payload });
      addToast('Undangan berhasil diperbarui!', 'success');
      router.push('/dashboard');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Gagal memperbarui undangan', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Undangan</h1>
          <p className="text-gray-500 mt-1">{draft.title || 'Loading...'}</p>
        </div>
        <Button onClick={handleSubmit} loading={updateInvitation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Simpan
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEPPER_LABELS.map((label, index) => (
          <button
            key={label}
            onClick={() => goToStep(index)}
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

      {/* Same form content as new page - reuses same steps */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 0 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4"><CardTitle>Informasi Dasar</CardTitle></CardHeader>
              <Select label="Tipe Acara" options={eventTypeOptions} value={draft.eventType} onChange={(e) => { setField('eventType', e.target.value); setShowAllTemplates(false); }} />
              <Input label="Judul Undangan" placeholder={eventConfig.titlePlaceholder} value={draft.title} onChange={(e) => setField('title', e.target.value)} />
              <Input label="Slug URL" value={draft.slug} onChange={(e) => setField('slug', e.target.value)} />
              <Textarea label="Teks Pembuka" value={draft.openingText} onChange={(e) => setField('openingText', e.target.value)} rows={4} />
              <Textarea label="Teks Penutup" value={draft.closingText} onChange={(e) => setField('closingText', e.target.value)} rows={4} />

              {/* Love Story — Optional */}
              <div className="border-t pt-4 mt-2">
                <p className="text-xs text-gray-400 mb-2">Opsional</p>
                <Textarea
                  label="Kisah / Cerita Latar Belakang"
                  placeholder={draft.eventType === 'WEDDING' || draft.eventType === 'ENGAGEMENT' || draft.eventType === 'ANNIVERSARY'
                    ? 'Ceritakan perjalanan cinta kalian...'
                    : 'Ceritakan latar belakang atau kisah di balik acara ini...'}
                  value={draft.story}
                  onChange={(e) => setField('story', e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Jika diisi, kisah ini akan tampil di halaman undangan sebagai section tersendiri.
                </p>
              </div>
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4"><CardTitle>Detail Acara</CardTitle></CardHeader>
              {draft.events.map((event, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  {draft.events.length > 1 && (
                    <button onClick={() => setDraft({ events: draft.events.filter((_, i) => i !== index) })} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  )}
                  <Input label="Nama Acara" value={event.eventName} onChange={(e) => setField(`events.${index}.eventName`, e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Tanggal" type="date" value={event.eventDate} onChange={(e) => setField(`events.${index}.eventDate`, e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Mulai" type="time" value={event.startTime} onChange={(e) => setField(`events.${index}.startTime`, e.target.value)} />
                      <Input label="Selesai" type="time" value={event.endTime} onChange={(e) => setField(`events.${index}.endTime`, e.target.value)} />
                    </div>
                  </div>
                  <Input label="Nama Tempat" value={event.venueName} onChange={(e) => setField(`events.${index}.venueName`, e.target.value)} />
                  <Textarea label="Alamat" value={event.venueAddress} onChange={(e) => setField(`events.${index}.venueAddress`, e.target.value)} rows={2} />
                  <Input label="Google Maps URL" value={event.mapUrl} onChange={(e) => setField(`events.${index}.mapUrl`, e.target.value)} />
                </div>
              ))}
              <Button variant="outline" onClick={() => setDraft({ events: [...draft.events, { eventName: '', eventDate: '', startTime: '', endTime: '', venueName: '', venueAddress: '', mapUrl: '' }] })}>
                <Plus className="w-4 h-4 mr-2" />Tambah Acara
              </Button>
            </div>
          )}
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
                      <button onClick={() => setDraft({ personProfiles: draft.personProfiles.filter((_, i) => i !== index) })} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    )}

                    {/* Main fields — rendered based on config */}
                    <div className="grid grid-cols-2 gap-4">
                      {mainFields.includes('fullName') && (
                        <Input label={labels.fullName || 'Nama Lengkap'} value={person.fullName} onChange={(e) => setField(`personProfiles.${index}.fullName`, e.target.value)} />
                      )}
                      {mainFields.includes('nickname') && (
                        <Input label={labels.nickname || 'Nama Panggilan'} value={person.nickname} onChange={(e) => setField(`personProfiles.${index}.nickname`, e.target.value)} />
                      )}
                    </div>
                    {(mainFields.includes('parentFather') || mainFields.includes('parentMother')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('parentFather') && (
                          <Input label={labels.parentFather || 'Nama Ayah'} value={person.parentFather} onChange={(e) => setField(`personProfiles.${index}.parentFather`, e.target.value)} />
                        )}
                        {mainFields.includes('parentMother') && (
                          <Input label={labels.parentMother || 'Nama Ibu'} value={person.parentMother} onChange={(e) => setField(`personProfiles.${index}.parentMother`, e.target.value)} />
                        )}
                      </div>
                    )}
                    {(mainFields.includes('childOrder') || mainFields.includes('instagram')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('childOrder') && (
                          <Input label={labels.childOrder || 'Anak Ke-'} value={person.childOrder} onChange={(e) => setField(`personProfiles.${index}.childOrder`, e.target.value)} />
                        )}
                        {mainFields.includes('instagram') && (
                          <Input label={labels.instagram || 'Instagram (@username)'} placeholder="@username" value={person.instagram} onChange={(e) => setField(`personProfiles.${index}.instagram`, e.target.value)} />
                        )}
                      </div>
                    )}
                    {(mainFields.includes('dateOfBirth') || mainFields.includes('age')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('dateOfBirth') && (
                          <Input label={labels.dateOfBirth || 'Tanggal Lahir'} type="date" value={person.dateOfBirth} onChange={(e) => setField(`personProfiles.${index}.dateOfBirth`, e.target.value)} />
                        )}
                        {mainFields.includes('age') && (
                          <Input label={labels.age || 'Usia'} placeholder="10 tahun" value={person.age} onChange={(e) => setField(`personProfiles.${index}.age`, e.target.value)} />
                        )}
                      </div>
                    )}
                    {(mainFields.includes('jobTitle') || mainFields.includes('organization')) && (
                      <div className="grid grid-cols-2 gap-4">
                        {mainFields.includes('jobTitle') && (
                          <Input label={labels.jobTitle || 'Jabatan / Gelar'} value={person.jobTitle} onChange={(e) => setField(`personProfiles.${index}.jobTitle`, e.target.value)} />
                        )}
                        {mainFields.includes('organization') && (
                          <Input label={labels.organization || 'Organisasi / Institusi'} value={person.organization} onChange={(e) => setField(`personProfiles.${index}.organization`, e.target.value)} />
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
                                <Input label={labels.dateOfBirth || 'Tanggal Lahir'} type="date" value={person.dateOfBirth} onChange={(e) => setField(`personProfiles.${index}.dateOfBirth`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('age') && (
                                <Input label={labels.age || 'Usia'} placeholder="10 tahun" value={person.age} onChange={(e) => setField(`personProfiles.${index}.age`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('gender') && (
                                <Select label={labels.gender || 'Jenis Kelamin'} options={[{ value: '', label: 'Pilih...' }, { value: 'Laki-laki', label: 'Laki-laki' }, { value: 'Perempuan', label: 'Perempuan' }]} value={person.gender} onChange={(e) => setField(`personProfiles.${index}.gender`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('instagram') && (
                                <Input label={labels.instagram || 'Instagram (@username)'} placeholder="@username" value={person.instagram} onChange={(e) => setField(`personProfiles.${index}.instagram`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('jobTitle') && (
                                <Input label={labels.jobTitle || 'Jabatan / Gelar'} value={person.jobTitle} onChange={(e) => setField(`personProfiles.${index}.jobTitle`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('organization') && (
                                <Input label={labels.organization || 'Organisasi / Institusi'} value={person.organization} onChange={(e) => setField(`personProfiles.${index}.organization`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('parentFather') && (
                                <Input label={labels.parentFather || 'Nama Ayah'} value={person.parentFather} onChange={(e) => setField(`personProfiles.${index}.parentFather`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('parentMother') && (
                                <Input label={labels.parentMother || 'Nama Ibu'} value={person.parentMother} onChange={(e) => setField(`personProfiles.${index}.parentMother`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('childOrder') && (
                                <Input label={labels.childOrder || 'Anak Ke-'} value={person.childOrder} onChange={(e) => setField(`personProfiles.${index}.childOrder`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('address') && (
                                <Input label={labels.address || 'Alamat'} value={person.address} onChange={(e) => setField(`personProfiles.${index}.address`, e.target.value)} />
                              )}
                              {collapsibleFields.includes('phone') && (
                                <Input label={labels.phone || 'No. HP'} value={person.phone} onChange={(e) => setField(`personProfiles.${index}.phone`, e.target.value)} />
                              )}
                            </div>
                            {collapsibleFields.includes('bio') && (
                              <Textarea label={labels.bio || 'Bio / Deskripsi'} value={person.bio} onChange={(e) => setField(`personProfiles.${index}.bio`, e.target.value)} rows={2} />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <Button variant="outline" onClick={() => setDraft({ personProfiles: [...draft.personProfiles, { fullName: '', nickname: '', photoUrl: '', parentFather: '', parentMother: '', childOrder: '', role: eventConfig.profileRoles[draft.personProfiles.length]?.value || 'secondary', instagram: '', dateOfBirth: '', bio: '', gender: '', address: '', phone: '', age: '', jobTitle: '', organization: '' }] })}>
                <Plus className="w-4 h-4 mr-2" />Tambah Profil
              </Button>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4"><CardTitle>Galeri Foto</CardTitle></CardHeader>
              <p className="text-sm text-gray-500 mb-3">Upload foto untuk galeri undangan Anda. Maksimal 2MB per foto.</p>

              {/* Upload area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length) handleGalleryUpload(e.dataTransfer.files); }}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto" />
                <p className="mt-3 text-sm font-medium text-gray-600">Klik atau drag & drop foto di sini</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — maks 2MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) handleGalleryUpload(e.target.files); e.target.value = ''; }}
                />
              </div>

              {/* Uploading indicators */}
              {uploadingFiles.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengupload {uploadingFiles.size} foto...</span>
                </div>
              )}

              {/* Gallery grid */}
              {galleryMedia.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryMedia.map((media) => (
                    <div key={media.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={media.fileUrl} alt="Gallery" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteGalleryMedia(media.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {galleryMedia.length === 0 && uploadingFiles.size === 0 && (
                <div className="text-center py-4">
                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">Belum ada foto di galeri</p>
                </div>
              )}
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4"><CardTitle>Amplop Digital</CardTitle></CardHeader>
              {draft.giftAccounts.map((gift, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
                  <button onClick={() => setDraft({ giftAccounts: draft.giftAccounts.filter((_, i) => i !== index) })} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  <Input label="Nama Bank" value={gift.bankName} onChange={(e) => setField(`giftAccounts.${index}.bankName`, e.target.value)} />
                  <Input label="Nomor Rekening" value={gift.accountNumber} onChange={(e) => setField(`giftAccounts.${index}.accountNumber`, e.target.value)} />
                  <Input label="Atas Nama" value={gift.accountHolder} onChange={(e) => setField(`giftAccounts.${index}.accountHolder`, e.target.value)} />
                </div>
              ))}
              <Button variant="outline" onClick={() => setDraft({ giftAccounts: [...draft.giftAccounts, { bankName: '', accountNumber: '', accountHolder: '' }] })}>
                <Plus className="w-4 h-4 mr-2" />Tambah Rekening
              </Button>
            </div>
          )}
          {currentStep === 5 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4"><CardTitle>Pilih Tema</CardTitle></CardHeader>

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
                  const isTemplatePremium = template.isPremium;
                  return (
                    <button key={template.id} onClick={() => setField('templateId', template.id)} className={cn('p-4 border-2 rounded-lg text-left transition-all relative', draft.templateId === template.id ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300')}>
                      {isRecommended && (
                        <span className="absolute -top-2.5 -right-2 text-[11px] bg-yellow-100 text-yellow-800 border border-yellow-400 px-2 py-0.5 rounded-full font-semibold shadow">
                          ⭐ Direkomendasikan
                        </span>
                      )}
                      {isTemplatePremium && (
                        <span className="absolute top-2 left-2 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold rounded-full shadow">
                          <Crown className="w-3 h-3" /> Premium
                        </span>
                      )}
                      <div className="h-32 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center">
                        <span className="text-2xl font-serif text-primary-300 absolute">{template.name.charAt(0)}</span>
                        <img
                          src={`/images/templates/${template.slug}.svg`}
                          alt={template.name}
                          className="w-full h-full object-cover relative z-[1]"
                          onError={(e: any) => { e.target.style.display = 'none'; }}
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

              {/* Premium template warning for basic users */}
              {(() => {
                const selectedTpl = templates.find((t: any) => t.id === draft.templateId);
                if (selectedTpl?.isPremium && !isPremiumUser) {
                  return (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Template Premium Dipilih</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Anda memilih template premium. Akses Premium diperlukan untuk menyimpan undangan dengan template ini.
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 6: Preview */}
      {currentStep === 6 && (
        <EditPreviewStep draft={draft} templates={templates} galleryMedia={galleryMedia} />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={currentStep === 0 ? () => router.back() : prevStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />{currentStep === 0 ? 'Batal' : 'Sebelumnya'}
        </Button>
        {currentStep < 6 ? (
          <Button onClick={nextStep}>
            {currentStep === 5 ? (
              <><Eye className="w-4 h-4 mr-2" />Lihat Preview</>
            ) : (
              <>Selanjutnya<ChevronRight className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={updateInvitation.isPending}>
            <Save className="w-4 h-4 mr-2" />Simpan Perubahan
          </Button>
        )}
      </div>

      {/* Premium Template Block Modal */}
      <PremiumUpgradeModal
        open={showPremiumBlockModal}
        onClose={() => setShowPremiumBlockModal(false)}
        featureName="Template Premium"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EDIT PREVIEW STEP
   ═══════════════════════════════════════════════════ */
function EditPreviewStep({ draft, templates, galleryMedia }: { draft: any; templates: any[]; galleryMedia: Array<{ id: string; fileUrl: string; purpose: string }> }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedTemplate = templates.find((t: any) => t.id === draft.templateId);
  const themeSlug = selectedTemplate?.slug || 'super-classic';
  const themeClass = `theme-${themeSlug}`;
  const themeConf = THEME_CONFIG[themeSlug] || THEME_CONFIG['super-classic'];

  const previewData = useMemo(() => {
    const config = getEventTypeConfig(draft.eventType);
    const title = draft.title?.trim() || config.titlePlaceholder;
    const openingText = draft.openingText?.trim() || config.defaultOpeningText;
    const closingText = draft.closingText?.trim() || config.defaultClosingText;

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

    const validEvents = draft.events?.filter((e: any) => e.eventName?.trim() && e.eventDate) || [];
    const futureDate = new Date(); futureDate.setMonth(futureDate.getMonth() + 3);
    const dateStr = futureDate.toISOString().split('T')[0];
    const events = validEvents.length > 0
      ? validEvents.map((e: any) => ({ eventName: e.eventName, eventDate: e.eventDate, startTime: e.startTime || '08:00', endTime: e.endTime || '10:00', venueName: e.venueName || 'Nama Tempat', venueAddress: e.venueAddress || 'Alamat Lengkap', mapUrl: e.mapUrl || '' }))
      : config.defaultEventNames.map(name => ({ eventName: name, eventDate: dateStr, startTime: '08:00', endTime: '10:00', venueName: 'Nama Tempat', venueAddress: 'Alamat Lengkap', mapUrl: '' }));

    const eventDate = validEvents.length > 0 && validEvents[0].eventDate ? new Date(validEvents[0].eventDate) : futureDate;

    const media = galleryMedia.length > 0
      ? galleryMedia.map((m, i) => ({ id: m.id, url: m.fileUrl, fileUrl: m.fileUrl, purpose: 'GALLERY' }))
      : GALLERY_SAMPLES.map((url, i) => ({ id: `preview-${i}`, url, fileUrl: url, purpose: 'GALLERY' }));

    const validGifts = draft.giftAccounts?.filter((g: any) => g.bankName?.trim() && g.accountNumber?.trim()) || [];
    const giftAccounts = validGifts.length > 0 ? validGifts : [{ bankName: 'Nama Bank', accountNumber: '1234567890', accountHolder: 'Nama Pemilik' }];

    const validCoInvitors = draft.coInvitors?.filter((c: any) => c.name?.trim()) || [];
    const coInvitors = validCoInvitors.length > 0 ? validCoInvitors.map((c: any) => ({ name: c.name, role: c.title || '' })) : [{ name: 'Keluarga Besar', role: 'Orang Tua Mempelai' }];

    return { title, openingText, closingText, personProfiles, events, eventDate, media, giftAccounts, coInvitors };
  }, [draft, galleryMedia]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg"><Eye className="w-5 h-5 text-primary-600" /></div>
              <div>
                <h3 className="font-semibold text-gray-900">Preview Undangan</h3>
                <p className="text-xs text-gray-500">Berikut tampilan undangan Anda setelah perubahan.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <div className="w-full max-w-[430px] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 relative border border-gray-200" style={{ height: '700px', background: themeConf.frameBg }}>
          <style>{`.edit-preview-frame .invitation-cover { position: absolute !important; } .edit-preview-frame .invitation-content { height: 100% !important; } .edit-preview-frame .invitation-section { min-height: 100% !important; }`}</style>
          <div className={`edit-preview-frame invitation-root ${themeClass} h-full`} style={{ background: themeConf.frameBg }}>
            {!isOpen && (
              <CoverScreen title={previewData.title} guestName="Tamu Undangan" eventDate={previewData.eventDate} onOpen={() => setIsOpen(true)} themeConfig={themeConf} eventType={draft.eventType} />
            )}
            {isOpen && (
              <main className="invitation-content">
                <HeroSection openingText={previewData.openingText} title={previewData.title} eventType={draft.eventType} />
                <PersonProfileSection profiles={previewData.personProfiles} eventType={draft.eventType} />
                <CountdownTimer targetDate={previewData.eventDate} />
                <EventDetailsSection events={previewData.events} />
                <GallerySection media={previewData.media} />
                <DigitalGiftSection accounts={previewData.giftAccounts} />
                <ClosingSection closingText={previewData.closingText} coInvitors={previewData.coInvitors} />
              </main>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
