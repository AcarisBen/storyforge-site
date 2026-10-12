import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, Lightbulb, Send, X } from 'lucide-react';
import apiClient from '../api/apiClient';

const IDEA_CATEGORIES = [
  'Escrita e edição',
  'Organização de projetos',
  'Personagens e mundo',
  'Exportação e compartilhamento',
  'Acessibilidade',
  'Outra melhoria',
];

export default function SuggestIdeaModal({ isOpen, onClose, currentUser }) {
  const [category, setCategory] = useState(IDEA_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [benefit, setBenefit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setCategory(IDEA_CATEGORIES[0]);
    setTitle('');
    setDescription('');
    setBenefit('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Preencha o título e descreva a melhoria que gostaria de ver.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/support/suggest-idea', {
        category,
        title: title.trim(),
        description: description.trim(),
        benefit: benefit.trim(),
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
      });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível enviar a sugestão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggest-idea-title"
        className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#171724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-300">
              <Lightbulb size={18} />
            </div>
            <div>
              <h2 id="suggest-idea-title" className="text-sm font-bold text-white">Sugerir Ideia</h2>
              <p className="text-[11px] text-gray-400">Compartilhe uma melhoria para o StoryForge</p>
            </div>
          </div>
          <button type="button" onClick={resetAndClose} aria-label="Fechar" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl">
            <X size={18} />
          </button>
        </header>

        <div className="p-5 overflow-y-auto flex-1">
          {success ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 size={40} className="text-emerald-400 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">Sugestão enviada</h3>
                <p className="text-xs text-gray-400 mt-2">Obrigado por ajudar a construir o StoryForge. Sua ideia foi encaminhada à equipe.</p>
              </div>
              <button type="button" onClick={resetAndClose} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl">
                Voltar às configurações
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div role="alert" className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="idea-category" className="text-xs font-bold text-gray-300">Categoria</label>
                <select id="idea-category" value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-[#171724] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500">
                  {IDEA_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="idea-title" className="text-xs font-bold text-gray-300">Título da ideia *</label>
                <input id="idea-title" required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Atalhos de teclado no editor" className="w-full bg-[#171724] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="idea-description" className="text-xs font-bold text-gray-300">Como funcionaria? *</label>
                <textarea id="idea-description" required maxLength={6000} rows={5} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descreva a melhoria e como você imagina usá-la..." className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-y" />
                <p className="text-[10px] text-gray-500 text-right">{description.length}/6000</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="idea-benefit" className="text-xs font-bold text-gray-300">Que diferença faria no seu fluxo? <span className="font-normal text-gray-500">Opcional</span></label>
                <textarea id="idea-benefit" maxLength={2000} rows={2} value={benefit} onChange={(event) => setBenefit(event.target.value)} placeholder="Conte qual problema ajudaria a resolver." className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-y" />
              </div>

              <button type="submit" disabled={loading} className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                <Send size={15} />
                {loading ? 'Enviando sugestão...' : 'Enviar sugestão'}
              </button>
            </form>
          )}
        </div>
        <p className="px-5 pb-4 text-[10px] text-gray-500">Enviado por {currentUser?.writerName || currentUser?.fullName || 'sua conta'} à equipe StoryForge.</p>
      </section>
    </div>,
    document.body,
  );
}
