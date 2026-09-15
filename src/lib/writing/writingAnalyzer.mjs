import {
  ACCENT_SUGGESTIONS,
  DESTINATION_NOUNS,
  SPELLING_SUGGESTIONS,
  WRITING_RULES,
} from './writingRules.mjs';

const WORD_PATTERN = /[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu;
const WORD_WITH_SPAN_PATTERN = /[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*/gu;
const CASE_INSENSITIVE = 'giu';

function preserveCase(original, suggestion) {
  if (original === original.toUpperCase()) return suggestion.toUpperCase();
  if (original[0] === original[0]?.toUpperCase()) {
    return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
  }
  return suggestion;
}

function makeAlert(rule, original, offset, suggestions, message = rule.message) {
  return {
    id: `${rule.id}-${offset}`,
    ruleId: rule.id,
    category: rule.category,
    original,
    offset,
    length: original.length,
    message,
    severity: rule.severity,
    suggestions: [...new Set(suggestions)],
  };
}

function analyzeRepeatedWords(text, alerts) {
  const words = [...text.matchAll(WORD_WITH_SPAN_PATTERN)];
  for (let index = 1; index < words.length; index += 1) {
    const previous = words[index - 1];
    const current = words[index];
    if (previous[0].toLocaleLowerCase() !== current[0].toLocaleLowerCase()) continue;
    const original = text.slice(previous.index, current.index + current[0].length);
    alerts.push(makeAlert(WRITING_RULES.repeatedWord, original, previous.index, [previous[0]]));
  }
}

function analyzeMultipleSpaces(text, alerts) {
  const pattern = /[^\S\r\n]{2,}/gu;
  for (const match of text.matchAll(pattern)) {
    alerts.push(makeAlert(WRITING_RULES.multipleSpaces, match[0], match.index, [' ']));
  }
}

function analyzeAccentAndSpelling(text, alerts) {
  for (const [word, suggestion] of Object.entries(ACCENT_SUGGESTIONS)) {
    const pattern = new RegExp(`\\b${word}\\b`, CASE_INSENSITIVE);
    for (const match of text.matchAll(pattern)) {
      alerts.push(
        makeAlert(
          WRITING_RULES.accent,
          match[0],
          match.index,
          [preserveCase(match[0], suggestion)]
        )
      );
    }
  }

  for (const [word, suggestion] of Object.entries(SPELLING_SUGGESTIONS)) {
    const pattern = new RegExp(`\\b${word}\\b`, CASE_INSENSITIVE);
    for (const match of text.matchAll(pattern)) {
      alerts.push(
        makeAlert(
          WRITING_RULES.spelling,
          match[0],
          match.index,
          [preserveCase(match[0], suggestion)]
        )
      );
    }
  }
}

function analyzeAgreement(text, alerts) {
  const pattern = /\bAs\s+([\p{L}\p{M}]+a)\s+([\p{L}\p{M}]+am)\b/giu;
  for (const match of text.matchAll(pattern)) {
    const noun = match[1];
    const verb = match[2];
    const pluralNoun = `${noun}s`;
    const original = match[0];
    alerts.push(
      makeAlert(
        WRITING_RULES.agreement,
        original,
        match.index,
        [`As ${pluralNoun} ${verb}`, `As ${pluralNoun} ${verb.slice(0, -2)}aram`]
      )
    );
  }
}

function analyzePorque(text, alerts) {
  const pattern = /\b((?:mas|porém|contudo|entretanto|disse|sabia|entendeu|aconteceu|ficou|era|estava|foi)\b[^.!?\n,]{1,})\s+(porque)\b/giu;
  for (const match of text.matchAll(pattern)) {
    const porqueOffset = match.index + match[1].length + 1;
    alerts.push(
      makeAlert(WRITING_RULES.porque, match[2], porqueOffset, [`, ${match[2]}`])
    );
  }
}

function analyzeCrase(text, alerts) {
  const verbs = '(?:vou|vai|vamos|foi|foram|cheguei|chega|voltei|voltou|dirigiu-se)';
  const nouns = DESTINATION_NOUNS.join('|');
  const pattern = new RegExp(`\\b${verbs}\\s+(a)\\s+(${nouns})\\b`, 'giu');
  for (const match of text.matchAll(pattern)) {
    const original = `${match[1]} ${match[2]}`;
    const offset = match.index + match[0].lastIndexOf(original);
    alerts.push(makeAlert(WRITING_RULES.crase, original, offset, [`à ${match[2]}`]));
  }
}

export function analyzeWriting(text = '') {
  const value = String(text);
  if (!value) return [];

  const alerts = [];
  analyzeRepeatedWords(value, alerts);
  analyzeMultipleSpaces(value, alerts);
  analyzeAccentAndSpelling(value, alerts);
  analyzeAgreement(value, alerts);
  analyzePorque(value, alerts);
  analyzeCrase(value, alerts);

  return alerts.sort((left, right) => left.offset - right.offset || left.id.localeCompare(right.id));
}

export function applyWritingSuggestion(text, alert, suggestion) {
  const value = String(text);
  if (!alert || !suggestion || value.slice(alert.offset, alert.offset + alert.length) !== alert.original) {
    return value;
  }
  return `${value.slice(0, alert.offset)}${suggestion}${value.slice(alert.offset + alert.length)}`;
}

export function removeWritingAlert(alerts, alertId) {
  return alerts.filter((alert) => alert.id !== alertId);
}
