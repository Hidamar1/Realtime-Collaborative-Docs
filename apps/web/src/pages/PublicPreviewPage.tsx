import { useEffect, useState } from 'react';
import { Badge } from '../components/Badge/Badge';
import { Button } from '../components/Button/Button';

export function PublicPreviewPage({ token }: { token: string }) {
  const [title, setTitle] = useState('加载中');
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:3000/api/public/${token}`)
      .then((response) => {
        if (!response.ok) throw new Error('公开链接已失效');
        return response.json();
      })
      .then((data) => {
        setTitle(data.document.title);
        setContent(JSON.stringify(data.content, null, 2));
      })
      .catch(() => setTitle('公开链接已失效'));
  }, [token]);

  if (title === '加载中') {
    return (
      <main className="cd-page">
        <p style={{ color: 'var(--color-text-secondary)' }}>加载中...</p>
      </main>
    );
  }

  if (title === '公开链接已失效') {
    return (
      <main className="cd-page">
        <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
          <Badge>链接已失效</Badge>
          <h1 style={{ marginTop: 'var(--space-4)' }}>此公开链接已失效</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            文档已被设为私有，或分享链接已被关闭。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="cd-page">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Badge>🔗 公开只读预览</Badge>
      </div>

      <div style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8) var(--space-10)',
        background: 'var(--color-bg-primary)',
        maxWidth: 'min(800px, calc(100vw - 2rem))',
        margin: '0 auto'
      }}>
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        {content && (
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            whiteSpace: 'pre-wrap'
          }}>
            {content}
          </pre>
        )}
      </div>

      <div
        className="cd-cta-banner"
        style={{ maxWidth: 'min(800px, calc(100vw - 2rem))', margin: 'var(--space-6) auto 0' }}
      >
        <div className="cd-cta-banner__text">
          <strong>想参与编辑？</strong>
          <br />
          注册或登录后即可申请加入协作。
        </div>
        <Button>登录 / 注册</Button>
      </div>
    </main>
  );
}
