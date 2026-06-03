import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../src/components/Badge/Badge';

describe('Badge', () => {
  test('renders with text', () => {
    render(<Badge>公开预览</Badge>);
    expect(screen.getByText('公开预览')).toBeDefined();
  });
});
