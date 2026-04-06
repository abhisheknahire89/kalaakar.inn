import { listCreators } from '../api/profile.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { navigateTo } from '../router.js';

let exploreBound = false;
let currentCraft = '';

export async function initExploreView() {
  const container = document.getElementById('explore-content');
  if (!container) return;

  renderExploreSkeleton(container);
  bindExploreInteractions(container);
  await loadDiscoveryData(container);
}

function bindExploreInteractions(container) {
  if (exploreBound) return;
  exploreBound = true;

  container.addEventListener('click', async (e) => {
    // Role-based Chip selection
    const chip = e.target.closest('.explore-chip');
    if (chip) {
      const craft = chip.getAttribute('data-craft') || '';
      document.querySelectorAll('.explore-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCraft = craft;
      await loadDiscoveryData(container);
      return;
    }

    // Artist navigation
    const artistCard = e.target.closest('.artist-card');
    if (artistCard) {
      const userId = artistCard.getAttribute('data-user-id');
      if (userId) navigateTo('profile', { userId });
      return;
    }
  });

  // Search logic
  const searchInput = document.getElementById('explore-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        await loadDiscoveryData(container, e.target.value);
      }, 500);
    });
  }
}

async function loadDiscoveryData(container, search = '') {
  const resultsArea = document.getElementById('discovery-results');
  if (!resultsArea) return;

  try {
    // 1. Fetch Top Rated Creators (Overall or by Craft)
    const topCreators = await listCreators({ 
      search, 
      craft: currentCraft, 
      limit: 10,
      minReliability: 0 
    });

    // 2. Fetch Curated Sections if no specific search
    let sections = [];
    if (!search && !currentCraft) {
      const roles = ['actor', 'editor', 'director', 'dop'];
      sections = await Promise.all(roles.map(async (role) => {
        const creators = await listCreators({ craft: role, limit: 5 });
        return { role, creators };
      }));
    }

    renderDiscoveryResults(resultsArea, topCreators, sections, search);
    if (window.lucide) window.lucide.createIcons();
  } catch (error) {
    console.error('Discovery load error:', error);
    resultsArea.innerHTML = `<div class="text-center text-muted py-12">Unable to load discovery.</div>`;
  }
}

function renderExploreSkeleton(container) {
  container.innerHTML = `
    <!-- Top Search & Filter Bar -->
    <div class="sticky top-0 z-20 pb-6 pt-2 bg-void/80 backdrop-blur-md px-2">
      <div class="relative group mb-6">
        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-gold transition-colors"></i>
        <input type="text" id="explore-search" class="w-full bg-surface border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gold/40 transition-all font-medium" placeholder="Search by name, craft, or skill...">
      </div>

      <div class="flex gap-2 overflow-x-auto no-scrollbar">
        <button class="explore-chip active" data-craft="">All Talent</button>
        <button class="explore-chip" data-craft="actor">🎭 Actors</button>
        <button class="explore-chip" data-craft="director">🎬 Directors</button>
        <button class="explore-chip" data-craft="editor">✂️ Editors</button>
        <button class="explore-chip" data-craft="dop">📷 DOPs</button>
        <button class="explore-chip" data-craft="dancer">💃 Dancers</button>
      </div>
    </div>

    <div id="discovery-results" class="space-y-10 mt-4 px-2">
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-40 bg-surface rounded-md"></div>
        <div class="grid grid-cols-2 gap-4">
          <div class="h-40 bg-surface rounded-2xl"></div>
          <div class="h-40 bg-surface rounded-2xl"></div>
        </div>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();
}

function renderDiscoveryResults(container, topCreators, sections, isSearching) {
  if (topCreators.length === 0 && sections.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20 px-6">
        <div class="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center text-muted opacity-50">
          <i data-lucide="users-2" class="w-8 h-8"></i>
        </div>
        <h3 class="text-white font-bold text-lg mb-1">No talent found</h3>
        <p class="text-sm text-muted">Refine your discovery criteria.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- MAIN RESULTS / TOP RATED -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-white">${isSearching ? 'Search Results' : 'Top Rated Creators'}</h3>
        <span class="text-[10px] uppercase tracking-widest text-gold font-bold">Verified Score ✦</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        ${topCreators.map(c => renderTalentTile(c)).join('')}
      </div>
    </section>

    <!-- ROLE SPECIFIC CURATED SECTIONS -->
    ${!isSearching ? sections.filter(s => s.creators.length > 0).map(s => `
      <section>
        <div class="flex items-center justify-between mb-4 mt-8">
          <h3 class="text-lg font-bold text-white capitalize">Elite ${escapeHtml(s.role)}s</h3>
          <button class="text-xs text-gold font-bold hover:underline">View All</button>
        </div>
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          ${s.creators.map(c => renderTalentCard(c)).join('')}
        </div>
      </section>
    `).join('') : ''}
  `;
}

function renderTalentTile(c) {
  const avatar = c.avatar || '/assets/default-avatar.svg';
  const reliability = c.reliability || 0;
  return `
    <div class="artist-card glass-panel rounded-2xl p-4 border-white/5 hover:border-gold/30 transition-all cursor-pointer group active:scale-95" data-user-id="${c.userId}">
      <div class="relative w-16 h-16 mx-auto mb-3">
        <img src="${avatar}" class="w-full h-full rounded-full object-cover border-2 border-gold/10 group-hover:border-gold/40 shadow-lg">
        <div class="absolute -bottom-1 -right-1 bg-gold text-void w-5 h-5 rounded-full flex items-center justify-center border-2 border-void">
          <i data-lucide="check" class="w-3 h-3 stroke-[3px]"></i>
        </div>
      </div>
      <div class="text-center">
        <div class="font-bold text-white text-sm truncate">${escapeHtml(c.name)}</div>
        <div class="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">${escapeHtml(c.primaryCraft || 'Artist')}</div>
        <div class="mt-2 flex items-center justify-center gap-1">
          <span class="text-[10px] text-gold font-bold">${reliability}%</span>
          <span class="text-[8px] text-muted uppercase tracking-tighter">Pro Score</span>
        </div>
      </div>
    </div>
  `;
}

function renderTalentCard(c) {
  const avatar = c.avatar || '/assets/default-avatar.svg';
  return `
    <div class="artist-card shrink-0 w-36 glass-panel rounded-2xl p-3 border-white/5 hover:border-gold/30 transition-all cursor-pointer group" data-user-id="${c.userId}">
      <div class="w-12 h-12 mb-3">
        <img src="${avatar}" class="w-full h-full rounded-full object-cover border border-gold/20 grayscale group-hover:grayscale-0 transition-all">
      </div>
      <div class="font-bold text-white text-xs truncate">${escapeHtml(c.name)}</div>
      <div class="text-[8px] text-gold font-bold uppercase tracking-widest mt-0.5 mt-1">${escapeHtml(c.city || 'Mumbai')}</div>
    </div>
  `;
}
