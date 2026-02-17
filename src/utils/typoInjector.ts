/**
 * Programmatic typo injector — picks a random eligible word in the text
 * and applies one small, natural-looking mutation.
 *
 * Mutations: swap adjacent letters, duplicate a letter, drop a letter,
 * or use a common keyboard neighbour.
 *
 * Rules:
 * - Only mutates words with 3+ characters
 * - Never mutates numbers, URLs, phone numbers, or names (capitalised words)
 * - Fires roughly once every `frequency` calls (default 3-4)
 */

const SKIP_PATTERNS = [
  /^\d+$/, // pure numbers
  /\d{3}/, // phone-like sequences
  /^https?:\/\//i, // URLs
  /^www\./i,
  /^[A-Z]/, // capitalised words (likely names/proper nouns)
  /^@/, // mentions
  /^\d+-\d+/, // phone formats
];

function isEligible(word: string): boolean {
  if (word.length < 3) return false;
  return !SKIP_PATTERNS.some((p) => p.test(word));
}

type Mutation = (word: string) => string;

const mutations: Mutation[] = [
  // Swap two adjacent letters
  (word) => {
    const i = Math.floor(Math.random() * (word.length - 1));
    const chars = word.split('');
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    return chars.join('');
  },
  // Drop a random letter
  (word) => {
    const i = Math.floor(Math.random() * word.length);
    return word.slice(0, i) + word.slice(i + 1);
  },
  // Duplicate a random letter
  (word) => {
    const i = Math.floor(Math.random() * word.length);
    return word.slice(0, i) + word[i] + word.slice(i);
  },
];

// Tracks call count per property to decide when to fire
const callCounters = new Map<string, number>();

/**
 * Maybe inject a typo into the given text.
 * Returns the (possibly mutated) text.
 *
 * @param text - The AI response text
 * @param propertyId - Used to track frequency per property
 * @param frequency - Inject a typo every N calls on average (default 3–4, randomised)
 */
export function maybeInjectTypo(
  text: string,
  propertyId: string,
  frequency: number = 0 // 0 = random 3-4
): string {
  const effectiveFrequency = frequency > 0 ? frequency : (Math.random() < 0.5 ? 3 : 4);

  const count = (callCounters.get(propertyId) ?? 0) + 1;
  callCounters.set(propertyId, count);

  if (count % effectiveFrequency !== 0) {
    return text;
  }

  // Split into words, find eligible ones
  const words = text.split(/(\s+)/); // preserve whitespace tokens
  const eligible: number[] = [];
  for (let i = 0; i < words.length; i++) {
    if (!/^\s+$/.test(words[i]) && isEligible(words[i])) {
      eligible.push(i);
    }
  }

  if (eligible.length === 0) return text;

  // Pick a random eligible word and mutate it
  const targetIdx = eligible[Math.floor(Math.random() * eligible.length)];
  const originalWord = words[targetIdx];

  // Strip trailing punctuation, mutate the core, then re-attach
  const punctMatch = originalWord.match(/([.,!?;:]+)$/);
  const core = punctMatch ? originalWord.slice(0, -punctMatch[1].length) : originalWord;
  const punct = punctMatch ? punctMatch[1] : '';

  if (core.length < 3) return text; // safety check after stripping punct

  const mutation = mutations[Math.floor(Math.random() * mutations.length)];
  const mutated = mutation(core);

  // Don't apply if mutation accidentally produced the same word
  if (mutated === core) return text;

  words[targetIdx] = mutated + punct;
  return words.join('');
}

/**
 * ~30% chance: lowercase the first letter of sentences (skip the very first sentence).
 */
export function maybeDropCapitalization(text: string): string {
  // Split on sentence boundaries (. ! ?) followed by whitespace + capital letter
  return text.replace(
    /([.!?]\s+)([A-Z])/g,
    (match, sep, letter) => {
      if (Math.random() < 0.3) return sep + letter.toLowerCase();
      return match;
    }
  );
}

/**
 * ~30% chance per contraction: drop the apostrophe ("don't" → "dont").
 */
export function maybeDropApostrophes(text: string): string {
  return text.replace(/(\w)'(\w)/g, (match, before, after) => {
    if (Math.random() < 0.3) return before + after;
    return match;
  });
}
