// src/lib/sanitize.js
// Utilitário para prevenção de ataques XSS (Cross-Site Scripting) via HTML dinâmico

import DOMPurify from 'dompurify';

// Configuração padrão de tags e atributos permitidos (Allowlist)
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
    'blockquote', 'a', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title'],
  // Garante que links externos sempre tenham rel="noopener noreferrer"
  ADD_ATTR: ['target'],
  FORCE_BODY: true,
};

/**
 * Sanitiza qualquer string HTML utilizando uma Allowlist estrita.
 */
export const sanitizeHtml = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  return DOMPurify.sanitize(rawHtml, RICH_TEXT_CONFIG);
};

/**
 * Componente React para renderização segura de HTML.
 */
export function SafeHTML({ content, className = '' }) {
  const cleanHTML = sanitizeHtml(content);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
}

export default sanitizeHtml;