import { nanoid } from 'nanoid';
import type { MemoryStore } from '../repositories/memoryStore';
import { nowIso } from '../repositories/memoryStore';
import { sanitizeCommentText } from '../security/sanitize';

export function createCommentThread(store: MemoryStore, input: {
  documentId: string;
  actorId: string;
  selectedText: string;
  body: string;
  anchor: unknown;
}) {
  const now = nowIso();
  const thread = {
    id: nanoid(),
    documentId: input.documentId,
    anchor: input.anchor,
    status: 'open' as const,
    createdBy: input.actorId,
    createdAt: now
  };
  store.commentThreads.set(thread.id, thread);
  store.commentReplies.push({
    id: nanoid(),
    threadId: thread.id,
    body: sanitizeCommentText(input.body),
    createdBy: input.actorId,
    createdAt: now
  });
  return thread;
}

export function replyToCommentThread(store: MemoryStore, input: { threadId: string; actorId: string; body: string }) {
  const thread = store.commentThreads.get(input.threadId);
  if (!thread || thread.status !== 'open') {
    throw new Error('Open comment thread not found');
  }
  const reply = {
    id: nanoid(),
    threadId: input.threadId,
    body: sanitizeCommentText(input.body),
    createdBy: input.actorId,
    createdAt: nowIso()
  };
  store.commentReplies.push(reply);
  return reply;
}

export function resolveCommentThread(store: MemoryStore, input: { threadId: string; actorId: string }) {
  const thread = store.commentThreads.get(input.threadId);
  if (!thread) {
    throw new Error('Comment thread not found');
  }
  thread.status = 'resolved';
  thread.resolvedBy = input.actorId;
  thread.resolvedAt = nowIso();
  return thread;
}
