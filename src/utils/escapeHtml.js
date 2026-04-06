export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('/')) return raw;
  try {
    const url = new URL(raw, window.location.origin);
    if (['http:', 'https:', 'blob:'].includes(url.protocol)) return url.toString();
    return '';
  } catch {
    return '';
  }
}

