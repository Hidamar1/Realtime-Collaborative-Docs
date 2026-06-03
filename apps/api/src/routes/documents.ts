import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { createDocumentFromTemplate, createEmptyDocument } from '../domain/documentService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerDocumentRoutes(app: FastifyInstance, store: MemoryStore) {
  app.get('/api/templates', async () => store.templates);

  app.post('/api/documents', async (request) => {
    const user = getCurrentUser(request);
    const body = request.body as { title: string };
    return createEmptyDocument(store, { title: body.title, ownerId: user.id });
  });

  app.post('/api/documents/from-template', async (request) => {
    const user = getCurrentUser(request);
    const body = request.body as { templateId: string };
    return createDocumentFromTemplate(store, { templateId: body.templateId, ownerId: user.id });
  });

  app.get('/api/documents/:documentId', async (request, reply) => {
    getCurrentUser(request);
    const params = request.params as { documentId: string };
    const document = store.documents.get(params.documentId);
    const content = store.contents.get(params.documentId);
    if (!document || !content) {
      reply.code(404);
      return { error: 'Document not found' };
    }
    return { document, content };
  });
}
