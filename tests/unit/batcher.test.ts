import { describe, it, expect } from 'vitest';
import { createBatches } from '../../src/lib/batcher';

describe('createBatches', () => {
  it('handles empty input', () => {
    expect(createBatches([], 100)).toEqual([]);
  });

  it('groups texts respecting character budget', () => {
    const texts = ['Hello', 'World', 'This is a longer sentence for testing'];
    const batches = createBatches(texts, 20);

    expect(batches.length).toBeGreaterThan(1);
    batches.forEach((batch) => {
      expect(batch.texts.length).toBeGreaterThan(0);
      expect(batch.indices.length).toBe(batch.texts.length);
    });
  });

  it('handles oversized individual text items', () => {
    const texts = ['Short', 'A very long string that exceeds budget by itself', 'End'];
    const batches = createBatches(texts, 15);

    expect(batches.length).toBe(3);
    expect(batches[1].texts[0]).toContain('very long string');
    expect(batches[1].indices[0]).toBe(1);
  });

  it('preserves indices correctly', () => {
    const texts = ['One', 'Two', 'Three', 'Four'];
    const batches = createBatches(texts, 1000);

    expect(batches.length).toBe(1);
    expect(batches[0].indices).toEqual([0, 1, 2, 3]);
  });
});
