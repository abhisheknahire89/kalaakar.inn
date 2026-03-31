import { mockData } from '../mockData.js';

export function initNetworkView() {
  const container = document.getElementById('network-content');
  container.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="network-grid"></div>';
  
  const grid = document.getElementById('network-grid');
  
  mockData.users.forEach(user => {
    grid.innerHTML += `
      <div class="glass-panel rounded-xl p-6 text-center transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5">
        <img src="${user.avatarUrl}" class="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-surface object-cover">
        <h3 class="font-medium text-white text-lg">${user.name}</h3>
        <p class="text-sm text-gold mb-1">${user.primaryCraft}</p>
        <p class="text-xs text-muted mb-4 line-clamp-1">${user.headline}</p>
        <div class="flex items-center justify-center gap-2 text-xs text-muted mb-6">
          <i data-lucide="map-pin" class="w-3 h-3"></i> ${user.city}, ${user.state}
        </div>
        <button class="btn-ghost border border-strong rounded-full w-full text-sm py-2 hover:bg-surface transition-colors flex items-center justify-center gap-2">
          <i data-lucide="user-plus" class="w-4 h-4"></i> Connect
        </button>
      </div>
    `;
  });

  if (window.lucide) window.lucide.createIcons();
}
