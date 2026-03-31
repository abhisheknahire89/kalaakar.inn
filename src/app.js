import { navigateTo, initRouter } from './router.js';
import { getCurrentUser, getCreatorProfile, logout } from './auth.js';
import { initLoginView, handlePostLogin } from './views/login.js';
import { initOnboardingView } from './views/onboarding.js';
import { initNotificationListener, initMessageListener, fetchUnreadCount } from './api/notifications.js';

export let currentUser = null;
export let currentProfile = null;

export async function boot() {
  initRouter();
  
  // Boot Phase Safety
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
  }, 5000);

  // Check auth state
  try {
    currentUser = await getCurrentUser();
  } catch (err) {
    currentUser = null;
  }
  
  // Initialization Trigger: Hide splash screen
  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';

  if (!currentUser) {
    // Check if returning from Google OAuth
    if (window.location.hash.includes('secret=')) {
      // Appwrite handles the session creation automatically in the background on redirect
      // We just need to wait a moment and check again
      setTimeout(async () => {
        currentUser = await getCurrentUser();
        if(currentUser) {
          await handlePostLogin();
        } else {
          navigateTo('login');
          initLoginView();
        }
      }, 1000);
      return;
    }

    navigateTo('login');
    initLoginView();
    return;
  }

  currentProfile = await getCreatorProfile(currentUser.$id);

  if (!currentProfile) {
    navigateTo('onboarding');
    initOnboardingView();
    return;
  }

  initMainApp();
}

let mainAppInitialized = false;

function initMainApp() {
  // Show app shell
  document.getElementById('app-shell').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('flex');

  if (!mainAppInitialized) {
    mainAppInitialized = true;
    // Setup global listeners
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    // Initialize real-time listeners
    initNotificationListener(currentUser.$id);
    initMessageListener(currentUser.$id);
  }
  
  fetchUnreadCount(currentUser.$id);

  // Navigate to initial view
  const initialView = window.location.hash.replace('#', '') || 'stage';
  navigateTo(initialView);

  if (window.lucide) window.lucide.createIcons();
}

async function handleLogout() {
  await logout();
  window.location.hash = '';
  currentUser = null;
  currentProfile = null;
  boot();
}
