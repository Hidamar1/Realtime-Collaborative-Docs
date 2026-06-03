import { nanoid } from 'nanoid';
import type { MemoryStore, DocumentSnapshotRecord } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';
import { recordAuditEvent } from './auditLog';

export function createSnapshot(store: MemoryStore, input: {
  documentId: string;
  actorId: string;
  reason: DocumentSnapshotRecord['reason'];
}) {
  const content = store.contents.get(input.documentId);
  if (!content) {
    throw new Error('Document content not found');
  }
  const snapshot: DocumentSnapshotRecord = {
    id: nanoid(),
    documentId: input.documentId,
    contentState: structuredClone(content.contentState),
    collaborationState: new Uint8Array(content.collaborationState),
    documentVersion: content.version,
    createdAt: nowIso(),
    createdBy: input.actorId,
    reason: input.reason
  };
  store.snapshots.push(snapshot);
  return snapshot;
}

export function restoreSnapshot(store: MemoryStore, input: { snapshotId: string; actorId: string }) {
  const snapshot = store.snapshots.find((item) => item.id === input.snapshotId);
  if (!snapshot) {
    throw new Error('Snapshot not found');
  }
  const content = store.contents.get(snapshot.documentId);
  if (!content) {
    throw new Error('Document content not found');
  }
  content.contentState = structuredClone(snapshot.contentState);
  content.collaborationState = new Uint8Array(snapshot.collaborationState);
  content.version += 1;
  content.updatedAt = nowIso();
  recordAuditEvent(store, { actorId: input.actorId, action: 'snapshot.restored', documentId: snapshot.documentId });
  return createSnapshot(store, {
    documentId: snapshot.documentId,
    actorId: input.actorId,
    reason: 'restore'
  });
}
