import styles from './TemplateCard.module.css';

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  onClick: (id: string) => void;
}

const icons: Record<string, string> = {
  '课程小组报告': '📋',
  '会议纪要': '📝',
  '项目计划': '📊',
  '需求文档': '📄',
  '周报': '📈',
  '实验室周报': '🔬',
  '课题计划': '🎯',
  '作业批注模板': '✏️',
};

function getIcon(title: string): string {
  return icons[title] ?? '📄';
}

export function TemplateCard({ id, title, description, onClick }: TemplateCardProps) {
  return (
    <button
      className={styles.card}
      type="button"
      onClick={() => onClick(id)}
    >
      <span className={styles.icon} aria-hidden="true">{getIcon(title)}</span>
      <strong className={styles.title}>{title}</strong>
      <span className={styles.description}>{description}</span>
    </button>
  );
}
