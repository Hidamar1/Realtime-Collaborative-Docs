import type { FastifyInstance } from 'fastify';
import * as WebSocket from 'ws';
import { createDocumentRoom } from './documentRoom';
import type { MemoryStore } from '../repositories/memoryStore';

const rooms = new Map<string, ReturnType<typeof createDocumentRoom>>();

export function getRoom(documentId: string) {
  let room = rooms.get(documentId);
  if (!room) {
    room = createDocumentRoom(documentId);
    rooms.set(documentId, room);
  }
  return room;
}

export async function registerCollaborationRoutes(app: FastifyInstance, store: MemoryStore) {
  app.get('/documents/:documentId', { websocket: true }, (socket, request) => {
    const params = request.params as { documentId: string };
    const query = request.query as { userId?: string };
    const userId = query.userId ?? String(request.headers['x-user-id'] ?? '');
    const member = store.members.get(`${params.documentId}:${userId}`);

    if (!member) {
      socket.close(1008, 'Permission denied');
      return;
    }

    const room = getRoom(params.documentId);
    room.setPresence(userId, {
      color: colorForUser(userId),
      cursor: undefined,
      selection: undefined
    });
    socket.send(room.encodeState());

    socket.on('message', (message) => {
      if (member.role === 'viewer') {
        socket.send(JSON.stringify({ type: 'error', reason: 'Viewer cannot edit' }));
        return;
      }

      const update = toUint8Array(message);
      try {
        room.applyUpdate(update, userId);
      } catch {
        socket.send(JSON.stringify({ type: 'error', reason: 'Invalid Yjs update' }));
        return;
      }
      for (const client of app.websocketServer.clients) {
        if (client !== socket && client.readyState === client.OPEN) {
          client.send(update);
        }
      }
    });

    socket.on('close', () => {
      room.removePresence(userId);
    });
  });
}

function toUint8Array(message: WebSocket.RawData): Uint8Array {
  if (message instanceof Uint8Array) {
    return message;
  }
  if (Array.isArray(message)) {
    const totalLength = message.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of message) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    return combined;
  }
  if (Buffer.isBuffer(message)) {
    return new Uint8Array(message);
  }
  return new Uint8Array(message);
}

function colorForUser(userId: string): string {
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
  const index = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
