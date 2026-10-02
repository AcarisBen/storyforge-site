// src/lib/sanitize.js
// Utilitário para prevenção de ataques XSS (Cross-Site Scripting) via HTML dinâmico

import DOMPurify from 'dompurify';

/**
 * Sanitiza strings contendo HTML antes de renderizá-las no DOM.
 * @param {string} rawHtml - Conteúdo HTML bruto (ex: do editor rich-text ou preview).
 * @returns {string} HTML limpo e seguro contra XSS.
 */
export const sanitizeHtml = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  return DOMPurify.sanitize(rawHtml, {
    // Permite atributos seguros para links abrirem em nova aba se necessário
    ADD_ATTR: ['target', 'rel'],
    // Garante que tags perigosas como <script>, <iframe> e manipuladores onclick sejam removidos
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
};

export default sanitizeHtml;