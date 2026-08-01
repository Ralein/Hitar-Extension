import { describe, it, expect, vi } from 'vitest';
import { withExponentialBackoff } from '../../src/lib/retry';

describe('withExponentialBackoff', () => {
  it('returns result on first attempt if successful', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await withExponentialBackoff(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure up to maxRetries', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce({ status: 500, message: 'Server Error' })
      .mockRejectedValueOnce({ status: 429, message: 'Rate Limited' })
      .mockResolvedValue('eventual success');

    const result = await withExponentialBackoff(fn, {
      maxRetries: 3,
      baseDelayMs: 10,
      shouldRetry: () => true,
    });

    expect(result).toBe('eventual success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws error when maxRetries exceeded', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 500, message: 'Persistent failure' });

    await expect(
      withExponentialBackoff(fn, {
        maxRetries: 2,
        baseDelayMs: 10,
        shouldRetry: () => true,
      }),
    ).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});
