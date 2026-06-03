import { describe, expect, test } from 'vitest';
import { collaborativeDocSchema } from '../src/editor/schema';

describe('collaborativeDocSchema', () => {
  test('supports required MVP nodes and marks', () => {
    expect(collaborativeDocSchema.nodes.paragraph).toBeDefined();
    expect(collaborativeDocSchema.nodes.heading).toBeDefined();
    expect(collaborativeDocSchema.nodes.bullet_list).toBeDefined();
    expect(collaborativeDocSchema.nodes.task_item).toBeDefined();
    expect(collaborativeDocSchema.marks.strong).toBeDefined();
    expect(collaborativeDocSchema.marks.em).toBeDefined();
    expect(collaborativeDocSchema.marks.link).toBeDefined();
  });
});
