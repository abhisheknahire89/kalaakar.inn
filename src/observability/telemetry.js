import { env } from '../env.js';

export function trackEvent(name, props = {}) {
  try {
    const payload = {
      type: 'event',
      name,
      props,
      ts: new Date().toISOString(),
    };

    // Always log locally for debugging
    console.info('[telemetry:event]', name, props);

    // Optional remote endpoint (server should accept JSON)
    if (env.analyticsEndpoint) {
      send(payload);
    }
  } catch {
    // Never block UX on telemetry
  }
}

export function logError(error, context = {}) {
  try {
    const message =
      typeof error === 'string'
        ? error
        : error?.message || (error ? JSON.stringify(error) : 'Unknown error');

    const payload = {
      type: 'error',
      message,
      context,
      ts: new Date().toISOString(),
    };

    console.error('[telemetry:error]', message, context);

    if (env.analyticsEndpoint) {
      send(payload);
    }
  } catch {
    // Never block UX on logging
  }
}

function send(payload) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(env.analyticsEndpoint, new Blob([body], { type: 'application/json' }));
      return;
    }
  } catch {
    // fall through
  }

  // best-effort
  fetch(env.analyticsEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

