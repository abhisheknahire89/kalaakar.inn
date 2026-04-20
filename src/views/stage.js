import { getTimeAgo } from '../utils/time.js';
import { getPostMediaViewUrl, listFeedPosts } from '../api/posts.js';
import { escapeHtml, safeUrl } from '../utils/escapeHtml.js';
import { openComposer } from '../domBindings.js';
import { openHireFlow } from '../components/hireFlow.js';
import { navigateTo } from '../router.js';
import { savePost, unsavePost, isFollowing } from '../api/social.js';
import { incrementPostView } from '../api/posts.js';
import { showToast } from '../components/toast.js';

let stageBound = false;
let stageObserver = null;
let viewTrackedPosts = new Set();

export function initStageView() {
  bindStageInteractions();
  loadFeed();
}

function bindStageInteractions() {
  if (stageBound) return;
  stageBound = true;

  const feed = document.getElementById('stage-feed');
  if (!feed) return;

  feed.addEventListener('click', (e) => {
    // Handle Hire Button click
    const hireBtn = e.target?.closest?.('.js-open-hire');
    if (hireBtn) {
      const creatorId = hireBtn.getAttribute('data-creator-id') || '';
      const creatorName = hireBtn.getAttribute('data-creator-name') || '';
      const postId = hireBtn.getAttribute('data-post-id') || '';
      openHireFlow({ creatorId, creatorName, postId });
      return;
    }

    // Handle Profile click
    const profileBtn = e.target?.closest?.('.js-open-profile');
    if (profileBtn) {
      const userId = profileBtn.getAttribute('data-user-id') || '';
      const sourcePostId = profileBtn.getAttribute('data-post-id') || '';
      if (!userId) return;
      navigateTo('profile', { userId, sourcePostId });
      return;
    }

    // Handle Save/Bookmark
    const saveBtn = e.target?.closest?.('.js-save-post');
    if (saveBtn) {
      const postId = saveBtn.getAttribute('data-post-id');
      if (!postId) return;
      handleSaveToggle(saveBtn, postId);
      return;
    }
  });

  // IntersectionObserver handles autoplay/pause + view tracking
}

async function handleSaveToggle(btn, postId) {
  const icon = btn.querySelector('i');
  const isSaved = btn.classList.contains('is-saved');
  
  try {
    if (isSaved) {
      await unsavePost(postId);
      btn.classList.remove('is-saved');
      if (icon) icon.classList.remove('fill-gold');
      showToast('Removed from saved items.', 'neutral');
    } else {
      await savePost(postId);
      btn.classList.add('is-saved');
      if (icon) icon.classList.add('fill-gold');
      showToast('Performance saved to your list! ✦', 'success');
    }
  } catch (error) {
    showToast(error.message || 'Action failed.', 'error');
  }
}

async function loadFeed() {
  const feedContainer = document.getElementById('stage-feed');
  if (!feedContainer) return;

  feedContainer.innerHTML = '';
  
  // Add skeletons
  for(let i=0; i<3; i++) {
    feedContainer.innerHTML += `
      <article class="post-outer">
        <div class="post-media-container skeleton"></div>
        <div class="post-creator-info">
          <div class="w-9 h-9 rounded-full skeleton"></div>
          <div>
            <div class="h-3 w-24 skeleton mb-1"></div>
            <div class="h-2 w-16 skeleton"></div>
          </div>
        </div>
      </article>
    `;
  }

  let posts = [];
  try {
    posts = await listFeedPosts({ limit: 30 });
  } catch (error) {
    console.warn('Feed load error:', error);
    feedContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-center h-full">
        <p class="text-muted mb-4">Stage is currently dark.</p>
        <button id="feed-refresh-btn" class="btn-gold px-8 py-2 rounded-full">Refresh</button>
      </div>
    `;
    document.getElementById('feed-refresh-btn')?.addEventListener('click', () => window.location.reload(), { once: true });
    return;
  }

  feedContainer.innerHTML = '';
  if (posts.length === 0) {
    feedContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-center h-full">
        <div class="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6 opacity-40">
          <i data-lucide="video-off" class="w-10 h-10"></i>
        </div>
        <h3 class="text-xl font-bold mb-2">No performances yet</h3>
        <p class="text-muted mb-8">Be the first to showcase your talent on the global stage.</p>
        <button id="empty-create-btn" class="btn-gold px-12 py-3 rounded-full font-bold">Post Talent ✦</button>
      </div>
    `;
    document.getElementById('empty-create-btn')?.addEventListener('click', openComposer);
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const sortedPosts = prioritizePosts(posts);
  sortedPosts.forEach(post => {
    const postType = getPostType(post);
    const mediaUrl = post.mediaUrl || getPostMediaViewUrl(post.mediaFileId);
    const avatar = safeUrl(post.authorAvatar) || '/assets/default-avatar.svg';
    const creatorId = post.authorId || post.userId || '';
    const timeAgo = getTimeAgo(post.$createdAt);
    const postText = post.content || post.text || '';
    
    feedContainer.innerHTML += renderPostShell({
      postType,
      mediaUrl,
      avatar,
      creatorId,
      creatorName: post.authorName || 'Kalakar User',
      postId: post.$id || '',
      authorName: post.authorName || 'Kalakar User',
      authorHeadline: post.authorHeadline || 'Digital Artist',
      timeAgo,
      postText,
      applaudCount: post.applaudCount || 0,
      commentCount: post.commentCount || 0,
      viewCount: post.viewCount || 0,
    });
  });

  feedContainer.classList.add('feed-fade-in');
  if (window.lucide) window.lucide.createIcons();
  setupAutoplayObserver(feedContainer);
}

function setupAutoplayObserver(feedEl) {
  try {
    stageObserver?.disconnect?.();
  } catch {
    // ignore
  }

  stageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const article = entry.target;
        const video = article.querySelector('video');
        const postId = article.getAttribute('data-post-id');

        if (entry.isIntersecting && entry.intersectionRatio >= 0.72) {
          if (video && video.paused) video.play().catch(() => {});
          if (postId && !viewTrackedPosts.has(postId)) {
            viewTrackedPosts.add(postId);
            incrementPostView(postId);
          }
        } else {
          if (video && !video.paused) video.pause();
        }
      });
    },
    {
      root: feedEl,
      threshold: [0, 0.4, 0.72, 1],
    }
  );

  feedEl.querySelectorAll('article.post-outer').forEach((a) => stageObserver.observe(a));
}

