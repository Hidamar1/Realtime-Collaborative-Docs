import { describe, expect, test } from 'vitest';
import * as Y from 'yjs';
import { createDocumentRoom } from '../src/realtime/documentRoom';

describe('documentRoom', () => {
  test('applies Yjs updates and stores latest collaboration state', () => {
    const room = createDocumentRoom('doc-1');
    const clientDoc = new Y.Doc();
    clientDoc.getText('body').insert(0, 'hello');
    const update = Y.encodeStateAsUpdate(clientDoc);

    room.applyUpdate(update, 'user-a');

    const syncedDoc = new Y.Doc();
    Y.applyUpdate(syncedDoc, room.encodeState());
    expect(syncedDoc.getText('body').toString()).toBe('hello');
  });
});
