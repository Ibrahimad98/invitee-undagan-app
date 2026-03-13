export interface Media {
  id: string;
  invitationId?: string;
  userId?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  originalName?: string;
  purpose: MediaPurpose;
  sortOrder: number;
  createdAt: string;
}

export type MediaPurpose = 'GALLERY' | 'COVER' | 'PROFILE' | 'MUSIC';

export interface UploadMediaPayload {
  invitationId?: string;
  purpose: MediaPurpose;
  sortOrder?: number;
}
