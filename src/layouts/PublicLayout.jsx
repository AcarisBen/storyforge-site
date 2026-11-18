import { useState } from 'react';
import PublicFooter from '../components/footers/PublicFooter';
import PoliticaPrivacidadeModal from '../components/PoliticaPrivacidadeModal';
import TermosDeUsoModal from '../components/TermosDeUsoModal';

export default function PublicLayout({
  children,
  onNavigateToLogin,
  onNavigateToRegister,
}) {
  const [openDocument, setOpenDocument] = useState(null);

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">
        {children}
      </main>
      <PublicFooter
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToRegister={onNavigateToRegister}
        onOpenPrivacy={() => setOpenDocument('privacy')}
        onOpenTerms={() => setOpenDocument('terms')}
      />
      <PoliticaPrivacidadeModal
        isOpen={openDocument === 'privacy'}
        onClose={() => setOpenDocument(null)}
      />
      <TermosDeUsoModal
        isOpen={openDocument === 'terms'}
        onClose={() => setOpenDocument(null)}
      />
    </div>
  );
}
