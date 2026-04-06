import { showToast } from './components/toast.js';
import { initHireFlow } from './components/hireFlow.js';
import { navigateTo } from './router.js';

export function initDomBindings() {
  bindComposerOpeners();
  bindComposerClosers();
  initHireFlow();
  bindNavLinks();
}

function bindComposerOpeners() {
  const open = () => openComposer();

  document.getElementById('weekly-prompt-cta')?.addEventListener('click', open);
  document.getElementById('composer-trigger')?.addEventListener('click', open);
  document.getElementById('create-fab')?.addEventListener('click', open);
  document.getElementById('top-create-btn')?.addEventListener('click', open);
  document.getElementById('explore-create-btn')?.addEventListener('click', open);

  // Basic UX: Ctrl/Cmd+Enter posts
  document.getElementById('post-text')?.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      document.getElementById('submit-post-btn')?.click();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeComposer();
    }
  });

  // Prevent accidental form submissions if future inputs are added
  document.getElementById('post-composer')?.addEventListener('submit', (e) => e.preventDefault());
}

function bindComposerClosers() {
  document.getElementById('close-composer-btn')?.addEventListener('click', closeComposer);
  document.getElementById('post-composer')?.addEventListener('click', (e) => {
    if (e.target?.id === 'post-composer') closeComposer();
  });
}

export function openComposer({ presetText = '' } = {}) {
  const modal = document.getElementById('post-composer');
  if (!modal) return;
  modal.classList.remove('hidden');
  const text = document.getElementById('post-text');
  if (text && presetText) text.value = presetText;
  setTimeout(() => document.getElementById('post-text')?.focus(), 0);
}

export function closeComposer() {
  const modal = document.getElementById('post-composer');
  if (!modal) return;
  modal.classList.add('hidden');
}

export function showConfigHelpToast(message) {
  showToast(message, 'warning');
}

function bindNavLinks() {
  // Use navigateTo so route state doesn't leak between screens (e.g. viewing another profile)
  const links = document.querySelectorAll('#top-nav a[href^="#"], #bottom-nav a[href^="#"]');
  links.forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const viewId = href.replace('#', '') || 'stage';
      navigateTo(viewId, null);
    });
  });
}
