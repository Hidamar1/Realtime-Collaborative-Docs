import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarGroup } from '../src/components/AvatarGroup/AvatarGroup';

describe('AvatarGroup', () => {
  const users = [
    { id: 'user-a', name: '用户 A', color: '#f59e0b' },
    { id: 'user-b', name: '用户 B', color: '#06b6d4' },
  ];

  test('renders avatars for each user', () => {
    render(<AvatarGroup users={users} />);
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
  });

  test('shows overflow count when more than 5 users', () => {
    const six = [
      ...users,
      { id: 'c', name: '用户 C', color: '#ec4899' },
      { id: 'd', name: '用户 D', color: '#22c55e' },
      { id: 'e', name: '用户 E', color: '#a78bfa' },
      { id: 'f', name: '用户 F', color: '#f59e0b' },
    ];
    render(<AvatarGroup users={six} />);
    expect(screen.getByText('+1')).toBeDefined();
  });
});
