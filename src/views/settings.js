import { logout } from '../auth.js';

let settingsViewInitialized = false;

export function initSettingsView() {
  if (settingsViewInitialized) return;
  settingsViewInitialized = true;

  const btn = document.getElementById('settings-logout-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      await logout();
      window.location.hash = '';
      import('../app.js').then(m => m.boot());
    });
  }
}
