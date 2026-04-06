import { APPWRITE_DATABASE_ID, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from '../appwriteClient.js';

let overlayEl = null;

export function showBootDiagnosticsError(error, { title = 'App failed to start', hint = '' } = {}) {
  const normalized = normalizeError(error);
  const firstFrame = extractFirstAppFrame(normalized.stack);
  const locationLine = firstFrame ? `${firstFrame.file}:${firstFrame.line}:${firstFrame.column}` : 'Unknown';

  const message = normalized.message || 'Unknown error';
  const code = normalized.code ? `code=${normalized.code}` : '';

  const diagnosticsText = [
    `Title: ${title}`,
    `Message: ${message}`,
    code ? `Code: ${code}` : null,
    `Location: ${locationLine}`,
    `URL: ${window.location.href}`,
    `Online: ${String(navigator.onLine)}`,
    `Appwrite endpoint: ${APPWRITE_ENDPOINT}`,
    `Appwrite project: ${APPWRITE_PROJECT_ID}`,
    `Appwrite database: ${APPWRITE_DATABASE_ID}`,
    '',
    'Stack:',
    normalized.stack || '(no stack)',
  ]
    .filter(Boolean)
    .join('\n');

  console.error('[BOOT ERROR]', diagnosticsText);

  // Keep it accessible for support
  window.__KALAKAR_LAST_BOOT_ERROR__ = diagnosticsText;

  if (overlayEl) overlayEl.remove();
  overlayEl = document.createElement('div');
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-modal', 'true');
  overlayEl.className = 'fixed inset-0 z-[2000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4';

  overlayEl.innerHTML = `
    <div class="glass-panel rounded-xl p-6 w-full max-w-2xl">
      <div class="flex items-start justify-between gap-4 mb-3">
        <div>
          <h2 class="font-poppins text-xl font-bold">${escapeHtml(title)}</h2>
          <p class="text-sm text-muted mt-1">${escapeHtml(hint || 'Use the details below to fix Appwrite config or permissions.')}</p>
        </div>
        <button id="bootdiag-close" class="text-muted hover:text-white text-xl" aria-label="Close">✕</button>
      </div>

      <div class="rounded-lg border border-strong bg-surface p-4 text-sm whitespace-pre-wrap font-mono max-h-[50vh] overflow-auto">
${escapeHtml(diagnosticsText)}
      </div>

      <div class="flex flex-wrap gap-3 justify-end mt-4">
        <button id="bootdiag-copy" class="btn-ghost border border-strong rounded-full px-4 py-2 text-sm">Copy</button>
        <button id="bootdiag-download" class="btn-ghost border border-strong rounded-full px-4 py-2 text-sm">Save screenshot</button>
        <button id="bootdiag-retry" class="btn-gold px-5 py-2 rounded-full text-sm">Retry</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlayEl);

  overlayEl.querySelector('#bootdiag-close')?.addEventListener('click', hideBootDiagnosticsError);
  overlayEl.querySelector('#bootdiag-retry')?.addEventListener('click', () => window.location.reload());
  overlayEl.querySelector('#bootdiag-copy')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(diagnosticsText);
      toast('Copied diagnostics to clipboard.');
    } catch {
      toast('Copy failed. Select and copy manually.', true);
    }
  });
  overlayEl.querySelector('#bootdiag-download')?.addEventListener('click', () => {
    try {
      const png = renderTextToPngDataUrl(diagnosticsText);
      downloadDataUrl(png, `kalakar-boot-error-${Date.now()}.png`);
      toast('Saved screenshot.');
    } catch (e) {
      console.warn('Failed to save screenshot', e);
      toast('Screenshot failed.', true);
    }
  });
}

export function hideBootDiagnosticsError() {
  overlayEl?.remove();
  overlayEl = null;
}

function normalizeError(error) {
  if (!error) return { message: 'Unknown error', stack: '', code: '' };
  if (typeof error === 'string') return { message: error, stack: '', code: '' };
  return {
    message: error.message || String(error),
    stack: error.stack || '',
    code: error.code || error?.response?.code || '',
  };
}

function extractFirstAppFrame(stack) {
  const s = String(stack || '');
  const lines = s.split('\n').map((l) => l.trim());

  // Prefer Vite dev frames that point to /src/...
  for (const l of lines) {
    const m = l.match(/(\/src\/[^):\s]+):(\d+):(\d+)/);
    if (m) return { file: m[1], line: Number(m[2]), column: Number(m[3]) };
  }

  // Fallback: any file:line:col
  for (const l of lines) {
    const m = l.match(/(https?:\/\/[^):\s]+):(\d+):(\d+)/);
    if (m) return { file: m[1], line: Number(m[2]), column: Number(m[3]) };
  }
  return null;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toast(message, isError = false) {
  const el = document.createElement('div');
  el.className =
    'fixed bottom-24 left-1/2 -translate-x-1/2 z-[2100] px-4 py-2 rounded-full text-sm border ' +
    (isError ? 'border-red-900/40 text-red-300 bg-black/70' : 'border-strong text-white bg-black/70');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function renderTextToPngDataUrl(text) {
  const lines = String(text).split('\n');
  const padding = 24;
  const lineHeight = 18;
  const maxLines = Math.min(lines.length, 60);
  const display = lines.slice(0, maxLines);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

  const font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  ctx.font = font;

  const maxWidth = Math.min(1000, Math.max(...display.map((l) => ctx.measureText(l).width)) + padding * 2);
  const height = padding * 2 + display.length * lineHeight + 40;

  canvas.width = Math.ceil(maxWidth);
  canvas.height = Math.ceil(height);

  // Background
  ctx.fillStyle = '#0b0b0c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = 'rgba(197,160,89,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

  // Title
  ctx.font = 'bold 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.fillStyle = '#c5a059';
  ctx.fillText('Kalakar Boot Error', padding, padding + 6);

  // Text
  ctx.font = font;
  ctx.fillStyle = '#eaeaea';
  let y = padding + 28;
  for (const line of display) {
    ctx.fillText(line, padding, y);
    y += lineHeight;
  }

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(new Date().toLocaleString(), padding, canvas.height - padding);

  return canvas.toDataURL('image/png');
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

