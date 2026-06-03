import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { disablePublicPreview, enablePublicPreview, getPublicPreview } from '../domain/shareService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerShareRoutes(app: FastifyInstance, store: MemoryStore) {
  app.post('/api/documents/:documentId/share', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    return enablePublicPreview(store, { documentId: params.documentId, actorId: user.id });
  });

  app.delete('/api/documents/:documentId/share', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    disablePublicPreview(store, { documentId: params.documentId, actorId: user.id });
    return { ok: true };
  });

  app.get('/api/public/:token', async (request, reply) => {
    const params = request.params as { token: string };
    const preview = getPublicPreview(store, params.token);
    if (!preview) {
      reply.code(404);
      return { error: 'Public preview not found' };
    }
    return { document: preview.document, content: preview.content };
  });
}
