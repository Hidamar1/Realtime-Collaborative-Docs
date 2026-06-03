import { describe, expect, test } from 'vitest';
import { createEmptyDocument } from '../src/domain/documentService';
import { createMemoryStore } from '../src/repositories/memoryStore';
import { disablePublicPreview, enablePublicPreview, getPublicPreview } from '../src/domain/shareService';

describe('shareService', () => {
  test('owner can enable and disable public readonly preview', () => {
    const store = createMemoryStore();
    const document = createEmptyDocument(store, { title: '报告', ownerId: 'owner-a' });

    const link = enablePublicPreview(store, { documentId: document.id, actorId: 'owner-a' });

    expect(getPublicPreview(store, link.token)?.document.id).toBe(document.id);
    expect(store.documents.get(document.id)?.visibility).toBe('public_readonly');

    disablePublicPreview(store, { documentId: document.id, actorId: 'owner-a' });

    expect(getPublicPreview(store, link.token)).toBe(null);
    expect(store.documents.get(document.id)?.visibility).toBe('private');
  });
});
