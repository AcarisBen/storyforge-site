import { createGrammarAlert, defineGrammarRule } from './grammarSchema.mjs';

// Offline-only adapter: callers provide XML or a parsed object. No fetch/network
// is performed here. This intentionally supports the stable subset of LT XML.
export function parseLanguageToolXml(xml, { ruleMap = {} } = {}) {
  const value = String(xml ?? '');
  const matches = [...value.matchAll(/<error\b([^>]*)(?:\/>|>([\s\S]*?)<\/error>)/gi)];
  return matches.map((match, index) => {
    const attrs = Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((item) => [item[1], item[2]]));
    const id = ruleMap[attrs.ruleId] || attrs.ruleId || `languagetool-${index}`;
    const rule = defineGrammarRule({
      id, category: attrs.category || 'grammar', severity: 'medium',
      message: attrs.message || 'Revisão sugerida.', source: 'languagetool',
    });
    const replacements = attrs.replacements
      ? attrs.replacements.split('|')
      : [...(match[2] || '').matchAll(/<replacement[^>]*>([\s\S]*?)<\/replacement>/gi)].map((item) => item[1]);
    return createGrammarAlert(rule, attrs.context || '', Number(attrs.from || 0), replacements);
  });
}

export function adaptLanguageToolMatches(matches = [], { ruleMap = {} } = {}) {
  return matches.map((match, index) => {
    const id = ruleMap[match.rule?.id || match.ruleId] || match.rule?.id || match.ruleId || `languagetool-${index}`;
    return createGrammarAlert(defineGrammarRule({
      id, category: match.rule?.category || 'grammar', severity: match.severity || 'medium',
      message: match.message || 'Revisão sugerida.', source: 'languagetool',
    }), match.context || match.original || '', match.offset ?? match.from ?? 0,
    match.replacements?.map((item) => typeof item === 'string' ? item : item.value) || []);
  });
}
