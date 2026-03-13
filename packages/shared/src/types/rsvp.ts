export interface Rsvp {
  id: string;
  invitationId: string;
  guestId?: string;
  guestName: string;
  message?: string;
  attendance: AttendanceStatus;
  numGuests: number;
  isApproved: boolean;
  createdAt: string;
}

export type AttendanceStatus = 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE' | 'PENDING';

export interface CreateRsvpPayload {
  invitationId: string;
  guestName: string;
  message?: string;
  attendance: AttendanceStatus;
  numGuests?: number;
}
