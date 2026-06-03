import { createDocumentRecord, nowIso, type MemoryStore } from '../repositories/memoryStore';
import { recordAuditEvent } from './auditLog';

const emptyContent = { type: 'doc', content: [] };

export function createEmptyDocument(store: MemoryStore, input: { title: string; ownerId: string }) {
  const document = createDocumentRecord({ title: input.title, ownerId: input.ownerId });
  const now = nowIso();
  store.documents.set(document.id, document);
  store.contents.set(document.id, {
    documentId: document.id,
    contentState: emptyContent,
    collaborationState: new Uint8Array(),
    version: 1,
    updatedAt: now
  });
  store.members.set(`${document.id}:${input.ownerId}`, {
    documentId: document.id,
    userId: input.ownerId,
    role: 'owner',
    createdAt: now,
    updatedAt: now
  });
  recordAuditEvent(store, { actorId: input.ownerId, action: 'document.created', documentId: document.id });
  return document;
}

export function createDocumentFromTemplate(store: MemoryStore, input: { templateId: string; ownerId: string }) {
  const template = store.templates.find((item) => item.id === input.templateId);
  if (!template) {
    throw new Error('Template not found');
  }

  const document = createDocumentRecord({ title: template.title, ownerId: input.ownerId });
  const now = nowIso();
  store.documents.set(document.id, document);
  store.contents.set(document.id, {
    documentId: document.id,
    contentState: structuredClone(template.contentState),
    collaborationState: new Uint8Array(),
    version: 1,
    updatedAt: now
  });
  store.members.set(`${document.id}:${input.ownerId}`, {
    documentId: document.id,
    userId: input.ownerId,
    role: 'owner',
    createdAt: now,
    updatedAt: now
  });
  recordAuditEvent(store, { actorId: input.ownerId, action: 'document.created_from_template', documentId: document.id });
  return document;
}
