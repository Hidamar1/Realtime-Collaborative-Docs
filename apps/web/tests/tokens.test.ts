import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('design tokens', () => {
  // 直接读 CSS 源码验证关键变量存在（不依赖浏览器渲染）
  const css = readFileSync(
    resolve(__dirname, '../src/styles/tokens.css'),
    'utf-8'
  );

  test('defines dark mode background tokens', () => {
    expect(css).toContain('--color-bg-primary');
    expect(css).toContain('--color-bg-secondary');
    expect(css).toContain('--color-bg-tertiary');
  });

  test('defines text color tokens', () => {
    expect(css).toContain('--color-text-primary');
    expect(css).toContain('--color-text-secondary');
    expect(css).toContain('--color-text-tertiary');
  });

  test('defines accent color', () => {
    expect(css).toContain('--color-accent');
    expect(css).toContain('--color-accent-hover');
  });

  test('defines semantic color tokens', () => {
    expect(css).toContain('--color-success');
    expect(css).toContain('--color-warning');
    expect(css).toContain('--color-danger');
    expect(css).toContain('--color-info');
  });

  test('defines cursor colors (5 distinct)', () => {
    expect(css).toContain('--cursor-1');
    expect(css).toContain('--cursor-2');
    expect(css).toContain('--cursor-3');
    expect(css).toContain('--cursor-4');
    expect(css).toContain('--cursor-5');
  });

  test('defines light theme overrides', () => {
    expect(css).toContain('[data-theme="light"]');
  });

  test('defines font tokens', () => {
    expect(css).toContain('--font-sans');
    expect(css).toContain('--font-mono');
    expect(css).toContain('--text-base');
    expect(css).toContain('--leading-editor');
  });

  test('defines spacing tokens', () => {
    expect(css).toContain('--space-4');
    expect(css).toContain('--space-8');
  });

  test('defines animation and z-index tokens', () => {
    expect(css).toContain('--duration-normal');
    expect(css).toContain('--easing-default');
    expect(css).toContain('--z-sticky');
    expect(css).toContain('--z-modal');
    expect(css).toContain('--opacity-disabled');
    expect(css).toContain('--bp-tablet');
  });

  test('uses @layer tokens', () => {
    expect(css).toContain('@layer tokens');
  });
});
