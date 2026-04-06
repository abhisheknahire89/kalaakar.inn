import { currentUser } from '../app.js';
import { getProfile } from '../api/profile.js';
import { listCreatorPosts } from '../api/posts.js';
import { listCreatorVouches } from '../api/vouches.js';
import { listCreatorCredits } from '../api/credits.js';
import { getRouteState, navigateTo } from '../router.js';
import { escapeHtml, safeUrl } from '../utils/escapeHtml.js';
import { openHireFlow } from '../components/hireFlow.js';
import { showToast } from '../components/toast.js';
import { followUser, unfollowUser, isFollowing } from '../api/social.js';

let profileBound = false;

export async function initProfileView() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  const state = getRouteState() || {};
  const userId = state.userId || currentUser?.$id;

  if (!userId) {
    container.innerHTML = `<div class="text-center text-muted py-20 px-6">Sign in to view professional portfolios.</div>`;
    return;
  }

  container.innerHTML = `<div class="text-center text-muted py-20 animate-pulse">Loading verified portfolio...</div>`;

  try {
    const [profile, posts, vouches, credits, following] = await Promise.all([
      getProfile(userId),
      listCreatorPosts(userId, { limit: 15 }),
      listCreatorVouches(userId, { limit: 12 }),
      listCreatorCredits(userId, { limit: 20 }),
      currentUser?.$id && userId !== currentUser.$id ? isFollowing(userId) : Promise.resolve(false),
    ]);

    if (!profile) throw new Error('Missing profile');
    renderProfessionalPortfolio(container, profile, posts, vouches, credits, { following });
    
    if (!profileBound) {
      profileBound = true;
      bindPortfolioActions(container);
    }

    if (window.lucide) window.lucide.createIcons();
  } catch (error) {
    container.innerHTML = `<div class="text-center text-muted py-20">Portfolio not public or found.</div>`;
  }
}

