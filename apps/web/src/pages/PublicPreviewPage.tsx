import { useEffect, useState } from 'react';

export function PublicPreviewPage({ token }: { token: string }) {
  const [title, setTitle] = useState('加载中');

  useEffect(() => {
    fetch(`http://127.0.0.1:3000/api/public/${token}`)
      .then((response) => {
        if (!response.ok) throw new Error('公开链接已失效');
        return response.json();
      })
      .then((data) => setTitle(data.document.title))
      .catch(() => setTitle('公开链接已失效'));
  }, [token]);

  return (
    <main className="page">
      <p className="badge">公开只读预览</p>
      <h1>{title}</h1>
      <p>登录后可申请加入协作编辑。</p>
    </main>
  );
}
