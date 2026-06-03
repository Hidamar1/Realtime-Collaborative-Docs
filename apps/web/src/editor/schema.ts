import type { Node as ProseMirrorNode, NodeSpec } from 'prosemirror-model';
import { Schema } from 'prosemirror-model';

const nodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },
  text: { group: 'inline' },
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM: () => ['p', 0]
  },
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } }
    ],
    toDOM: (node: ProseMirrorNode) => [`h${node.attrs.level}`, 0]
  },
  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM: () => ['ul', 0]
  },
  list_item: {
    content: 'paragraph block*',
    parseDOM: [{ tag: 'li' }],
    toDOM: () => ['li', 0]
  },
  task_item: {
    attrs: { checked: { default: false } },
    content: 'paragraph block*',
    group: 'block',
    parseDOM: [{ tag: 'li[data-task-item]' }],
    toDOM: (node: ProseMirrorNode) => ['li', { 'data-task-item': 'true', 'data-checked': String(node.attrs.checked) }, 0]
  }
};

export const collaborativeDocSchema = new Schema({
  nodes,
  marks: {
    strong: {
      parseDOM: [{ tag: 'strong' }, { style: 'font-weight=bold' }],
      toDOM: () => ['strong', 0]
    },
    em: {
      parseDOM: [{ tag: 'em' }, { style: 'font-style=italic' }],
      toDOM: () => ['em', 0]
    },
    link: {
      attrs: { href: {} },
      inclusive: false,
      parseDOM: [{ tag: 'a[href]', getAttrs: (dom) => ({ href: (dom as HTMLElement).getAttribute('href') }) }],
      toDOM: (node) => ['a', { href: node.attrs.href, rel: 'noopener noreferrer' }, 0]
    }
  }
});
