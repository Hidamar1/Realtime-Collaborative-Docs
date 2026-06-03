import { useEffect, useRef, useState } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { apiGet, apiPost } from '../api/client';
import { mountEditor } from '../editor/createEditor';
import { Button } from '../components/Button/Button';
import { AvatarGroup } from '../components/AvatarGroup/AvatarGroup';
import { SaveStatus } from '../components/SaveStatus/SaveStatus';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import type { SaveStatusType } from '../components/SaveStatus/SaveStatus';

const DEMO_USERS = [
  { id: 'user-a', name: '用户 A', color: '#f59e0b' },
  { id: 'user-b', name: '用户 B', color: '#06b6d4' },
];

export function DocumentPage({ documentId }: { documentId: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [documentTitle, setDocumentTitle] = useState('加载中');
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatusType>('saving');

  useEffect(() => {
    apiGet<{ document: { title: string } }>(`/api/documents/${documentId}`)
      .then((data) => setDocumentTitle(data.document.title))
      .catch(() => setDocumentTitle('文档加载失败'));
  }, [documentId]);

  useEffect(() => {
    if (!editorRef.current) return;
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      'ws://127.0.0.1:3000',
      `documents/${documentId}`,
      ydoc,
      { params: { userId: 'user-a' } }
    );
    provider.on('status', (event: { status: string }) => {
      setStatus(event.status === 'connected' ? 'saved' : 'saving');
    });
    const view = mountEditor(editorRef.current, ydoc, provider);

    return () => {
      view.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [documentId]);

  async function enableShare() {
    const link = await apiPost<{ token: string }>(
      `/api/documents/${documentId}/share`,
      {}
    );
    setShareToken(link.token);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <header className="cd-toolbar">
        <div className="cd-toolbar__left">
          <h1 style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-semibold)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {documentTitle}
          </h1>
          <SaveStatus status={status} />
        </div>
        <div className="cd-toolbar__right">
          <AvatarGroup users={DEMO_USERS} />
          <Button variant="ghost" onClick={enableShare}>分享</Button>
          <ThemeToggle />
        </div>
      </header>

      {/* 公开预览链接 */}
      {shareToken && (
        <div style={{
          padding: 'var(--space-2) var(--space-5)',
          background: 'var(--color-accent-muted)',
          borderBottom: '1px solid var(--color-border)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)'
        }}>
          公开预览：/public/{shareToken}
        </div>
      )}

      {/* 编辑器区域 */}
      <main style={{ flex: 1, padding: 'var(--space-8) var(--space-6)' }}>
        <div className="cd-editor-container">
          <section
            ref={editorRef}
            data-testid="editor-shell"
            style={{
              minHeight: 360,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8) var(--space-10)',
              background: 'var(--color-bg-primary)'
            }}
          />
        </div>
      </main>
    </div>
  );
}
