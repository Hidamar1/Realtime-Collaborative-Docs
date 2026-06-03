import * as Y from 'yjs';

export interface AwarenessState {
  userId: string;
  cursor?: unknown;
  selection?: unknown;
  color: string;
  lastSeenAt: string;
}

export function createDocumentRoom(documentId: string) {
  const doc = new Y.Doc();
  const awareness = new Map<string, AwarenessState>();

  return {
    documentId,
    applyUpdate(update: Uint8Array, userId: string) {
      Y.applyUpdate(doc, update);
      awareness.set(userId, {
        userId,
        color: colorForUser(userId),
        lastSeenAt: new Date().toISOString()
      });
    },
    encodeState() {
      return Y.encodeStateAsUpdate(doc);
    },
    setPresence(userId: string, state: Omit<AwarenessState, 'userId' | 'lastSeenAt'>) {
      awareness.set(userId, { userId, ...state, lastSeenAt: new Date().toISOString() });
    },
    removePresence(userId: string) {
      awareness.delete(userId);
    },
    listPresence() {
      return [...awareness.values()];
    }
  };
}

function colorForUser(userId: string): string {
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
  const index = [...userId].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
