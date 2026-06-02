import type { PermissionAction, Role } from './types';

const permissions: Record<Role, ReadonlySet<PermissionAction>> = {
  owner: new Set([
    'viewDocument',
    'editDocument',
    'manageMembers',
    'deleteDocument',
    'createComment',
    'replyComment',
    'resolveComment',
    'viewSnapshots',
    'restoreSnapshot',
    'togglePublicPreview',
    'joinRealtimeRoom'
  ]),
  editor: new Set([
    'viewDocument',
    'editDocument',
    'createComment',
    'replyComment',
    'resolveComment',
    'viewSnapshots',
    'restoreSnapshot',
    'joinRealtimeRoom'
  ]),
  viewer: new Set(['viewDocument', 'viewSnapshots', 'joinRealtimeRoom']),
  anonymousViewer: new Set(['viewPublicPreview'])
};

export function canPerform(role: Role, action: PermissionAction): boolean {
  return permissions[role].has(action);
}
