import { startGoogleLogin, sendMagicLink, getCurrentUser, getCreatorProfile } from '../auth.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { trackEvent, logError } from '../observability/telemetry.js';

let loginViewInitialized = false;

export function initLoginView() {
  if (loginViewInitialized) return;
  loginViewInitialized = true;

  document.getElementById('google-login-btn')?.addEventListener('click', handleGoogleLogin);
  document.getElementById('email-link-btn')?.addEventListener('click', handleEmailLink);
  document.getElementById('email-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleEmailLink();
  });
}

function handleGoogleLogin() {
  const btn = document.getElementById('google-login-btn');
  const originalContent = btn ? btn.innerHTML : '';
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="animate-pulse">Redirecting to Google...</span>';
  }
  
  trackEvent('login_start', { method: 'google' });
  
  try {
    startGoogleLogin(); // triggers full-page redirect
  } catch (error) {
    console.error('Google login failed:', error);
    showToast('Could not start Google login. Please try again.', 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  }
}

async function handleEmailLink() {
  const input = document.getElementById('email-input');
  const email = input?.value?.trim() || '';
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    showToast('Please enter a valid email address.', 'warning');
    return;
  }

  const btn = document.getElementById('email-link-btn');
  const originalText = btn ? btn.textContent : 'Send sign-in link';
  
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending link...';
  }
  
  trackEvent('login_start', { method: 'magic_link' });

  try {
    const result = await sendMagicLink(email);
    if (result.success) {
      showToast('Check your inbox! We sent you a sign-in link.', 'success');
      document.getElementById('email-link-hint')?.classList.remove('hidden');
      if (input) input.value = '';
    } else {
      logError(result.error, { area: 'send_magic_link' });
      showToast(result.error || 'Failed to send link. Please try again.', 'error');
    }
  } catch (error) {
    showToast('Something went wrong. Please try again.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

export async function handlePostLogin() {
  const user = await getCurrentUser();
  if (!user) return;

  let profile = null;
  try {
    profile = await getCreatorProfile(user.$id);
  } catch (error) {
    console.error('Post-login profile fetch failed:', error);
    logError(error, { area: 'post_login_profile' });
    showToast('Unable to load your profile. Please try again.', 'error');
    return;
  }

  if (!profile) {
    navigateTo('onboarding');
    import('./onboarding.js').then(m => m.initOnboardingView());
  } else {
    window.location.hash = 'stage';
    import('../app.js').then(m => m.boot());
  }
}
