// src/components/ReportBugModal.jsx
// Modal para envio de relatório de bugs com diagnóstico automático e segurança no anexo de imagens.

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Bug, X, Send, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/apiClient';

const MODULE_OPTIONS = [
  'Geral / Navegação',
  'Dashboard / Visão Geral',
  'Identidade & Essência',
  'Engenharia Narrativa',
  'Estrutura Dramática & Timeline',
  'Personagens & Fichas',
  'Mundo & Lore',
  'Cenas & Diálogos',
  'Escrita & Editor',
  'Exportação PDF / JSON (Story Bible)',
  'Login / Minha Conta',
  'Outro'
];

const BUG_TYPES = [
  'Algo não está salvando / Perda de dados',
  'Tela travou / Ficou em branco',
  'Botão não responde ao clique',
  'Erro visual / Layout quebrado',
  'Mensagem de erro exibida na tela',
  'Outro problema'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function ReportBugModal({ isOpen, onClose, currentUser }) {
  const userEmail = currentUser?.email || '';
  const [module, setModule] = useState(MODULE_OPTIONS[0]);
  const [bugType, setBugType] = useState(BUG_TYPES[0]);
  const [description, setDescription] = useState('');
  
  // Anexo de Imagem
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Envie apenas imagens (.png, .jpg, .jpeg, .webp).');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('A imagem é muito grande. O limite máximo é de 5 MB.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Por favor, descreva o que aconteceu no campo de texto.');
      return;
    }

    try {
      setLoading(true);

      const diagnosticData = {
        userEmail,
        userName: currentUser?.fullName || currentUser?.writerName || 'Autor',
        userId: currentUser?.id || 'N/A',
        module,
        bugType,
        description: description.trim(),
        environment: {
          currentUrl: window.location.href,
          path: window.location.pathname,
          userAgent: navigator.userAgent,
          screenResolution: `${window.innerWidth}x${window.innerHeight}`,
          appVersion: 'v1.0.0 (Beta)',
          timestamp: new Date().toISOString(),
        }
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(diagnosticData));
      if (selectedFile) {
        formData.append('screenshot', selectedFile);
      }

      await apiClient.post('/support/report-bug', formData);

      setSuccess(true);
    } catch (err) {
      console.error('Erro ao enviar relatório de bug:', err);
      setError(err.response?.data?.message || err.message || 'Erro ao enviar o diagnóstico. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    setDescription('');
    setSelectedFile(null);
    setFilePreview(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* CABEÇALHO */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#171724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
              <Bug size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Reportar um Bug</h3>
              <p className="text-[11px] text-gray-400">Envie um diagnóstico direto para a equipe técnica</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Relatório Enviado com Sucesso!</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                  Obrigado por nos ajudar a melhorar o StoryForge! O relatório de diagnóstico foi recebido e será analisado por nossa equipe para futuras atualizações.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Voltar ao Estúdio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {error && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* E-MAIL DE CONTATO (BLOQUEADO / SOMENTE LEITURA) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Seu E-mail de Contato</label>
                <input
                  type="email"
                  readOnly
                  value={userEmail}
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-400 opacity-80 cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* DROPDOWN 1: ONDE OCORREU O ERRO */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Onde ocorreu o erro?</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {MODULE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#171724] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* DROPDOWN 2: TIPO DO PROBLEMA */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Tipo de Problema</label>
                <select
                  value={bugType}
                  onChange={(e) => setBugType(e.target.value)}
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {BUG_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#171724] text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIÇÃO */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">Descrição do Erro *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte o que você tentou fazer e o que deu errado..."
                  className="w-full bg-[#171724] border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              {/* UPLOAD SEGURO */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                  <span>Anexar Print da Tela (Opcional)</span>
                  <span className="text-[10px] text-gray-500 font-normal">Max. 5MB (Somente Imagens)</span>
                </label>

                {filePreview ? (
                  <div className="relative border border-gray-800 rounded-xl p-2 bg-[#171724] flex items-center gap-3">
                    <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-gray-700" />
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold text-white truncate">{selectedFile?.name}</p>
                      <p className="text-[10px] text-gray-400">{(selectedFile?.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="border border-dashed border-gray-800 hover:border-purple-500/60 rounded-xl p-3 bg-[#171724]/60 flex items-center justify-center gap-2 text-gray-400 hover:text-white cursor-pointer transition-colors text-xs">
                    <Upload size={15} className="text-purple-400" />
                    <span>Clique aqui para anexar uma imagem</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* BOTÃO */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  {loading ? 'Enviando Diagnóstico...' : 'Enviar Diagnóstico'}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>,
    document.body
  );
}