import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../src/components/Modal/Modal';

describe('Modal', () => {
  test('renders children when open', () => {
    render(
      <Modal open onClose={() => {}} title="分享文档">
        <p>分享内容</p>
      </Modal>
    );
    expect(screen.getByText('分享文档')).toBeDefined();
    expect(screen.getByText('分享内容')).toBeDefined();
  });

  test('does not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="分享文档">
        <p>分享内容</p>
      </Modal>
    );
    expect(screen.queryByText('分享文档')).toBeNull();
  });
});
