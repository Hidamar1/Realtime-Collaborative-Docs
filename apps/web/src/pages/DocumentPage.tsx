import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

export function DocumentPage({ documentId }: { documentId: string }) {
  const [documentTitle, setDocumentTitle] = useState('加载中');
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ document: { title: string } }>(`/api/documents/${documentId}`)
      .then((data) => setDocumentTitle(data.document.title))
      .catch(() => setDocumentTitle('文档加载失败'));
  }, [documentId]);

  async function enableShare() {
    const link = await apiPost<{ token: string }>(`/api/documents/${documentId}/share`, {});
    setShareToken(link.token);
  }

  return (
    <main className="page">
      <header className="toolbar">
        <h1>{documentTitle}</h1>
        <button type="button" onClick={enableShare}>开启公开预览</button>
      </header>
      {shareToken ? <p>公开预览：/public/{shareToken}</p> : null}
      <section className="editor-shell" data-testid="editor-shell">
        <p>ProseMirror + Yjs 编辑器将在任务 8 接入。</p>
      </section>
    </main>
  );
}
