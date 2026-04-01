export function navigateTo(viewId) {
  // Hide all views
  document.querySelectorAll('.view').forEach(el => {
    el.classList.add('hidden');
  });

  // Update URL hash without triggering hashchange
  if (window.location.hash !== `#${viewId}`) {
    history.pushState(null, null, `#${viewId}`);
  }

  // Show target view
  const targetView = document.querySelector(`[data-view="${viewId}"]`);
  if (targetView) {
    targetView.classList.remove('hidden');
    
    // Manage App Shell visibility
    const appShell = document.getElementById('app-shell');
    if (['login', 'onboarding'].includes(viewId)) {
      appShell.classList.add('hidden');
      appShell.classList.remove('flex');
    } else {
      appShell.classList.remove('hidden');
      appShell.classList.add('flex');
      
      // Update active nav links
      document.querySelectorAll('.nav-link, .nav-item').forEach(link => {
        link.classList.remove('active', 'text-gold');
        if (link.getAttribute('href') === `#${viewId}`) {
          link.classList.add('active', 'text-gold');
        }
      });
    }
  }

  // Lazy load view logic
  if (viewId === 'stage') import('./views/stage.js').then(m => m.initStageView());
  if (viewId === 'profile') import('./views/profile.js').then(m => m.initProfileView());
  if (viewId === 'network') import('./views/network.js').then(m => m.initNetworkView());
  if (viewId === 'jobs') import('./views/jobs.js').then(m => m.initJobsView());
  if (viewId === 'messages') import('./views/messages.js').then(m => m.initMessagesView());
  if (viewId === 'notifications') import('./views/notifications.js').then(m => m.initNotificationsView());
  if (viewId === 'settings') import('./views/settings.js').then(m => m.initSettingsView());
  if (viewId === 'search') import('./views/search.js').then(m => m.initSearchView());
  if (viewId === 'saved') import('./views/saved.js').then(m => m.initSavedView());
}

let routerInitialized = false;

export function initRouter() {
  if (routerInitialized) return;
  routerInitialized = true;
  window.addEventListener('hashchange', () => {
    const viewId = window.location.hash.replace('#', '') || 'stage';
    navigateTo(viewId);
  });
}
