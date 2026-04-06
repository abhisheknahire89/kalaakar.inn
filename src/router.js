let currentRouteState = null;

export function getRouteState() {
  return currentRouteState;
}

export function navigateTo(viewId, state = null) {
  // Unknown routes should never strand the user on a blank screen
  const hasTarget = !!document.querySelector(`[data-view="${viewId}"]`);
  if (!hasTarget) {
    const fallback = document.querySelector('[data-view="stage"]') ? 'stage' : 'login';
    viewId = fallback;
    state = null;
    history.replaceState(null, null, `#${viewId}`);
    renderView(viewId, null);
    return;
  }

  if (window.location.hash !== `#${viewId}` || history.state !== state) {
    history.pushState(state, null, `#${viewId}`);
  }
  renderView(viewId, state);
}

function renderView(viewId, state) {
  currentRouteState = state || null;
  const navViewId = viewId === 'deal' ? 'deals-list' : viewId;

  // Hide all views
  document.querySelectorAll('.view').forEach(el => {
    el.classList.add('hidden');
  });

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
        if (link.getAttribute('href') === `#${navViewId}`) {
          link.classList.add('active', 'text-gold');
        }
      });
    }
  }

  // Lazy load view logic
  if (viewId === 'stage') import('./views/stage.js').then(m => m.initStageView());
  if (viewId === 'explore') import('./views/explore.js').then(m => m.initExploreView());
  if (viewId === 'profile') import('./views/profile.js').then(m => m.initProfileView());
  if (viewId === 'deals-list') import('./views/dealsView.js').then(m => m.initDealsListView());
  if (viewId === 'deal') import('./views/dealRoom.js').then(m => m.initDealRoomView());
}

let routerInitialized = false;

export function initRouter() {
  if (routerInitialized) return;
  routerInitialized = true;

  const syncFromUrl = () => {
    const viewId = window.location.hash.replace('#', '') || 'stage';
    renderView(viewId, history.state);
  };

  window.addEventListener('hashchange', syncFromUrl);
  // Back/forward navigation with history.pushState triggers popstate (not hashchange)
  window.addEventListener('popstate', (e) => {
    const viewId = window.location.hash.replace('#', '') || 'stage';
    renderView(viewId, e.state);
  });
}
