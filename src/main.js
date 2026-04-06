import './index.css';
import { boot } from './app.js';
import { initDomBindings } from './domBindings.js';
import { showBootDiagnosticsError } from './components/bootDiagnostics.js';

document.addEventListener('DOMContentLoaded', () => {
  Promise.resolve()
    .then(() => boot())
    .catch((error) => {
      // Never leave the user stuck on the splash screen
      const splash = document.getElementById('splash-screen');
      if (splash) splash.style.display = 'none';
      showBootDiagnosticsError(error, {
        title: 'Splash screen stuck',
        hint: 'The app crashed during startup. The details below show the exact failing API call and file/line (when available).',
      });
    });
});
document.addEventListener('DOMContentLoaded', initDomBindings);
