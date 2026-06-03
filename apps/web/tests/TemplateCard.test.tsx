import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemplateCard } from '../src/components/Card/TemplateCard';

describe('TemplateCard', () => {
  test('renders title and description', () => {
    render(
      <TemplateCard
        id="t1"
        title="课程报告"
        description="课程项目协作报告"
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText('课程报告')).toBeDefined();
    expect(screen.getByText('课程项目协作报告')).toBeDefined();
  });

  test('calls onClick with id when clicked', () => {
    const onClick = vi.fn();
    render(
      <TemplateCard id="t1" title="报告" description="描述" onClick={onClick} />
    );
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledWith('t1');
  });
});
