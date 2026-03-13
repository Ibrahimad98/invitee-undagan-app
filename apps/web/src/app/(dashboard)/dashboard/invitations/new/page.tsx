'use client';

import { useEffect } from 'react';
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
import { STEPPER_LABELS } from '@/lib/constants';
import { EVENT_TYPE_LABELS } from '@invitee/shared';
import { slugify } from '@invitee/shared';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Star,
  Upload,
} from 'lucide-react';

export default function NewInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useUIStore();
  const createInvitation = useCreateInvitation();
  const { data: templatesData } = useTemplates({ limit: 50 });
  const templates = templatesData?.data || [];

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

  useEffect(() => {
    reset();
    const templateId = searchParams.get('templateId');
    if (templateId) {
      setField('templateId', templateId);
    }
  }, []);

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

  const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

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
                onChange={(e) => setField('eventType', e.target.value)}
              />
              <Input
                label="Judul Undangan"
                placeholder="Pernikahan Andi & Sari"
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

          {/* Step 2: Person Profiles */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              {draft.personProfiles.map((person, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4 relative">
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
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nama Lengkap"
                      value={person.fullName}
                      onChange={(e) => setField(`personProfiles.${index}.fullName`, e.target.value)}
                    />
                    <Input
                      label="Nama Panggilan"
                      value={person.nickname}
                      onChange={(e) => setField(`personProfiles.${index}.nickname`, e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nama Ayah"
                      value={person.parentFather}
                      onChange={(e) => setField(`personProfiles.${index}.parentFather`, e.target.value)}
                    />
                    <Input
                      label="Nama Ibu"
                      value={person.parentMother}
                      onChange={(e) => setField(`personProfiles.${index}.parentMother`, e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Anak Ke- (contoh: Putra Pertama)"
                      value={person.childOrder}
                      onChange={(e) => setField(`personProfiles.${index}.childOrder`, e.target.value)}
                    />
                    <Input
                      label="Instagram"
                      placeholder="@username"
                      value={person.instagram}
                      onChange={(e) => setField(`personProfiles.${index}.instagram`, e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setDraft({
                    personProfiles: [
                      ...draft.personProfiles,
                      { fullName: '', nickname: '', photoUrl: '', parentFather: '', parentMother: '', childOrder: '', role: 'secondary', instagram: '' },
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

          {/* Step 5: Template Selection */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <CardHeader className="p-0 pb-4">
                <CardTitle>Pilih Tema</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map((template: any) => (
                  <button
                    key={template.id}
                    onClick={() => setField('templateId', template.id)}
                    className={cn(
                      'p-4 border-2 rounded-lg text-left transition-all',
                      draft.templateId === template.id
                        ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    <div className="h-24 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-2xl font-serif text-primary-300">
                        {template.name.charAt(0)}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{template.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-gray-500">{template.ratingAvg.toFixed(1)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? () => router.back() : prevStep}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {currentStep === 0 ? 'Batal' : 'Sebelumnya'}
        </Button>

        {currentStep < 5 ? (
          <Button onClick={nextStep}>
            Selanjutnya
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={createInvitation.isPending}>
            <Check className="w-4 h-4 mr-2" />
            Buat Undangan
          </Button>
        )}
      </div>
    </div>
  );
}
