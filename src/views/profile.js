import { currentProfile } from '../app.js';
import { getFilePreview } from '../auth.js';
import { mockData } from '../mockData.js';

export function initProfileView() {
  const container = document.getElementById('profile-content');
  
  let profile = currentProfile;
  let avatarUrl = '/assets/default-avatar.svg';
  let coverUrl = '';

  if (profile) {
    avatarUrl = profile.avatarUrl || getFilePreview(profile.avatarFileId);
    coverUrl = profile.coverUrl || (profile.coverFileId ? getFilePreview(profile.coverFileId, 1200, 400) : '');
  } else {
    profile = mockData.profile;
    avatarUrl = profile.avatarUrl;
  }

  container.innerHTML = `
    <div class="glass-panel rounded-xl overflow-hidden mb-6">
      <div class="h-48 bg-surface relative ${coverUrl ? '' : 'bg-gradient-to-r from-gray-800 to-gray-900'}">
        ${coverUrl ? `<img src="${coverUrl}" class="w-full h-full object-cover">` : ''}
      </div>
      <div class="px-6 pb-6 relative">
        <div class="flex justify-between items-end -mt-12 mb-4">
          <img src="${avatarUrl}" class="w-24 h-24 rounded-full border-4 border-void object-cover bg-surface">
          <button class="btn-ghost border border-strong rounded-full px-4 py-1.5 text-sm hover:bg-surface transition-colors">Edit Profile</button>
        </div>
        <h2 class="text-2xl font-poppins font-bold text-white">${profile.name}</h2>
        <p class="text-gold mb-2 text-sm">${(profile.primaryCraft || '').toUpperCase()} • ${profile.city}, ${profile.state}</p>
        <p class="text-gray-300 mb-4 text-sm">${profile.headline || 'No headline provided.'}</p>
        <p class="text-muted mb-6 text-sm leading-relaxed">${profile.bio || ''}</p>
        
        <div class="flex gap-6 text-sm border-t border-strong pt-4">
          <div><span class="font-bold text-white">${profile.vouchCount || 0}</span> <span class="text-muted">Vouches</span></div>
          <div><span class="font-bold text-white">${profile.profileViews || 0}</span> <span class="text-muted">Views</span></div>
          <div><span class="font-bold text-white">${profile.impressions || 0}</span> <span class="text-muted">Impressions</span></div>
        </div>
      </div>
    </div>

    <div class="flex gap-6 border-b border-strong mb-6 overflow-x-auto no-scrollbar pb-2">
      <button class="text-gold border-b-2 border-gold pb-2 font-medium whitespace-nowrap">The Stage</button>
      <button class="text-muted hover:text-white pb-2 transition-colors whitespace-nowrap">Credits</button>
      <button class="text-muted hover:text-white pb-2 transition-colors whitespace-nowrap">About</button>
      <button class="text-muted hover:text-white pb-2 transition-colors whitespace-nowrap">Vouches</button>
    </div>

    <div id="profile-tabs-content" class="min-h-[200px]">
      <div class="glass-panel rounded-xl p-6 text-center">
        <div class="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center text-muted">
          <i data-lucide="image" class="w-6 h-6"></i>
        </div>
        <h3 class="font-medium text-white mb-2">No posts yet</h3>
        <p class="text-sm text-muted">When you share your craft, it will appear here.</p>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
