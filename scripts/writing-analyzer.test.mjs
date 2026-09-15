import assert from 'node:assert/strict';
import test from 'node:test';
import { analyzeWriting, applyWritingSuggestion } from '../src/lib/writing/writingAnalyzer.mjs';

test('detects conservative Portuguese writing issues with exact spans', () => {
  const text = 'As menina chegaram.  voce foi a escola porque estava cansada. veses veses';
  const alerts = analyzeWriting(text);
  const rules = new Set(alerts.map((alert) => alert.ruleId));

  assert.deepEqual(
    [...rules].sort(),
    [
      'crase',
      'missing-accent',
      'multiple-spaces',
      'punctuation-before-porque',
      'repeated-word',
      'spelling-confusion',
      'subject-noun-agreement',
    ].sort()
  );

  for (const alert of alerts) {
    assert.equal(text.slice(alert.offset, alert.offset + alert.length), alert.original);
    assert.ok(alert.suggestions.length > 0 && alert.suggestions.length <= 4);
  }
});

test('applies only the occurrence represented by an alert', () => {
  const text = 'voce e voce';
  const alert = analyzeWriting(text).find((item) => item.ruleId === 'missing-accent');
  assert.equal(applyWritingSuggestion(text, alert, alert.suggestions[0]), 'você e voce');
});
