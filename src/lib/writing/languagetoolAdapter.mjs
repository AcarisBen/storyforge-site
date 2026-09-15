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

export function parseLanguageToolRulesXml(xml, { source = 'languagetool' } = {}) {
  const value = String(xml ?? '');
  return [...value.matchAll(/<rule\b([^>]*)>([\s\S]*?)<\/rule>/gi)].map((match) => {
    const attrs = Object.fromEntries([...match[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((item) => [item[1], item[2]]));
    const message = (match[2].match(/<message>([\s\S]*?)<\/message>/i)?.[1] || attrs.name || 'Revisão sugerida.')
      .replace(/<[^>]+>/g, '').trim();
    const suggestions = [...match[2].matchAll(/<suggestion>([\s\S]*?)<\/suggestion>/gi)]
      .map((item) => item[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    const tokens = [...match[2].matchAll(/<token>([\s\S]*?)<\/token>/gi)]
      .map((item) => item[1].replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
    return {
      id: attrs.id || attrs.name,
      category: attrs.type || 'grammar',
      severity: 'medium',
      message,
      source,
      suggestions,
      ...(tokens.length ? {
        pattern: `\\b${tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+') }\\b`,
      } : {}),
    };
  }).filter((rule) => rule.id);
}
