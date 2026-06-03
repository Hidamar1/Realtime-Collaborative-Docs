import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../src/components/Button/Button';

describe('Button', () => {
  test('renders primary button by default', () => {
    render(<Button>提交</Button>);
    const btn = screen.getByRole('button', { name: '提交' });
    expect(btn.className).toContain('button--primary');
  });

  test('renders ghost variant', () => {
    render(<Button variant="ghost">取消</Button>);
    const btn = screen.getByRole('button', { name: '取消' });
    expect(btn.className).toContain('button--ghost');
  });

  test('renders danger variant', () => {
    render(<Button variant="danger">删除</Button>);
    const btn = screen.getByRole('button', { name: '删除' });
    expect(btn.className).toContain('button--danger');
  });

  test('applies disabled state', () => {
    render(<Button disabled>提交</Button>);
    const btn = screen.getByRole('button', { name: '提交' });
    expect(btn).toBeDisabled();
  });
});
