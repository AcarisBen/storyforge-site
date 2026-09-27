// src/components/NotificationToast.jsx
// Componente de notificações flutuantes (Toasts) para o StoryForge

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toasts, toast, onClose, removeToast }) {
  const activeClose = removeToast || onClose || (() => {});
  const toastList = toasts || (toast ? [toast] : []);

  if (!toastList || toastList.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toastList.map((t) => {
        const id = t.id;
        const type = t.type || 'info';

        let icon = <Info className="text-purple-400 shrink-0" size={20} />;
        let borderColor = 'border-purple-800/60';
        let bgColor = 'bg-[#15121c]';
        let titleColor = 'text-purple-300';

        if (type === 'success') {
          icon = <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />;
          borderColor = 'border-emerald-800/60';
          bgColor = 'bg-[#101915]';
          titleColor = 'text-emerald-300';
        } else if (type === 'error') {
          icon = <AlertCircle className="text-red-400 shrink-0" size={20} />;
          borderColor = 'border-red-800/60';
          bgColor = 'bg-[#1c1214]';
          titleColor = 'text-red-300';
        } else if (type === 'warning') {
          icon = <AlertTriangle className="text-amber-400 shrink-0" size={20} />;
          borderColor = 'border-amber-800/60';
          bgColor = 'bg-[#1c1812]';
          titleColor = 'text-amber-300';
        }

        return (
          <div
            key={id || Math.random()}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderColor} ${bgColor} shadow-2xl backdrop-blur-md w-full transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {t.title && <h4 className={`text-xs font-bold ${titleColor} mb-0.5`}>{t.title}</h4>}
              {t.message && <p className="text-xs text-gray-300 leading-relaxed">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => activeClose(id)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0 p-0.5"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}