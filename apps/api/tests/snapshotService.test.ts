import { describe, expect, test } from 'vitest';
import { createEmptyDocument } from '../src/domain/documentService';
import { createSnapshot, restoreSnapshot } from '../src/domain/snapshotService';
import { createMemoryStore } from '../src/repositories/memoryStore';

describe('snapshotService', () => {
  test('creates a snapshot and restores it as a new document state', () => {
    const store = createMemoryStore();
    const document = createEmptyDocument(store, { title: '报告', ownerId: 'owner-a' });
    store.contents.get(document.id)!.contentState = { type: 'doc', content: [{ type: 'paragraph', text: 'v1' }] };

    const snapshot = createSnapshot(store, {
      documentId: document.id,
      actorId: 'owner-a',
      reason: 'significant_change'
    });

    store.contents.get(document.id)!.contentState = { type: 'doc', content: [{ type: 'paragraph', text: 'v2' }] };
    restoreSnapshot(store, { snapshotId: snapshot.id, actorId: 'owner-a' });

    expect(store.contents.get(document.id)?.contentState).toEqual(snapshot.contentState);
    expect(store.snapshots.filter((item) => item.documentId === document.id)).toHaveLength(2);
  });
});
