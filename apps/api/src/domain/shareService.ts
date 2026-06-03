import { nanoid } from 'nanoid';
import type { MemoryStore } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';
import { recordAuditEvent } from './auditLog';

export function enablePublicPreview(store: MemoryStore, input: { documentId: string; actorId: string }) {
  const document = store.documents.get(input.documentId);
  if (!document || document.ownerId !== input.actorId) {
    throw new Error('Only owner can enable public preview');
  }
  const now = nowIso();
  document.visibility = 'public_readonly';
  document.updatedAt = now;
  const link = {
    id: nanoid(),
    documentId: input.documentId,
    token: nanoid(24),
    enabled: true,
    createdBy: input.actorId,
    createdAt: now
  };
  store.shareLinks.set(link.token, link);
  recordAuditEvent(store, { actorId: input.actorId, action: 'share.enabled', documentId: input.documentId });
  return link;
}

export function disablePublicPreview(store: MemoryStore, input: { documentId: string; actorId: string }): void {
  const document = store.documents.get(input.documentId);
  if (!document || document.ownerId !== input.actorId) {
    throw new Error('Only owner can disable public preview');
  }
  const now = nowIso();
  document.visibility = 'private';
  document.updatedAt = now;
  for (const link of store.shareLinks.values()) {
    if (link.documentId === input.documentId && link.enabled) {
      link.enabled = false;
      link.disabledAt = now;
    }
  }
  recordAuditEvent(store, { actorId: input.actorId, action: 'share.disabled', documentId: input.documentId });
}

export function getPublicPreview(store: MemoryStore, token: string) {
  const link = store.shareLinks.get(token);
  if (!link?.enabled) return null;
  const document = store.documents.get(link.documentId);
  const content = store.contents.get(link.documentId);
  if (!document || !content || document.visibility !== 'public_readonly') return null;
  return { document, content };
}
