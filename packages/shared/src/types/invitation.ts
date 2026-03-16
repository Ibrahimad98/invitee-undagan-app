export interface Invitation {
  id: string;
  userId: string;
  slug: string;
  title: string;
  eventType: EventType;
  coverImageUrl?: string;
  openingText?: string;
  closingText?: string;
  musicUrl?: string;
  isPublished: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  events?: InvitationEvent[];
  personProfiles?: PersonProfile[];
  giftAccounts?: GiftAccount[];
  coInvitors?: CoInvitor[];
  media?: Media[];
  templates?: InvitationTemplate[];
  guests?: Guest[];
  rsvps?: Rsvp[];
}

export interface InvitationEvent {
  id: string;
  invitationId: string;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  venueName?: string;
  venueAddress?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  sortOrder: number;
}

export interface PersonProfile {
  id: string;
  invitationId: string;
  fullName: string;
  nickname?: string;
  photoUrl?: string;
  parentFather?: string;
  parentMother?: string;
  childOrder?: string;
  role: string;
  instagram?: string;
  dateOfBirth?: string;
  bio?: string;
  gender?: string;
  address?: string;
  phone?: string;
  age?: string;
  jobTitle?: string;
  organization?: string;
  sortOrder: number;
}

export interface CoInvitor {
  id: string;
  invitationId: string;
  name: string;
  title?: string;
  sortOrder: number;
}

export type EventType = 'WEDDING' | 'KHITANAN' | 'BIRTHDAY' | 'AQIQAH' | 'ENGAGEMENT' | 'GRADUATION' | 'REUNION' | 'CORPORATE' | 'SYUKURAN' | 'ANNIVERSARY' | 'WALIMAH' | 'CUSTOM';

export interface CreateInvitationPayload {
  title: string;
  slug: string;
  eventType: EventType;
  coverImageUrl?: string;
  openingText?: string;
  closingText?: string;
  musicUrl?: string;
  events?: Omit<InvitationEvent, 'id' | 'invitationId'>[];
  personProfiles?: Omit<PersonProfile, 'id' | 'invitationId'>[];
  giftAccounts?: Omit<GiftAccount, 'id' | 'invitationId'>[];
  coInvitors?: Omit<CoInvitor, 'id' | 'invitationId'>[];
  templateId?: string;
}

export interface UpdateInvitationPayload extends Partial<CreateInvitationPayload> {}

// Re-export related types
import type { GiftAccount } from './gift';
import type { Media } from './media';
import type { Guest } from './guest';
import type { Rsvp } from './rsvp';

export interface InvitationTemplate {
  id: string;
  invitationId: string;
  templateId: string;
  isPrimary: boolean;
  template?: import('./template').Template;
}
