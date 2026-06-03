import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const variantClass = {
    primary: styles['button--primary'],
    ghost: styles['button--ghost'],
    danger: styles['button--danger']
  }[variant];

  return (
    <button
      className={`${styles.button} ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
