/** @typedef {'low'|'medium'|'high'} GrammarSeverity */
/** @typedef {'formatting'|'spelling'|'grammar'|'style'|'lexical'|'punctuation'} GrammarCategory */

/** @typedef {{
 * id:string, category:GrammarCategory|string, severity:GrammarSeverity,
 * message:string, source?:string, suggestions?:string[]
 * }} GrammarRule */

/** @typedef {{
 * id:string, ruleId:string, category:string, severity:GrammarSeverity,
 * message:string, original:string, offset:number, length:number,
 * suggestions:string[], source?:string
 * }} GrammarAlert */

export function defineGrammarRule(rule) {
  if (!rule || typeof rule.id !== 'string' || !rule.id || typeof rule.message !== 'string') {
    throw new TypeError('GrammarRule requires id and message');
  }
  return Object.freeze({
    category: 'grammar',
    severity: 'medium',
    suggestions: [],
    ...rule,
  });
}

export function createGrammarAlert(rule, original, offset, suggestions = [], extra = {}) {
  const normalized = defineGrammarRule(rule);
  return {
    id: `${normalized.id}-${offset}`,
    ruleId: normalized.id,
    category: normalized.category,
    severity: normalized.severity,
    message: normalized.message,
    original: String(original),
    offset: Number(offset),
    length: String(original).length,
    suggestions: [...new Set(suggestions.filter(Boolean).map(String))].slice(0, 4),
    source: normalized.source,
    ...extra,
  };
}
