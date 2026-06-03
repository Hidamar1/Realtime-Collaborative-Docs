import styles from './AvatarGroup.module.css';

interface User {
  id: string;
  name: string;
  color: string;
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
}

function getInitial(name: string): string {
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase();
}

export function AvatarGroup({ users, max = 5 }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={styles.group} aria-label={`${users.length} 位协作者在线`}>
      {visible.map((user) => (
        <span
          key={user.id}
          className={styles.avatar}
          style={{ background: user.color }}
          title={user.name}
        >
          {getInitial(user.name)}
        </span>
      ))}
      {overflow > 0 && (
        <span className={styles.overflow}>+{overflow}</span>
      )}
    </div>
  );
}
