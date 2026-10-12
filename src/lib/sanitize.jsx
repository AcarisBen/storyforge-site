// src/lib/sanitize.jsx
// Utilitário para prevenção de ataques XSS (Cross-Site Scripting) via HTML dinâmico

import DOMPurify from 'dompurify';

// Configuração padrão de tags e atributos permitidos (Allowlist)
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
    'blockquote', 'a', 'code', 'pre', 'span', 'font', 'div', 'sub', 'sup'
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'title', 'style', 'size', 'face', 'color'],
  FORCE_BODY: true,
};

const SAFE_STYLE_PROPERTIES = new Set([
  'background-color',
  'color',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'text-align',
  'text-decoration',
  'text-indent',
  'vertical-align',
]);

/**
 * Sanitiza qualquer string HTML utilizando uma Allowlist estrita.
 */
export const sanitizeHtml = (rawHtml) => {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  const sanitized = DOMPurify.sanitize(rawHtml, RICH_TEXT_CONFIG);
  const template = document.createElement('template');
  template.innerHTML = sanitized;

  template.content.querySelectorAll('[style]').forEach((element) => {
    const styles = [...element.style].map((property) => [
      property,
      element.style.getPropertyValue(property),
    ]);
    element.removeAttribute('style');

    styles.forEach(([property, value]) => {
      if (
        SAFE_STYLE_PROPERTIES.has(property) &&
        !/(?:url\s*\(|expression\s*\(|@import|javascript:|behavior\s*:|-moz-binding)/i.test(value)
      ) {
        element.style.setProperty(property, value);
      }
    });
  });

  template.content.querySelectorAll('a[target="_blank"]').forEach((link) => {
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return template.innerHTML;
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