import { navigateTo, initRouter } from './router.js';
import { consumeMagicLinkFromUrl, checkSession, getFilePreview, logout } from './auth.js';
import { initLoginView, handlePostLogin } from './views/login.js';
import { initOnboardingView } from './views/onboarding.js';
import { initNotificationListener, fetchUnreadCount } from './api/notifications.js';
import { showToast } from './components/toast.js';
import { showBlockingError } from './components/blockingError.js';
import { initPostComposer } from './components/postComposer.js';
import { logError, trackEvent } from './observability/telemetry.js';
import { validateAppwriteMvp } from './appwriteValidation.js';
import { openComposer } from './domBindings.js';
import { enableGuestMode, getGuestProfile, getGuestUser, isGuestMode, disableGuestMode } from './utils/guestMode.js';

export let currentUser = null;
export let currentProfile = null;
let bootInProgress = false;

export async function boot() {
  bootInProgress = true;
  const bootStartedAt = performance.now();
  const MIN_SPLASH_MS = 1700;
  let splashHideScheduled = false;

  initRouter();
  initGlobalGuards();

  // Hide splash screen helper (must never be blocked by awaits)
  const hideSplash = () => {
    const splash = document.getElementById('splash-screen');
    if (!splash) return;
    splash.classList.add('is-hiding');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 460);
  };

  const scheduleHideSplash = ({ force = false } = {}) => {
    if (splashHideScheduled) return;
    splashHideScheduled = true;
    const elapsed = performance.now() - bootStartedAt;
    const wait = force ? 0 : Math.max(0, MIN_SPLASH_MS - elapsed);
    setTimeout(hideSplash, wait);
  };

  // Guard against stuck splash screen
  setTimeout(() => scheduleHideSplash({ force: true }), 4500);

  // 1. Handle email magic-link callback first (userId/secret in query string)
  const consumed = await consumeMagicLinkFromUrl();
  if (consumed?.consumed) {
    showToast('Successfully signed in!', 'success');
  } else if (consumed?.error) {
    showToast(consumed.error, 'error');
  }
  
  // 3. Check auth & profile state in one go
  let session = null;
  try {
    session = await checkSession();
  } catch (error) {
    session = { user: null, profile: null, onboardingRequired: false, error };
  }
  currentUser = session.user;
  currentProfile = session.profile;

  scheduleHideSplash();

  if (!currentUser) {
    // Guest-only fallback (Google auth issues / MVP demo)
    enableGuestMode();
    currentUser = getGuestUser();
    currentProfile = getGuestProfile();
    await initMainApp();
    bootInProgress = false;
    return;
  }

  // Ensure guest flag doesn't affect real sessions
  disableGuestMode();

  if (session.onboardingRequired) {
    navigateTo('onboarding');
    initOnboardingView();
    bootInProgress = false;
    return;
  }

  // 4. Critical data failure check
  if (session.error) {
    showBlockingError({
      title: 'Profile load failed',
      message: 'We could not load your account data. This might be a network issue.',
      actionText: 'Retry',
      onAction: () => window.location.reload(),
    });
    bootInProgress = false;
    return;
  }

  if (!isGuestMode()) {
    // Validate Appwrite access for MVP collections/permissions
    try {
      await validateAppwriteMvp({ userId: currentUser.$id });
    } catch {
      bootInProgress = false;
      return;
    }
  }

  await initMainApp();
  bootInProgress = false;
}

let mainAppInitialized = false;
let realtimeSubscriptions = [];
let postComposerCleanup = null;
let globalGuardsInitialized = false;

async function initMainApp() {
  // Show app shell
  document.getElementById('app-shell').classList.remove('hidden');
  document.getElementById('app-shell').classList.add('flex');

  if (!mainAppInitialized) {
    mainAppInitialized = true;
    // Setup global listeners
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  }

  hydrateShell(currentUser, currentProfile);

  // Reset per-session resources (logout/login without hard refresh must keep working)
  await teardownSessionResources();
  if (!isGuestMode()) {
    await setupRealtimeListeners(currentUser.$id);
    fetchUnreadCount(currentUser.$id);
  } else {
    fetchUnreadCount(currentUser.$id); // will no-op in guest mode
  }

  postComposerCleanup?.();
  postComposerCleanup = initPostComposer({ user: currentUser, profile: currentProfile });

  // Navigate to initial view
  const rawInitialView = window.location.hash.replace('#', '') || 'stage';
  const initialView = ['login', 'onboarding'].includes(rawInitialView) ? 'stage' : rawInitialView;
  navigateTo(initialView);

  if (window.lucide) window.lucide.createIcons();

  // First-time UX nudges (no dead ends)
  if (!localStorage.getItem('kalakar_welcomed')) {
    localStorage.setItem('kalakar_welcomed', 'true');
    showToast('Welcome! Tap + to create your first post.', 'success');
  }

  if (localStorage.getItem('kalakar_open_composer_once') === 'true') {
    localStorage.removeItem('kalakar_open_composer_once');
    openComposer({
      presetText: "Hi Kalakar! I'm new here — excited to connect and collaborate.",
    });
  }
}

async function handleLogout() {
  try {
    await teardownSessionResources();
    await logout();
    trackEvent('logout', {});
    
    // Hard reset state and redirect
    currentUser = null;
    currentProfile = null;
    window.location.hash = 'login';
    window.location.reload(); // Best way to ensure clean state after logout
  } catch (error) {
    window.location.reload();
  }
}

async function setupRealtimeListeners(userId) {
  try {
    const notifSub = await initNotificationListener(userId);
    realtimeSubscriptions = [notifSub].filter(Boolean);
  } catch (error) {
    console.warn('Realtime subscriptions failed to start:', error);
  }
}

async function teardownSessionResources() {
  const subs = realtimeSubscriptions;
  realtimeSubscriptions = [];
  await Promise.allSettled(subs.map(s => s?.close?.()));
  postComposerCleanup?.();
  postComposerCleanup = null;
}

function hydrateShell(user, profile) {
  const avatarUrl =
    profile?.avatarUrl || (profile?.avatarFileId ? getFilePreview(profile.avatarFileId) : '/assets/default-avatar.svg');
  const navAvatar = document.getElementById('nav-avatar');
  if (navAvatar) navAvatar.src = avatarUrl;
  const composerAvatar = document.getElementById('composer-avatar');
  if (composerAvatar) composerAvatar.src = avatarUrl;
}

function initGlobalGuards() {
  if (globalGuardsInitialized) return;
  globalGuardsInitialized = true;

  let guardRunning = false;
  const guardRoute = async () => {
    if (guardRunning) return;
    if (bootInProgress) return;
    guardRunning = true;
    try {
      const viewId = window.location.hash.replace('#', '') || 'stage';
      const isAuthView = viewId === 'login' || viewId === 'onboarding';

      if (!currentUser && !isAuthView) {
        navigateTo('login');
        initLoginView();
        return;
      }

      if (currentUser && isAuthView) {
        navigateTo('stage');
        return;
      }
    } finally {
      guardRunning = false;
    }
  };

  window.addEventListener('hashchange', guardRoute);
  window.addEventListener('popstate', guardRoute);

  window.addEventListener('offline', () => showToast('You are offline. Some features may not work.', 'warning'));
  window.addEventListener('online', () => showToast('Back online.', 'success'));

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection', e.reason);
    logError(e.reason, { area: 'unhandledrejection' });
  });

  window.addEventListener('error', (e) => {
    console.error('Unhandled error', e.error || e.message);
    logError(e.error || e.message, { area: 'error' });
  });
}
