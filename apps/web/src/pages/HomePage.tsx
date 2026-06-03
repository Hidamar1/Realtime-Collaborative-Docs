import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import { TemplateCard } from '../components/Card/TemplateCard';
import { Button } from '../components/Button/Button';

interface TemplateRecord {
  id: string;
  title: string;
  description: string;
}

export function HomePage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);

  useEffect(() => {
    apiGet<TemplateRecord[]>('/api/templates')
      .then(setTemplates)
      .catch(console.error);
  }, []);

  async function createFromTemplate(templateId: string) {
    const document = await apiPost<{ id: string }>(
      '/api/documents/from-template',
      { templateId }
    );
    window.location.href = `/documents/${document.id}`;
  }

  async function createBlank() {
    const document = await apiPost<{ id: string }>('/api/documents', {
      title: '未命名文档'
    });
    window.location.href = `/documents/${document.id}`;
  }

  return (
    <main className="cd-page">
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ marginTop: 0 }}>创建新文档</h1>
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)'
        }}>
          从教育与轻项目模板开始，或创建空白文档。
        </p>
      </header>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Button onClick={createBlank}>+ 空白文档</Button>
      </div>

      <section>
        <h2 style={{
          fontSize: 'var(--text-lg)',
          marginBottom: 'var(--space-4)'
        }}>
          模板
        </h2>
        <div className="cd-card-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              id={template.id}
              title={template.title}
              description={template.description}
              onClick={createFromTemplate}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
