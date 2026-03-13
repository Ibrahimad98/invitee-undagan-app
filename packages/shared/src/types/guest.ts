export interface Guest {
  id: string;
  invitationId: string;
  name: string;
  phone?: string;
  email?: string;
  groupName?: string;
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
}

export interface UpdateGuestPayload extends Partial<Omit<CreateGuestPayload, 'invitationId'>> {
  isSent?: boolean;
  sentVia?: string;
}

export interface ImportGuestsPayload {
  invitationId: string;
  guests: Omit<CreateGuestPayload, 'invitationId'>[];
}
