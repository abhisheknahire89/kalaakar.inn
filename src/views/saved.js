import { mockData, getTimeAgo } from '../mockData.js';

let savedViewInitialized = false;

export function initSavedView() {
  if (savedViewInitialized) return;
  savedViewInitialized = true;

  // Initialize tabs
  document.querySelectorAll('[data-view="saved"] .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-view="saved"] .tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      const target = e.currentTarget.dataset.target;
      renderSavedContent(target);
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderSavedContent(type) {
  const container = document.getElementById('saved-content');
  let html = '';

  if (type === 'saved-posts') {
    html = `
      <div class="glass-panel rounded-xl p-4 flex gap-4 mb-4">
        <img src="https://picsum.photos/seed/saved1/200/200" class="w-20 h-20 rounded-lg object-cover">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <img src="https://picsum.photos/seed/aarav/50/50" class="w-6 h-6 rounded-full">
            <span class="text-sm font-medium text-white">Aarav Sharma</span>
          </div>
          <p class="text-xs text-muted line-clamp-2">Just wrapped up an amazing theatre workshop in Andheri! The energy was unreal...</p>
          <span class="text-xs text-gold mt-1 inline-block">Saved 2 days ago</span>
        </div>
        <button class="text-gold hover:text-white">
          <i data-lucide="bookmark" class="w-5 h-5 fill-current"></i>
        </button>
      </div>
      <div class="glass-panel rounded-xl p-4 flex gap-4 mb-4">
        <img src="https://picsum.photos/seed/saved2/200/200" class="w-20 h-20 rounded-lg object-cover">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <img src="https://picsum.photos/seed/priya/50/50" class="w-6 h-6 rounded-full">
            <span class="text-sm font-medium text-white">Priya Patel</span>
          </div>
          <p class="text-xs text-muted line-clamp-2">Testing out the new RED V-Raptor on a commercial shoot today...</p>
          <span class="text-xs text-gold mt-1 inline-block">Saved 5 days ago</span>
        </div>
        <button class="text-gold hover:text-white">
          <i data-lucide="bookmark" class="w-5 h-5 fill-current"></i>
        </button>
      </div>
    `;
  } else if (type === 'saved-jobs') {
    html = `
      <div class="glass-panel rounded-xl p-4 flex gap-4 mb-4">
        <div class="w-20 h-20 rounded-lg bg-surface flex items-center justify-center text-gold shrink-0">
          <i data-lucide="briefcase" class="w-8 h-8"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-white mb-1">Lead Actor for Indie Feature</h4>
          <p class="text-xs text-muted">Phantom Films | Mumbai, MH</p>
          <span class="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full mt-2 inline-block">Feature Film</span>
        </div>
        <button class="text-gold hover:text-white">
          <i data-lucide="bookmark" class="w-5 h-5 fill-current"></i>
        </button>
      </div>
      <div class="glass-panel rounded-xl p-4 flex gap-4 mb-4">
        <div class="w-20 h-20 rounded-lg bg-surface flex items-center justify-center text-gold shrink-0">
          <i data-lucide="video" class="w-8 h-8"></i>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-white mb-1">Freelance DOP for Music Video</h4>
          <p class="text-xs text-muted">T-Series | Hyderabad, TS</p>
          <span class="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full mt-2 inline-block">Music Video</span>
        </div>
        <button class="text-gold hover:text-white">
          <i data-lucide="bookmark" class="w-5 h-5 fill-current"></i>
        </button>
      </div>
    `;
  } else if (type === 'saved-profiles') {
    html = mockData.users.slice(0, 2).map(user => `
      <div class="glass-panel rounded-xl p-4 flex gap-4 mb-4">
        <img src="${user.avatarUrl}" class="w-16 h-16 rounded-full object-cover">
        <div class="flex-1">
          <h4 class="font-medium text-white">${user.name}</h4>
          <p class="text-xs text-gold">${user.primaryCraft}</p>
          <p class="text-xs text-muted">${user.headline}</p>
        </div>
        <button class="text-gold hover:text-white">
          <i data-lucide="bookmark" class="w-5 h-5 fill-current"></i>
        </button>
      </div>
    `).join('');
  }

  if (!html) {
    html = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center text-muted">
          <i data-lucide="bookmark" class="w-8 h-8"></i>
        </div>
        <h3 class="font-medium text-white mb-2">No saved items</h3>
        <p class="text-sm text-muted">Items you save will appear here</p>
      </div>
    `;
  }

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}
