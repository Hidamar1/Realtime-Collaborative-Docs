import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

interface TemplateRecord {
  id: string;
  title: string;
  description: string;
}

export function HomePage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);

  useEffect(() => {
    apiGet<TemplateRecord[]>('/api/templates').then(setTemplates).catch(console.error);
  }, []);

  async function createFromTemplate(templateId: string) {
    const document = await apiPost<{ id: string }>('/api/documents/from-template', { templateId });
    window.location.href = `/documents/${document.id}`;
  }

  return (
    <main className="page">
      <h1>实时协作文档</h1>
      <p>从教育与轻项目模板开始协作。</p>
      <section className="cards" aria-label="文档模板">
        {templates.map((template) => (
          <button className="card" type="button" key={template.id} onClick={() => createFromTemplate(template.id)}>
            <strong>{template.title}</strong>
            <span>{template.description}</span>
          </button>
        ))}
      </section>
    </main>
  );
}
