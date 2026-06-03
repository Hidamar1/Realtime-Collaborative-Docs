import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { createCommentThread, replyToCommentThread, resolveCommentThread } from '../domain/commentService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerCommentRoutes(app: FastifyInstance, store: MemoryStore) {
  app.post('/api/documents/:documentId/comments', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    const body = request.body as { selectedText: string; body: string; anchor: unknown };
    return createCommentThread(store, { documentId: params.documentId, actorId: user.id, ...body });
  });

  app.post('/api/comments/:threadId/replies', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { threadId: string };
    const body = request.body as { body: string };
    return replyToCommentThread(store, { threadId: params.threadId, actorId: user.id, body: body.body });
  });

  app.post('/api/comments/:threadId/resolve', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { threadId: string };
    return resolveCommentThread(store, { threadId: params.threadId, actorId: user.id });
  });
}
