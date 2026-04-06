let overlayEl = null;

export function showBlockingError({ title = 'Something went wrong', message = '', actionText = 'Retry', onAction } = {}) {
  if (overlayEl) overlayEl.remove();

  overlayEl = document.createElement('div');
  overlayEl.setAttribute('role', 'dialog');
  overlayEl.setAttribute('aria-modal', 'true');
  overlayEl.className = 'fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';

  overlayEl.innerHTML = `
    <div class="glass-panel rounded-xl p-6 w-full max-w-md">
      <h2 class="font-poppins text-xl font-bold mb-2">${escapeHtml(title)}</h2>
      <p class="text-sm text-muted mb-5 whitespace-pre-wrap">${escapeHtml(message)}</p>
      <div class="flex gap-3 justify-end">
        <button id="blocking-error-action" class="btn-gold px-4 py-2 rounded-md text-sm">${escapeHtml(actionText)}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlayEl);

  const actionBtn = overlayEl.querySelector('#blocking-error-action');
  actionBtn?.addEventListener('click', () => {
    try {
      onAction?.();
    } finally {
      hideBlockingError();
    }
  });
}

export function hideBlockingError() {
  overlayEl?.remove();
  overlayEl = null;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

