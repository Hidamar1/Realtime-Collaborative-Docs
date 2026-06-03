import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: number;
}

export function LoadingSpinner({ size = 20 }: LoadingSpinnerProps) {
  return (
    <span
      className={styles.spinner}
      role="status"
      aria-label="加载中"
      style={{ width: size, height: size }}
    />
  );
}