function renderProfessionalPortfolio(container, profile, posts, vouches, credits, { following = false } = {}) {
  const isMine = currentUser?.$id && (profile.userId || profile.$id) === currentUser.$id;
  const avatar = safeUrl(profile.avatar) || '/assets/default-avatar.svg';
  const reliability = profile.reliability || 0;
  const creatorUserId = profile.userId || profile.$id;
  const followLabel = following ? 'Following' : 'Connect';

  container.innerHTML = `
    <!-- Portfolio Header: PRO IDENTITY -->
    <div class="glass-panel rounded-[2rem] p-8 mb-10 border-gold/10 relative overflow-hidden bg-gradient-to-br from-gold/5 via-transparent to-transparent">
      <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div class="relative shrink-0">
          <div class="w-32 h-32 rounded-3xl overflow-hidden border-4 border-gold/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <img src="${avatar}" class="w-full h-full object-cover">
          </div>
          <div class="absolute -top-3 -right-3 bg-gold text-void px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest border-[4px] border-void animate-pulse">PRO</div>
        </div>

        <div class="flex-1 text-center md:text-left">
          <div class="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 class="text-4xl font-bold text-white tracking-tight">${escapeHtml(profile.name)}</h1>
            <div class="flex items-center gap-1.5 px-4 py-1 bg-gold/10 text-gold rounded-full text-xs font-bold border border-gold/20 backdrop-blur-md">
              <i data-lucide="award" class="w-3.5 h-3.5 fill-gold"></i>
              <span>RELIABILITY: ${reliability}%</span>
            </div>
          </div>
          <p class="text-xl text-gold font-medium mb-3 uppercase tracking-wider">${escapeHtml(profile.headline || 'Creative Talent')}</p>
          <div class="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-muted font-bold tracking-widest uppercase opacity-70">
            <div class="flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3 h-3"></i> ${escapeHtml(profile.city || 'GLOBAL')}</div>
            <div class="flex items-center gap-1.5"><i data-lucide="activity" class="w-3 h-3"></i> ${escapeHtml(profile.experience || '0')} YEARS EXP</div>
          </div>
        </div>

        <div class="flex flex-col gap-3 w-full md:w-auto">
          ${!isMine ? `
            <button class="btn-gold px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-gold/20 js-hire-main" data-user-id="${escapeHtml(creatorUserId)}" data-name="${escapeHtml(profile.name)}">Hire Artist ✦</button>
            <button class="btn-ghost border border-white/10 px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-gold/5 js-follow" data-user-id="${escapeHtml(creatorUserId)}">${escapeHtml(followLabel)}</button>
          ` : `
            <button id="edit-profile-btn" class="btn-ghost border border-gold/30 text-gold px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest">Update Credentials</button>
          `}
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="glass-panel rounded-2xl p-2 mb-8 flex gap-2">
      <button class="profile-tab-btn flex-1 pill-tab active" data-tab="posts">Posts</button>
      <button class="profile-tab-btn flex-1 pill-tab" data-tab="vouches">Vouches</button>
      <button class="profile-tab-btn flex-1 pill-tab" data-tab="credits">Credits</button>
    </div>

    <!-- Portfolio Sections -->
    <div class="space-y-12">
      <!-- CENTERPIECE: VIDEO GRID -->
      <section id="profile-tab-posts">
        <div class="flex items-center justify-between mb-6 px-2">
          <div class="flex items-center gap-4">
            <h3 class="text-xs font-bold uppercase tracking-[0.25em] text-white">Performances</h3>
            <div class="h-px w-20 bg-gold/20"></div>
          </div>
          <button class="text-[10px] font-bold text-gold opacity-50 hover:opacity-100 transition-opacity">GRID VIEW</button>
        </div>
        <div class="grid grid-cols-3 gap-2 md:gap-3">
          ${posts.map(p => renderPortfolioThumb(p)).join('')}
          ${posts.length === 0 ? `<div class="col-span-3 py-20 text-center glass-panel rounded-3xl opacity-40 text-xs font-bold uppercase tracking-widest">No verified work shared</div>` : ''}
        </div>
      </section>

      <!-- VOUCH WALL: TESTIMONIALS -->
      <section id="profile-tab-vouches" class="hidden">
        <div class="flex items-center gap-4 mb-6 px-2">
          <h3 class="text-xs font-bold uppercase tracking-[0.25em] text-white">Vouch Wall</h3>
          <div class="h-px w-20 bg-gold/20"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${vouches.map(v => renderVouchCard(v)).join('')}
          ${vouches.length === 0 ? `<div class="col-span-2 text-muted text-xs opacity-50 px-2 italic font-medium">Verified professional vouches appear here after completions.</div>` : ''}
        </div>
      </section>

      <!-- CREDITS -->
      <section id="profile-tab-credits" class="hidden">
        <div class="flex items-center gap-4 mb-6 px-2">
          <h3 class="text-xs font-bold uppercase tracking-[0.25em] text-white">Credits</h3>
          <div class="h-px w-20 bg-gold/20"></div>
        </div>
        <div class="space-y-3">
          ${credits.map(c => renderCreditStrip(c)).join('')}
          ${credits.length === 0 ? `
            <div class="glass-panel rounded-2xl p-6 text-center text-sm text-muted">
              No credits listed yet.
              <div class="mt-4">
                <button class="btn-gold px-6 py-2 rounded-full text-sm js-credits-cta">Create a post</button>
              </div>
            </div>
          ` : ''}
        </div>
      </section>
    </div>
  `;
}

