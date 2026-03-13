export interface GiftAccount {
  id: string;
  invitationId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  sortOrder: number;
  createdAt: string;
}

export interface CreateGiftAccountPayload {
  invitationId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  sortOrder?: number;
}
