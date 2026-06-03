import styles from './SaveStatus.module.css';

export type SaveStatusType = 'saved' | 'saving' | 'offline';

interface SaveStatusProps {
  status: SaveStatusType;
}

const labels: Record<SaveStatusType, string> = {
  saved: '已保存',
  saving: '保存中',
  offline: '离线'
};

export function SaveStatus({ status }: SaveStatusProps) {
  return (
    <span className={`${styles.status} ${styles[status]}`}>
      {status === 'offline' ? (
        <span className={styles.offlineIcon} aria-hidden="true">!</span>
      ) : (
        <span className={styles.dot} aria-hidden="true" />
      )}
      {labels[status]}
    </span>
  );
}
