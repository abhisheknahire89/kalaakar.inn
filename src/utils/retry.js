export async function withRetry(fn, { retries = 2, baseDelayMs = 400, shouldRetry } = {}) {
  let attempt = 0;
  while (true) {
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt >= retries) throw error;
      if (shouldRetry && !shouldRetry(error)) throw error;
      const delay = baseDelayMs * Math.pow(2, attempt);
      await sleep(delay + jitter(120));
      attempt++;
    }
  }
}

export function isRetriableAppwriteError(error) {
  const code = error?.code || error?.response?.code;
  if (code === 408 || code === 409 || code === 425 || code === 429) return true;
  if (typeof code === 'number' && code >= 500) return true;
  // Network/offline cases: fetch errors sometimes bubble as TypeError
  if (error?.name === 'TypeError') return true;
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(max) {
  return Math.floor(Math.random() * max);
}

