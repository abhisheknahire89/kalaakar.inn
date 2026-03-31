import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwriteClient.js';
import { showToast } from '../components/toast.js';
import { mockData, getTimeAgo } from '../mockData.js';

export function initStageView() {
  loadFeed();
}

async function loadFeed() {
  const feedContainer = document.getElementById('stage-feed');
  feedContainer.innerHTML = ''; // Clear existing
  feedContainer.classList.add('snap-y', 'snap-mandatory', 'h-[calc(100vh-120px)]', 'overflow-y-auto', 'no-scrollbar');
  
  // Add skeletons
  for(let i=0; i<3; i++) {
    feedContainer.innerHTML += `
      <div class="snap-start h-full w-full flex items-center justify-center p-4">
        <div class="glass-panel rounded-xl p-4 w-full max-w-lg h-[80vh] flex flex-col">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full skeleton"></div>
            <div class="flex-1">
              <div class="h-4 w-32 skeleton mb-2"></div>
              <div class="h-3 w-24 skeleton"></div>
            </div>
          </div>
          <div class="w-full flex-1 skeleton rounded-lg mb-4"></div>
          <div class="flex gap-4">
            <div class="h-8 w-16 skeleton rounded-full"></div>
            <div class="h-8 w-16 skeleton rounded-full"></div>
          </div>
        </div>
      </div>
    `;
  }

  let posts = [];
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.POSTS, [
      Query.orderDesc('createdAt'),
      Query.limit(10)
    ]);
    posts = result.documents;
  } catch (error) {
    console.warn('Feed load error, falling back to mock data:', error);
  }

  if (!posts || posts.length === 0) {
    posts = mockData.posts;
  }

  feedContainer.innerHTML = '';

  posts.forEach(post => {
    const avatar = post.authorAvatar || '/assets/default-avatar.svg';
    const timeAgo = getTimeAgo(post.createdAt);
    
    let mediaHtml = '';
    if (post.mediaUrl) {
      mediaHtml = `<img src="${post.mediaUrl}" class="w-full h-full object-cover rounded-lg" alt="Post media">`;
    } else if (post.mediaFileId) {
      mediaHtml = `<div class="bg-black rounded-lg h-full flex items-center justify-center text-muted border border-strong">Media attached</div>`;
    }

    feedContainer.innerHTML += `
      <div class="snap-start h-full w-full flex items-center justify-center p-2 md:p-4">
        <div class="glass-panel rounded-xl w-full max-w-lg h-[85vh] md:h-[80vh] flex flex-col relative overflow-hidden shadow-2xl">
          <!-- Media Background/Content -->
          <div class="absolute inset-0 z-0 bg-black">
            ${mediaHtml}
            <div class="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
          </div>
          
          <!-- Content Overlay -->
          <div class="relative z-10 flex flex-col h-full p-4 md:p-6 justify-between">
            <!-- Header -->
            <div class="flex items-center gap-3">
              <img src="${avatar}" class="w-12 h-12 rounded-full bg-surface object-cover border-2 border-gold/50 shadow-lg">
              <div class="drop-shadow-md">
                <div class="font-medium text-white text-lg">${post.authorName || 'Kalakar User'}</div>
                <div class="text-xs text-gray-300">${post.authorHeadline || 'Creator'} • ${timeAgo}</div>
              </div>
              <button class="ml-auto btn-ghost border border-white/30 text-white hover:bg-white/20 rounded-full px-4 py-1 text-sm backdrop-blur-md">Follow</button>
            </div>
            
            <!-- Footer / Actions -->
            <div class="mt-auto">
              <p class="mb-4 text-sm md:text-base leading-relaxed text-white drop-shadow-md line-clamp-3">${post.content}</p>
              
              <div class="flex items-center gap-6 pt-2">
                <button class="flex flex-col items-center gap-1 text-white hover:text-gold transition-colors group">
                  <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-gold/20 border border-white/20">
                    <i data-lucide="heart" class="w-5 h-5"></i>
                  </div>
                  <span class="text-xs font-medium">${post.applaudCount || 0}</span>
                </button>
                
                <button class="flex flex-col items-center gap-1 text-white hover:text-gold transition-colors group">
                  <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-gold/20 border border-white/20">
                    <i data-lucide="message-circle" class="w-5 h-5"></i>
                  </div>
                  <span class="text-xs font-medium">${post.commentCount || 0}</span>
                </button>
                
                <button class="flex flex-col items-center gap-1 text-white hover:text-gold transition-colors group ml-auto">
                  <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-gold/20 border border-white/20">
                    <i data-lucide="share-2" class="w-5 h-5"></i>
                  </div>
                  <span class="text-xs font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  if (window.lucide) window.lucide.createIcons();
}
