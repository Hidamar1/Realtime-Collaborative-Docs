import type { FastifyInstance } from 'fastify';
import { getCurrentUser } from '../auth/currentUser';
import { createSnapshot, restoreSnapshot } from '../domain/snapshotService';
import type { MemoryStore } from '../repositories/memoryStore';

export async function registerSnapshotRoutes(app: FastifyInstance, store: MemoryStore) {
  app.get('/api/documents/:documentId/snapshots', async (request) => {
    getCurrentUser(request);
    const params = request.params as { documentId: string };
    return store.snapshots.filter((item) => item.documentId === params.documentId);
  });

  app.post('/api/documents/:documentId/snapshots', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { documentId: string };
    return createSnapshot(store, { documentId: params.documentId, actorId: user.id, reason: 'significant_change' });
  });

  app.post('/api/snapshots/:snapshotId/restore', async (request) => {
    const user = getCurrentUser(request);
    const params = request.params as { snapshotId: string };
    return restoreSnapshot(store, { snapshotId: params.snapshotId, actorId: user.id });
  });
}