function renderPortfolioThumb(post) {
  const isVideo = (post.postType || '').toLowerCase() === 'video';
  return `
    <button class="js-profile-thumb aspect-[9/16] bg-surface rounded-2xl overflow-hidden border border-white/5 relative group cursor-pointer active:scale-95 transition-all w-full" data-post-id="${escapeHtml(post.$id || '')}" aria-label="Open post">
      ${post.mediaUrl ? `
        <img src="${post.mediaUrl}" class="w-full h-full object-cover brightness-75 group-hover:scale-110 transition-transform duration-1000">
      ` : `<div class="w-full h-full flex items-center justify-center p-4 text-[10px] text-muted text-center">${escapeHtml(post.content || '')}</div>`}
      ${isVideo ? `<i data-lucide="play" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-40 group-hover:opacity-100 transition-opacity"></i>` : ''}
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="absolute bottom-3 left-3 right-3 text-[10px] font-bold text-white truncate">${escapeHtml(post.content || 'Performance')}</div>
      </div>
    </button>
  `;
}

function renderVouchCard(v) {
  return `
    <div class="glass-panel p-5 rounded-2xl border-gold/5 bg-gold/[0.02]">
      <div class="flex items-center gap-1 mb-2">
        ${[1,2,3,4,5].map(n => `<i data-lucide="star" class="w-3 h-3 ${n <= (v.rating || 5) ? 'fill-gold text-gold' : 'text-muted'}"></i>`).join('')}
      </div>
      <p class="text-sm text-gray-200 italic leading-relaxed mb-3">"${escapeHtml(v.note || 'Excellent professional experience.')}"</p>
      <div class="text-[10px] text-gold font-bold uppercase tracking-widest">— Verified Employer</div>
    </div>
  `;
}

function bindPortfolioActions(container) {
  container.addEventListener('click', (e) => {
    const hireBtn = e.target.closest('.js-hire-main');
    if (hireBtn) {
      const creatorId = hireBtn.getAttribute('data-user-id');
      const creatorName = hireBtn.getAttribute('data-name');
      openHireFlow({ creatorId, creatorName });
      return;
    }

    const followBtn = e.target.closest('.js-follow');
    if (followBtn) {
      const targetId = followBtn.getAttribute('data-user-id');
      if (!targetId) return;
      toggleFollow(followBtn, targetId);
      return;
    }

    const tabBtn = e.target.closest('.profile-tab-btn');
    if (tabBtn) {
      const tab = tabBtn.getAttribute('data-tab') || 'posts';
      switchTab(container, tab);
      return;
    }

    const thumb = e.target.closest('.js-profile-thumb');
    if (thumb) {
      navigateTo('stage');
      return;
    }

    if (e.target?.closest?.('.js-credits-cta')) {
      navigateTo('stage');
    }
  });
}

async function toggleFollow(btn, targetId) {
  if (!currentUser?.$id) return showToast('Sign in to connect.', 'warning');
  const wasFollowing = btn.textContent?.toLowerCase().includes('following');
  btn.disabled = true;
  try {
    if (wasFollowing) {
      await unfollowUser(targetId);
      btn.textContent = 'Connect';
      showToast('Disconnected.', 'neutral');
    } else {
      await followUser(targetId);
      btn.textContent = 'Following';
      showToast('Connected. You’ll see their updates.', 'success');
    }
  } catch (e) {
    showToast(e?.message || 'Connection failed.', 'error');
  } finally {
    btn.disabled = false;
  }
}

function switchTab(container, tab) {
  container.querySelectorAll('.profile-tab-btn').forEach((b) => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
  const posts = container.querySelector('#profile-tab-posts');
  const vouches = container.querySelector('#profile-tab-vouches');
  const credits = container.querySelector('#profile-tab-credits');
  if (posts) posts.classList.toggle('hidden', tab !== 'posts');
  if (vouches) vouches.classList.toggle('hidden', tab !== 'vouches');
  if (credits) credits.classList.toggle('hidden', tab !== 'credits');
}

function renderCreditStrip(c) {
  const title = c.projectTitle || c.title || c.project || 'Project';
  const role = c.role || c.roleRequired || c.position || 'Role';
  const year = c.year || c.date || '';
  return `
    <div class="glass-panel p-5 rounded-2xl border-white/5 flex items-center justify-between">
      <div>
        <div class="text-white font-bold text-sm tracking-tight">${escapeHtml(title)}</div>
        <div class="text-[10px] text-muted font-bold uppercase tracking-widest mt-1.5">${escapeHtml(role)} ${year ? `• ${escapeHtml(year)}` : ''}</div>
      </div>
      <i data-lucide="clapperboard" class="w-4 h-4 text-gold opacity-70"></i>
    </div>
  `;
}
