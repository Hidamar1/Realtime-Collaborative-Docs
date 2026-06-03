import { describe, expect, test } from 'vitest';
import * as Y from 'yjs';
import { createInitialYDocText } from '../src/editor/createEditor';

describe('createInitialYDocText', () => {
  test('creates editable shared text with initial content', () => {
    const doc = new Y.Doc();
    createInitialYDocText(doc, 'body', '课程报告');
    expect(doc.getText('body').toString()).toBe('课程报告');
  });
});
