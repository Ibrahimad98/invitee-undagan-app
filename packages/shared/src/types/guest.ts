export interface Guest {
  id: string;
  invitationId: string;
  name: string;
  phone?: string;
  email?: string;
  groupName?: string;
  address?: string;
  numberOfGuests: number;
  isSent: boolean;
  sentAt?: string;
  sentVia?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuestPayload {
  invitationId: string;
  name: string;
  phone?: string;
  email?: string;
  groupName?: string;
  address?: string;
  numberOfGuests?: number;
}

export interface UpdateGuestPayload extends Partial<Omit<CreateGuestPayload, 'invitationId'>> {
  isSent?: boolean;
  sentVia?: string;
}

export interface ImportGuestsPayload {
  invitationId: string;
  guests: Omit<CreateGuestPayload, 'invitationId'>[];
}
