import { useEffect, useRef, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { apiGet, apiPost } from '../api/client';
import { mountEditor } from '../editor/createEditor';

export function DocumentPage({ documentId }: { documentId: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [documentTitle, setDocumentTitle] = useState('加载中');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [status, setStatus] = useState('连接中');

  useEffect(() => {
    apiGet<{ document: { title: string } }>(`/api/documents/${documentId}`)
      .then((data) => setDocumentTitle(data.document.title))
      .catch(() => setDocumentTitle('文档加载失败'));
  }, [documentId]);

  useEffect(() => {
    if (!editorRef.current) return;
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider('ws://127.0.0.1:3000', `documents/${documentId}`, ydoc, {
      params: { userId: 'user-a' }
    });
    provider.on('status', (event: { status: string }) => setStatus(event.status === 'connected' ? '已连接' : '连接中'));
    const view = mountEditor(editorRef.current, ydoc, provider);

    return () => {
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  async function enableShare() {
    const link = await apiPost<{ token: string }>(`/api/documents/${documentId}/share`, {});
    setShareToken(link.token);
  }

  return (
    <main className="page">
      <header className="toolbar">
        <div>
          <h1>{documentTitle}</h1>
          <p>协同状态：{status}</p>
        </div>
        <button type="button" onClick={enableShare}>开启公开预览</button>
      </header>
      {shareToken ? <p>公开预览：/public/{shareToken}</p> : null}
      <section className="editor-shell" ref={editorRef} data-testid="editor-shell" />
    </main>
  );
}
