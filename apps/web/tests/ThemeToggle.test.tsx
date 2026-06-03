import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { ThemeToggle } from '../src/components/ThemeToggle/ThemeToggle';

describe('ThemeToggle', () => {
  test('renders with aria-label', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toBeTruthy();
  });

  test('toggles theme on click', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.clear();
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    act(() => {
      btn.click();
    });
    // React state update is sync in test, verify aria-pressed
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
