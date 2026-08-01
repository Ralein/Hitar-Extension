export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: any) => boolean;
}

function calculateJitterDelay(attempt: number, baseDelayMs: number): number {
  const delay = baseDelayMs * Math.pow(2, attempt - 1);
  const randomVal = typeof crypto !== 'undefined' && crypto.getRandomValues
    ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff
    : Math.random();
  return delay + randomVal * 100;
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }

      if (options.shouldRetry && !options.shouldRetry(error)) {
        throw error;
      }

      if (options.onRetry) {
        options.onRetry(attempt, error);
      }

      const totalDelay = calculateJitterDelay(attempt, baseDelayMs);
      await new Promise((resolve) => setTimeout(resolve, totalDelay));
    }
  }
}
