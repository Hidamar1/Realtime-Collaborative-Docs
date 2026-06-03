export type AuthenticatedRole = 'owner' | 'editor' | 'viewer';
export type Role = AuthenticatedRole | 'anonymousViewer';

export type PermissionAction =
  | 'viewDocument'
  | 'viewPublicPreview'
  | 'editDocument'
  | 'manageMembers'
  | 'deleteDocument'
  | 'createComment'
  | 'replyComment'
  | 'resolveComment'
  | 'viewSnapshots'
  | 'restoreSnapshot'
  | 'togglePublicPreview'
  | 'joinRealtimeRoom';

export type DocumentVisibility = 'private' | 'public_readonly';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  ownerId: string;
  visibility: DocumentVisibility;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  lastSavedAt?: string;
}
