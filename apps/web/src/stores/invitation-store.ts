import { create } from 'zustand';
import type { CreateInvitationPayload, EventType } from '@invitee/shared';

interface InvitationDraft {
  title: string;
  slug: string;
  eventType: EventType;
  coverImageUrl: string;
  openingText: string;
  closingText: string;
  musicUrl: string;
  events: Array<{
    eventName: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    venueName: string;
    venueAddress: string;
    mapUrl: string;
  }>;
  personProfiles: Array<{
    fullName: string;
    nickname: string;
    photoUrl: string;
    parentFather: string;
    parentMother: string;
    childOrder: string;
    role: string;
    instagram: string;
  }>;
  giftAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }>;
  coInvitors: Array<{
    name: string;
    title: string;
  }>;
  templateId: string;
}

interface InvitationState {
  draft: InvitationDraft;
  currentStep: number;
  isDirty: boolean;
  setField: (path: string, value: any) => void;
  setDraft: (partial: Partial<InvitationDraft>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  loadFromExisting: (data: any) => void;
}

const initialDraft: InvitationDraft = {
  title: '',
  slug: '',
  eventType: 'WEDDING',
  coverImageUrl: '',
  openingText: '',
  closingText: '',
  musicUrl: '',
  events: [
    {
      eventName: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      venueName: '',
      venueAddress: '',
      mapUrl: '',
    },
  ],
  personProfiles: [
    {
      fullName: '',
      nickname: '',
      photoUrl: '',
      parentFather: '',
      parentMother: '',
      childOrder: '',
      role: 'primary',
      instagram: '',
    },
  ],
  giftAccounts: [],
  coInvitors: [],
  templateId: '',
};

export const useInvitationStore = create<InvitationState>()((set) => ({
  draft: { ...initialDraft },
  currentStep: 0,
  isDirty: false,

  setField: (path: string, value: any) =>
    set((state) => {
      const draft = { ...state.draft };
      const keys = path.split('.');
      let current: any = draft;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (Array.isArray(current[key])) {
          current[key] = [...current[key]];
        } else {
          current[key] = { ...current[key] };
        }
        current = current[key];
      }

      current[keys[keys.length - 1]] = value;
      return { draft, isDirty: true };
    }),

  setDraft: (partial) =>
    set((state) => ({
      draft: { ...state.draft, ...partial },
      isDirty: true,
    })),

  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  goToStep: (step) => set({ currentStep: step }),

  reset: () =>
    set({
      draft: { ...initialDraft },
      currentStep: 0,
      isDirty: false,
    }),

  loadFromExisting: (data: any) =>
    set({
      draft: {
        title: data.title || '',
        slug: data.slug || '',
        eventType: data.eventType || 'WEDDING',
        coverImageUrl: data.coverImageUrl || '',
        openingText: data.openingText || '',
        closingText: data.closingText || '',
        musicUrl: data.musicUrl || '',
        events: data.events?.length
          ? data.events.map((e: any) => ({
              eventName: e.eventName || '',
              eventDate: e.eventDate || '',
              startTime: e.startTime || '',
              endTime: e.endTime || '',
              venueName: e.venueName || '',
              venueAddress: e.venueAddress || '',
              mapUrl: e.mapUrl || '',
            }))
          : initialDraft.events,
        personProfiles: data.personProfiles?.length
          ? data.personProfiles.map((p: any) => ({
              fullName: p.fullName || '',
              nickname: p.nickname || '',
              photoUrl: p.photoUrl || '',
              parentFather: p.parentFather || '',
              parentMother: p.parentMother || '',
              childOrder: p.childOrder || '',
              role: p.role || 'primary',
              instagram: p.instagram || '',
            }))
          : initialDraft.personProfiles,
        giftAccounts: data.giftAccounts || [],
        coInvitors: data.coInvitors || [],
        templateId:
          data.templates?.find((t: any) => t.isPrimary)?.templateId || '',
      },
      currentStep: 0,
      isDirty: false,
    }),
}));
