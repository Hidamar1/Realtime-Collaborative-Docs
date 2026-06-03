import { describe, expect, test } from 'vitest';
import { createCommentThread, replyToCommentThread, resolveCommentThread } from '../src/domain/commentService';
import { createEmptyDocument } from '../src/domain/documentService';
import { createMemoryStore } from '../src/repositories/memoryStore';

describe('commentService', () => {
  test('creates, replies, and resolves a comment thread with sanitized body', () => {
    const store = createMemoryStore();
    const document = createEmptyDocument(store, { title: '报告', ownerId: 'owner-a' });

    const thread = createCommentThread(store, {
      documentId: document.id,
      actorId: 'owner-a',
      selectedText: '研究目标',
      body: '<script>alert(1)</script>需要更明确',
      anchor: { from: 1, to: 5, text: '研究目标' }
    });

    expect(thread.status).toBe('open');
    expect(store.commentReplies[0].body).toBe('&lt;script&gt;alert(1)&lt;/script&gt;需要更明确');

    replyToCommentThread(store, { threadId: thread.id, actorId: 'owner-a', body: '已补充' });
    resolveCommentThread(store, { threadId: thread.id, actorId: 'owner-a' });

    expect(store.commentThreads.get(thread.id)?.status).toBe('resolved');
    expect(store.commentReplies).toHaveLength(2);
  });
});
