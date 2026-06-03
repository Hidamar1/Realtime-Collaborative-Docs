import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Badge.module.css';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
