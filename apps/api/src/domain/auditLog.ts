import { nanoid } from 'nanoid';
import type { MemoryStore } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';

export function recordAuditEvent(store: MemoryStore, input: { actorId: string; action: string; documentId?: string }): void {
  store.auditEvents.push({
    id: nanoid(),
    actorId: input.actorId,
    action: input.action,
    documentId: input.documentId,
    createdAt: nowIso()
  });
}
