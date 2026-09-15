import { tokenize } from './tokenizer.mjs';

const FUNCTION = new Set(['a','à','ao','as','às','o','os','um','uma','e','ou','de','do','da','em','no','na','por','para','com','que','porque']);
const VERB_ENDINGS = /(ar|er|ir|ou|am|em|ava|ia|arei|eria|asse|isse)$/u;
export function tagPartsOfSpeech(text = '') {
  const tokens = tokenize(text);
  return tokens.map((token, index) => {
    const value = token.normalized;
    let tag = 'NOUN';
    if (FUNCTION.has(value)) tag = 'FUNCTION';
    else if (VERB_ENDINGS.test(value) || /^(é|foi|vai|está|era|tem)$/u.test(value)) tag = 'VERB';
    else if (/mente$/u.test(value)) tag = 'ADV';
    else if (/(o|a|os|as|um|uma|ável|ível)$/u.test(value)) tag = tag === 'NOUN' ? 'NOUN' : tag;
    return { ...token, tag, previous: tokens[index - 1]?.normalized || null };
  });
}
