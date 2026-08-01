import { TranslationBatch } from './types';

export const DEFAULT_BATCH_CHAR_BUDGET = 2000;

/**
 * Packs text strings into batches respecting a character budget per request.
 * Preserves original array indices for map-back.
 */
export function createBatches(
  texts: string[],
  charBudget: number = DEFAULT_BATCH_CHAR_BUDGET,
): TranslationBatch[] {
  const batches: TranslationBatch[] = [];
  if (texts.length === 0) return batches;

  let currentBatch: string[] = [];
  let currentIndices: number[] = [];
  let currentChars = 0;

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const textLength = text.length;

    // If single text exceeds budget, it gets its own batch
    if (textLength >= charBudget) {
      if (currentBatch.length > 0) {
        batches.push({
          texts: currentBatch,
          totalChars: currentChars,
          indices: currentIndices,
        });
        currentBatch = [];
        currentIndices = [];
        currentChars = 0;
      }

      batches.push({
        texts: [text],
        totalChars: textLength,
        indices: [i],
      });
      continue;
    }

    // Check if adding text exceeds budget
    if (currentChars + textLength > charBudget && currentBatch.length > 0) {
      batches.push({
        texts: currentBatch,
        totalChars: currentChars,
        indices: currentIndices,
      });
      currentBatch = [];
      currentIndices = [];
      currentChars = 0;
    }

    currentBatch.push(text);
    currentIndices.push(i);
    currentChars += textLength;
  }

  if (currentBatch.length > 0) {
    batches.push({
      texts: currentBatch,
      totalChars: currentChars,
      indices: currentIndices,
    });
  }

  return batches;
}
