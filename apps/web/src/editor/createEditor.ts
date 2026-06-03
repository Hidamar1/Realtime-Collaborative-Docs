import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as Y from 'yjs';
import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { collaborativeDocSchema } from './schema';

export function createInitialYDocText(doc: Y.Doc, field: string, text: string) {
  const sharedText = doc.getText(field);
  if (sharedText.length === 0) {
    sharedText.insert(0, text);
  }
  return sharedText;
}

export function mountEditor(element: HTMLElement, ydoc: Y.Doc, provider: { awareness: Parameters<typeof yCursorPlugin>[0] }) {
  const sharedType = ydoc.getXmlFragment('prosemirror');
  const state = EditorState.create({
    schema: collaborativeDocSchema,
    plugins: [
      ySyncPlugin(sharedType),
      yCursorPlugin(provider.awareness),
      yUndoPlugin()
    ]
  });

  return new EditorView(element, { state });
}
