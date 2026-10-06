// src/components/CookieConsentBanner.jsx
// Banner Unificado de Consentimento de Cookies, Analytics (PostHog) e Preferências

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { usePostHog } from '@posthog/react';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const posthog = usePostHog();

  // Reavalia a exibição com base na sessão atual
  const checkBannerStatus = () => {
    const dismissedInSession = sessionStorage.getItem('cookie_banner_dismissed');
    if (!dismissedInSession) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  };

  useEffect(() => {
    checkBannerStatus();

    window.addEventListener('cookie_pref_updated', checkBannerStatus);
    window.addEventListener('storage', checkBannerStatus);

    return () => {
      window.removeEventListener('cookie_pref_updated', checkBannerStatus);
      window.removeEventListener('storage', checkBannerStatus);
    };
  }, []);

  // Aceite Total: ativa Analytics no PostHog, salva preferências e atualiza as Configurações
  const handleAccept = () => {
    const allEnabled = { essential: true, preferences: true, analytics: true };

    localStorage.setItem('cookie_consent', 'granted');
    localStorage.setItem('storyforge_cookie_pref', JSON.stringify(allEnabled));
    sessionStorage.setItem('cookie_banner_dismissed', 'true');

    if (posthog) {
      posthog.opt_in_capturing();
    }

    window.dispatchEvent(new Event('cookie_pref_updated'));
    setShowBanner(false);
  };

  // Apenas Essenciais: desativa Analytics no PostHog, desativa preferências secundárias
  const handleDecline = () => {
    const essentialOnly = { essential: true, preferences: false, analytics: false };

    localStorage.setItem('cookie_consent', 'essential');
    localStorage.setItem('storyforge_cookie_pref', JSON.stringify(essentialOnly));
    sessionStorage.setItem('cookie_banner_dismissed', 'true');

    if (posthog) {
      posthog.opt_out_capturing();
    }

    window.dispatchEvent(new Event('cookie_pref_updated'));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg bg-[#14141f]/95 border border-purple-900/60 backdrop-blur-md text-gray-200 p-5 rounded-2xl shadow-2xl z-[999] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Cookie size={18} className="text-amber-400 shrink-0" />
          <span>Privacidade & Analytics</span>
        </div>
        <button
          type="button"
          onClick={handleDecline}
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Fechar e manter apenas essenciais"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        Usamos cookies e scripts de análise para entender o uso da plataforma e melhorar a experiência do usuário. O conteúdo da sua escrita <b>não</b> é coletado nem compartilhado com terceiros. Você pode alterar as preferências de consentimento a qualquer momento nas configurações da sua conta.
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleAccept}
          className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
        >
          <ShieldCheck size={14} /> Aceitar Todos
        </button>
        <button
          type="button"
          onClick={handleDecline}
          className="py-2 px-3 bg-[#1e1e2d] hover:bg-[#26263a] text-gray-300 font-bold text-xs rounded-xl border border-gray-700 transition-all cursor-pointer"
        >
          Apenas Essenciais
        </button>
      </div>
    </div>
  );
}