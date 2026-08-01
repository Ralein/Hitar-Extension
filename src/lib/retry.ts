export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: any) => boolean;
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

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 100;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
    }
  }
}