function getPostType(post) {
  const t = (post.postType || post.type || '').toLowerCase();
  if (t === 'video' || t === 'image' || t === 'text') return t;
  return (post.mediaUrl || post.mediaFileId) ? 'video' : 'text';
}

function prioritizePosts(posts) {
  const score = (p) => (getPostType(p) === 'video' ? 0 : 1);
  return [...posts].sort((a, b) => score(a) - score(b));
}

function renderPostShell({
  postType,
  mediaUrl,
  avatar,
  creatorId,
  creatorName,
  postId,
  authorName,
  authorHeadline,
  timeAgo,
  postText,
  applaudCount,
  commentCount,
  viewCount,
}) {
  const isVideo = postType === 'video';
  const isImage = postType === 'image';
  const hasMedia = !!mediaUrl;
  
  return `
    <article class="post-outer" data-post-id="${postId}">
      <!-- Media Layer -->
      <div class="post-media-container">
        ${isVideo ? `
          ${hasMedia ? `
            <video class="post-video" src="${mediaUrl}" loop playsinline muted autoplay></video>
          ` : `
            <div class="w-full h-full flex items-center justify-center bg-surface">
              <div class="flex flex-col items-center gap-2 opacity-70">
                <i data-lucide="play-circle" class="w-12 h-12 text-gold"></i>
                <div class="text-xs text-muted">Video preview (guest)</div>
              </div>
            </div>
          `}
        ` : isImage ? `
          ${hasMedia ? `
            <img class="w-full h-full object-cover" src="${mediaUrl}" alt="Post">
          ` : `
            <div class="w-full h-full flex items-center justify-center bg-surface">
              <div class="flex flex-col items-center gap-2 opacity-70">
                <i data-lucide="image" class="w-12 h-12 text-gold"></i>
                <div class="text-xs text-muted">Image preview (guest)</div>
              </div>
            </div>
          `}
        ` : `
          <div class="w-full h-full flex items-center justify-center p-8 bg-surface">
            <p class="text-xl font-medium text-center leading-relaxed">"${escapeHtml(postText)}"</p>
          </div>
        `}
      </div>

      <!-- Overlay Layer -->
      <div class="post-overlay">
        <!-- Top: Creator Info -->
        <button class="post-creator-info js-open-profile" data-user-id="${escapeHtml(creatorId)}" data-post-id="${escapeHtml(postId)}">
          <img src="${avatar}" class="post-creator-avatar" alt="${escapeHtml(authorName)}">
          <div class="post-creator-details">
            <div class="post-creator-name">${escapeHtml(authorName)}</div>
            <div class="post-creator-headline">${escapeHtml(authorHeadline)} • ${escapeHtml(timeAgo)}</div>
          </div>
        </button>

        <!-- Right Side: Action Stack -->
        <div class="post-action-sidebar">
          <button class="post-sidebar-action">
            <div class="post-sidebar-icon"><i data-lucide="award"></i></div>
            <span class="post-sidebar-label">Vouch</span>
          </button>
          
          <button class="post-sidebar-action">
            <div class="post-sidebar-icon"><i data-lucide="message-square"></i></div>
            <span class="post-sidebar-label">Inquiry</span>
          </button>

          <button class="post-sidebar-action js-save-post" data-post-id="${postId}">
            <div class="post-sidebar-icon"><i data-lucide="bookmark"></i></div>
            <span class="post-sidebar-label">Save</span>
          </button>
          
          <button class="post-sidebar-action">
            <div class="post-sidebar-icon"><i data-lucide="share-2"></i></div>
            <span class="post-sidebar-label">Share</span>
          </button>

          ${creatorId ? `
            <button class="post-sidebar-action js-open-hire" data-creator-id="${escapeHtml(creatorId)}" data-creator-name="${escapeHtml(creatorName)}" data-post-id="${escapeHtml(postId)}">
              <div class="post-sidebar-icon is-hire"><i data-lucide="briefcase"></i></div>
              <span class="post-sidebar-label">Hire</span>
            </button>
          ` : ''}
        </div>

        <!-- Bottom: Caption Overlay -->
        <div class="post-caption-overlay">
          ${(isVideo || isImage) ? `
            <p class="post-caption-text">
              <span class="font-bold mr-2">@${escapeHtml(authorName).toLowerCase().replace(/\s/g, '')}</span>
              ${escapeHtml(postText)}
            </p>
          ` : ''}
          <div class="flex items-center gap-4 mt-2">
            <div class="flex items-center gap-1 opacity-80">
              <i data-lucide="eye" class="w-3 h-3"></i>
              <span class="text-[10px] uppercase tracking-widest">${viewCount || 0}</span>
            </div>
            <div class="flex items-center gap-1 opacity-80">
              <i data-lucide="music" class="w-3 h-3"></i>
              <div class="text-[10px] uppercase tracking-widest overflow-hidden whitespace-nowrap">Original Talent • kalakar.in</div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}
