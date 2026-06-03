import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SaveStatus } from '../src/components/SaveStatus/SaveStatus';

describe('SaveStatus', () => {
  test('renders saved state', () => {
    render(<SaveStatus status="saved" />);
    expect(screen.getByText('已保存')).toBeDefined();
  });

  test('renders saving state', () => {
    render(<SaveStatus status="saving" />);
    expect(screen.getByText('保存中')).toBeDefined();
  });

  test('renders offline state with icon', () => {
    render(<SaveStatus status="offline" />);
    expect(screen.getByText('离线')).toBeDefined();
    // 离线状态有感叹号辅助图标（色盲友好）
    const icon = screen.getByText('!');
    expect(icon).toBeDefined();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
