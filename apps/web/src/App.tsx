import { createRoot } from 'react-dom/client';
import { DocumentPage } from './pages/DocumentPage';
import { HomePage } from './pages/HomePage';
import { PublicPreviewPage } from './pages/PublicPreviewPage';
import './styles.css';

function App() {
  const path = window.location.pathname;
  const documentMatch = path.match(/^\/documents\/([^/]+)$/);
  const publicMatch = path.match(/^\/public\/([^/]+)$/);

  if (documentMatch) return <DocumentPage documentId={documentMatch[1]} />;
  if (publicMatch) return <PublicPreviewPage token={publicMatch[1]} />;
  return <HomePage />;
}

createRoot(document.getElementById('root')!).render(<App />);
