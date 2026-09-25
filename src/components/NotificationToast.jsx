// src/components/NotificationToast.jsx
import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const TYPES = {
  success: {
    icon: CheckCircle2,
    border: 'border-emerald-500/50',
    bg: 'bg-[#111c16]',
    text: 'text-emerald-300',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-500/50',
    bg: 'bg-[#1c1811]',
    text: 'text-amber-300',
  },
  error: {
    icon: XCircle,
    border: 'border-red-500/50',
    bg: 'bg-[#1c1113]',
    text: 'text-red-300',
  },
  info: {
    icon: Info,
    border: 'border-purple-500/50',
    bg: 'bg-[#16111c]',
    text: 'text-purple-300',
  },
};

export default function NotificationToast({ type = 'info', title, message, onClose, duration = 4000 }) {
  const config = TYPES[type] || TYPES.info;
  const IconComponent = config.icon;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md max-w-sm transition-all duration-300 animate-slide-up ${config.bg} ${config.border}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.text}`} />
      
      <div className="flex-1 space-y-1">
        {title && <h4 className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>{title}</h4>}
        <p className="text-xs text-gray-200 leading-relaxed">{message}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg"
      >
        <X size={14} />
      </button>
    </div>
  );
}