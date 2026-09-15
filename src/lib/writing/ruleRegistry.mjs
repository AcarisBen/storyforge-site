import { createGrammarAlert, defineGrammarRule } from './grammarSchema.mjs';

const rules = new Map();
export function registerGrammarRule(rule, detector) {
  const normalized = defineGrammarRule(rule);
  if (typeof detector !== 'function') throw new TypeError('A grammar detector is required');
  rules.set(normalized.id, { rule: normalized, detector });
  return () => rules.delete(normalized.id);
}
export function clearGrammarRules() { rules.clear(); }
export function getGrammarRules() { return [...rules.values()].map(({ rule }) => rule); }
export function runGrammarRules(text, context = {}) {
  return [...rules.values()].flatMap(({ rule, detector }) => {
    const result = detector(String(text), context) || [];
    return result.map((item) => item.ruleId ? item : createGrammarAlert(
      rule, item.original ?? '', item.offset ?? 0, item.suggestions ?? [], item
    ));
  }).sort((a, b) => a.offset - b.offset || a.id.localeCompare(b.id));
}

export function mapRuleId(id, mapping = {}) { return mapping[id] || id; }
