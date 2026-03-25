export interface InvitationComment {
  id: string;
  invitationId: string;
  name: string;
  message: string;
  createdAt: string;
}

export interface CreateCommentPayload {
  invitationId: string;
  name: string;
  message: string;
}
