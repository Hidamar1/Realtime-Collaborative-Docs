import websocket from '@fastify/websocket';
import fastify from 'fastify';
import { createMemoryStore } from './repositories/memoryStore';
import { registerCommentRoutes } from './routes/comments';
import { registerDocumentRoutes } from './routes/documents';
import { registerShareRoutes } from './routes/share';
import { registerSnapshotRoutes } from './routes/snapshots';

export function buildServer() {
  const app = fastify();
  const store = createMemoryStore();
  app.register(websocket);

  app.decorate('store', store);
  app.get('/health', async () => ({ ok: true }));
  app.register(async (instance) => {
    await registerDocumentRoutes(instance, store);
    await registerShareRoutes(instance, store);
    await registerCommentRoutes(instance, store);
    await registerSnapshotRoutes(instance, store);
  });

  return app;
}
