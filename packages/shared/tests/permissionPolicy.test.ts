import { describe, expect, test } from 'vitest';
import { canPerform } from '../src/permissionPolicy';

const actions = [
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
] as const;

describe('canPerform', () => {
  test('allows owner to perform every authenticated document action', () => {
    for (const action of actions) {
      expect(canPerform('owner', action)).toBe(true);
    }
  });

  test('allows editor to edit, comment, view snapshots, restore snapshots, and join realtime room', () => {
    expect(canPerform('editor', 'editDocument')).toBe(true);
    expect(canPerform('editor', 'createComment')).toBe(true);
    expect(canPerform('editor', 'restoreSnapshot')).toBe(true);
    expect(canPerform('editor', 'joinRealtimeRoom')).toBe(true);
    expect(canPerform('editor', 'manageMembers')).toBe(false);
    expect(canPerform('editor', 'togglePublicPreview')).toBe(false);
  });

  test('keeps viewer read-only but allows joining realtime room', () => {
    expect(canPerform('viewer', 'viewDocument')).toBe(true);
    expect(canPerform('viewer', 'viewSnapshots')).toBe(true);
    expect(canPerform('viewer', 'joinRealtimeRoom')).toBe(true);
    expect(canPerform('viewer', 'editDocument')).toBe(false);
    expect(canPerform('viewer', 'createComment')).toBe(false);
    expect(canPerform('viewer', 'restoreSnapshot')).toBe(false);
  });

  test('limits anonymous viewer to public preview only', () => {
    expect(canPerform('anonymousViewer', 'viewPublicPreview')).toBe(true);
    expect(canPerform('anonymousViewer', 'viewDocument')).toBe(false);
    expect(canPerform('anonymousViewer', 'joinRealtimeRoom')).toBe(false);
    expect(canPerform('anonymousViewer', 'createComment')).toBe(false);
  });
});
