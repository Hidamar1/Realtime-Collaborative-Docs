import { describe, expect, test } from 'vitest';
import { createMemoryStore } from '../src/repositories/memoryStore';
import { createDocumentFromTemplate, createEmptyDocument } from '../src/domain/documentService';

describe('documentService', () => {
  test('creates an empty document and assigns owner role', () => {
    const store = createMemoryStore();

    const document = createEmptyDocument(store, {
      title: '课程报告',
      ownerId: 'user-a'
    });

    expect(document.title).toBe('课程报告');
    expect(document.ownerId).toBe('user-a');
    expect(document.visibility).toBe('private');
    expect(store.members.get(`${document.id}:user-a`)?.role).toBe('owner');
    expect(store.contents.get(document.id)?.contentState).toEqual({ type: 'doc', content: [] });
  });

  test('copies system template content into a new owner document', () => {
    const store = createMemoryStore();
    const template = store.templates.find((item) => item.title === '课程小组报告');

    const document = createDocumentFromTemplate(store, {
      templateId: template!.id,
      ownerId: 'user-a'
    });

    expect(document.title).toBe('课程小组报告');
    expect(store.members.get(`${document.id}:user-a`)?.role).toBe('owner');
    expect(store.contents.get(document.id)?.contentState).toEqual(template!.contentState);
  });
});
