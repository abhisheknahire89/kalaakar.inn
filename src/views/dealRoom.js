import { currentUser } from '../app.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { showToast } from '../components/toast.js';
import { getRouteState, navigateTo } from '../router.js';
import { DEAL_STATUS, getDeal, listDealMessages, sendDealMessage, subscribeDealMessages, updateDealStatus } from '../api/deals.js';
import { logError, trackEvent } from '../observability/telemetry.js';

let dealRoomInitialized = false;
let subscription = null;
let currentDeal = null;

export async function initDealRoomView() {
  const container = document.getElementById('deal-room');
  if (!container) return;

  const state = getRouteState() || {};
  const dealId = state.dealId;
  if (!dealId) {
    container.innerHTML = emptyState('Oops! This deal seems to have vanished.');
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = `<div class="text-center text-muted py-12">Connecting to deal room...</div>`;

  try {
    currentDeal = await getDeal(dealId);
  } catch (error) {
    logError(error, { area: 'deal_load' });
    container.innerHTML = emptyState('Unable to load this deal. It may be private or expired.');
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  renderDealRoom(container, currentDeal);
  await hydrateMessages(container, dealId);
  setupRealtime(dealId);

  if (!dealRoomInitialized) {
    dealRoomInitialized = true;
    bindActionsOnce(container);
  }
}

function emptyState(message) {
  return `
    <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div class="w-20 h-20 rounded-full bg-surface border border-strong flex items-center justify-center text-muted mb-6">
        <i data-lucide="message-square-off" class="w-9 h-9"></i>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Deal Room</h3>
      <p class="text-muted mb-8 max-w-xs">${escapeHtml(message)}</p>
      <button onclick="location.hash='#stage'" class="btn-gold px-8 py-3 rounded-full font-semibold">Back to Feed</button>
    </div>
  `;
}

function renderDealRoom(container, deal) {
  const isCreator = currentUser?.$id === deal.creatorId;
  const status = deal.status || DEAL_STATUS.REQUESTED;

  container.innerHTML = `
    <!-- Header Card -->
    <div class="glass-panel rounded-2xl p-5 mb-6 border-gold/20 relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
      
      <div class="flex items-start justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] text-gold uppercase tracking-[0.2em] font-bold">Project Collaboration</span>
          </div>
          <h2 class="text-2xl font-bold text-white leading-tight">${escapeHtml(deal.projectTitle || 'Untitled Project')}</h2>
          <div class="text-sm text-muted mt-1 font-medium">${escapeHtml(deal.roleRequired || 'Talent')} Required</div>
        </div>
        <div class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold/30 bg-gold/5 text-gold">
          ${escapeHtml(status)}
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white/5 rounded-xl p-3 border border-white/5">
          <div class="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Location</div>
          <div class="text-sm text-white font-medium truncate">${escapeHtml(deal.location || 'Remote')}</div>
        </div>
        <div class="bg-white/5 rounded-xl p-3 border border-white/5">
          <div class="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Duration</div>
          <div class="text-sm text-white font-medium truncate">${escapeHtml(deal.duration || '—')}</div>
        </div>
        <div class="bg-white/5 rounded-xl p-3 border border-white/5">
          <div class="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Budget</div>
          <div class="text-sm text-white font-medium truncate">${escapeHtml(deal.budget || '—')}</div>
        </div>
        <div class="bg-white/5 rounded-xl p-3 border border-white/5">
          <div class="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Type</div>
          <div class="text-sm text-white font-medium truncate">${escapeHtml(deal.dealType || 'Project')}</div>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        ${renderStatusButtons({ status, isCreator })}
      </div>
    </div>

    <!-- Messages Container -->
    <div class="glass-panel rounded-2xl flex flex-col h-[60vh] overflow-hidden border-white/10">
      <div class="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs font-bold uppercase tracking-widest text-muted">Secure Collaboration Chat</span>
        </div>
      </div>
      
      <div id="deal-messages" class="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth">
        <div class="text-center text-muted py-10 opacity-50 text-xs">Waiting for messages...</div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-void/50 border-t border-white/10">
        <div class="flex items-center gap-3">
          <textarea id="deal-chat-input" class="bg-surface border border-white/10 text-white rounded-2xl px-4 py-3 text-sm flex-1 focus:outline-none focus:border-gold/50 resize-none no-scrollbar h-11" placeholder="Type a message..."></textarea>
          <button id="deal-send-btn" class="w-11 h-11 rounded-full bg-gold text-void flex items-center justify-center shrink-0 shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all">
            <i data-lucide="send" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Vouch Sidebar Overlay (Injected when completed) -->
    <div id="deal-vouch" class="hidden fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-center"></div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

function renderStatusButtons({ status, isCreator }) {
  if (status === DEAL_STATUS.REQUESTED && isCreator) {
    return `
      <button id="deal-accept-btn" class="btn-gold rounded-full px-8 py-2.5 text-sm font-bold shadow-lg shadow-gold/20">Accept Request</button>
      <button id="deal-reject-btn" class="btn-ghost border border-red-500/30 text-red-400 rounded-full px-8 py-2.5 text-sm font-bold">Decline</button>
    `;
  }
  if (status === DEAL_STATUS.ACCEPTED) {
    return `<button id="deal-start-btn" class="btn-gold rounded-full px-8 py-2.5 text-sm font-bold w-full md:w-auto">Start Project</button>`;
  }
  if (status === DEAL_STATUS.ACTIVE) {
    return `<button id="deal-complete-btn" class="btn-gold rounded-full px-8 py-2.5 text-sm font-bold w-full md:w-auto">Finish & Complete</button>`;
  }
  if (status === DEAL_STATUS.COMPLETED) {
    return `<div class="px-6 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-sm font-bold">✓ Project Completed</div>`;
  }
  return '';
}

async function hydrateMessages(container, dealId) {
  const list = container.querySelector('#deal-messages');
  if (!list) return;

  try {
    const docs = await listDealMessages(dealId, { limit: 80 });
    renderMessages(list, docs);
    list.scrollTop = list.scrollHeight;
  } catch (error) {
    logError(error, { area: 'deal_messages_list' });
  }
}

function renderMessages(list, docs) {
  if (docs.length === 0) return;
  list.innerHTML = '';
  docs.forEach((m) => {
    const mine = m.senderId === currentUser?.$id;
    list.innerHTML += `
      <div class="flex ${mine ? 'justify-end' : 'justify-start'} animate-fadeIn">
        <div class="max-w-[85%]">
          <div class="rounded-2xl px-4 py-2.5 ${mine ? 'bg-gold text-void font-medium' : 'bg-surface text-white border border-white/5'}">
            <div class="text-sm leading-relaxed">${escapeHtml(m.text || '')}</div>
          </div>
          <div class="text-[9px] text-muted mt-1 px-1 flex ${mine ? 'justify-end' : 'justify-start'}">
            ${escapeHtml(new Date(m.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
          </div>
        </div>
      </div>
    `;
  });
}

function setupRealtime(dealId) {
  subscription?.close?.();
  subscription = null;
  subscribeDealMessages(dealId, async () => {
    const container = document.getElementById('deal-room');
    if (!container) return;
    await hydrateMessages(container, dealId);
  }).then((sub) => {
    subscription = sub;
  }).catch((e) => {
    logError(e, { area: 'deal_messages_subscribe' });
  });
}

function bindActionsOnce(container) {
  container.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;

    const dealId = currentDeal?.$id;
    if (!dealId) return;

    if (t.id === 'deal-send-btn') return sendChat(container);
    if (t.id === 'deal-accept-btn') return updateStatus(container, dealId, DEAL_STATUS.ACCEPTED);
    if (t.id === 'deal-reject-btn') return updateStatus(container, dealId, DEAL_STATUS.REJECTED);
    if (t.id === 'deal-start-btn') return updateStatus(container, dealId, DEAL_STATUS.ACTIVE);
    if (t.id === 'deal-complete-btn') return updateStatus(container, dealId, DEAL_STATUS.COMPLETED, { maybeVouch: true });
  });

  // Handle auto-expanding textarea
  container.addEventListener('input', (e) => {
    if (e.target.id === 'deal-chat-input') {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'deal-chat-input') {
      e.preventDefault();
      sendChat(container);
    }
  });
}

async function sendChat(container) {
  const input = container.querySelector('#deal-chat-input');
  const dealId = currentDeal?.$id;
  if (!input || !dealId) return;

  const text = input.value || '';
  if (!text.trim()) return;

  try {
    await sendDealMessage({
      dealId,
      senderId: currentUser?.$id,
      text,
      participantIds: [currentDeal.creatorId, currentDeal.scoutId],
    });
    input.value = '';
    input.style.height = 'auto';
    trackEvent('deal_message_sent', { dealId });
  } catch (error) {
    showToast(error?.message || 'Failed to send message.', 'error');
  }
}

async function updateStatus(container, dealId, status, { maybeVouch = false } = {}) {
  try {
    await updateDealStatus(dealId, status);
    trackEvent('deal_status_updated', { dealId, status });
    currentDeal = await getDeal(dealId);
    renderDealRoom(container, currentDeal);
    await hydrateMessages(container, dealId);

    if (maybeVouch && status === DEAL_STATUS.COMPLETED) {
      showVouch(container, currentDeal);
    }
  } catch (error) {
    showToast(error?.message || 'Update failed.', 'error');
  }
}

function showVouch(container, deal) {
  if (currentUser?.$id !== deal.scoutId) return;

  const vouchEl = container.querySelector('#deal-vouch');
  if (!vouchEl) return;
  vouchEl.classList.remove('hidden');
  vouchEl.innerHTML = `
    <div class="glass-panel rounded-3xl p-8 max-w-sm border-gold/50 shadow-2xl relative">
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gold text-void flex items-center justify-center border-[6px] border-void">
        <i data-lucide="star" class="w-10 h-10 fill-current"></i>
      </div>
      <h2 class="text-2xl font-bold text-white mb-2 mt-8">Vouch for Talent</h2>
      <p class="text-sm text-muted mb-8 text-center px-4">Your vouch confirms this creator is reliable. Help the community find elite artists.</p>
      
      <div class="flex justify-center gap-3 mb-8">
        ${[1, 2, 3, 4, 5].map(n => `
          <button class="vouch-star active:scale-90 transition-transform text-gold/30 hover:text-gold" data-rating="${n}">
            <i data-lucide="star" class="w-8 h-8 ${n === 5 ? 'fill-gold text-gold' : ''}"></i>
          </button>
        `).join('')}
      </div>

      <textarea id="vouch-note" class="input-field mb-6 text-sm" rows="3" placeholder="How was the experience? (Optional)"></textarea>
      
      <div class="flex flex-col gap-3">
        <button id="vouch-submit" class="btn-gold rounded-full w-full py-4 font-bold text-base shadow-lg shadow-gold/20">Submit Vouch ✦</button>
        <button id="vouch-skip" class="text-muted text-sm py-2">Maybe later</button>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  let rating = 5;
  vouchEl.querySelectorAll('.vouch-star').forEach((b) => {
    b.addEventListener('click', () => {
      rating = Number(b.getAttribute('data-rating') || '5');
      vouchEl.querySelectorAll('.vouch-star').forEach((x, i) => {
        const starIcon = x.querySelector('i');
        if (i < rating) {
          starIcon.classList.add('fill-gold', 'text-gold');
        } else {
          starIcon.classList.remove('fill-gold', 'text-gold');
        }
      });
    });
  });

  vouchEl.querySelector('#vouch-skip')?.addEventListener('click', () => vouchEl.classList.add('hidden'));

  vouchEl.querySelector('#vouch-submit')?.addEventListener('click', async () => {
    const note = vouchEl.querySelector('#vouch-note')?.value || '';
    try {
      const { createVouchAndUpdateReliability } = await import('../api/vouches.js');
      await createVouchAndUpdateReliability({
        creatorId: deal.creatorId,
        scoutId: deal.scoutId,
        dealId: deal.$id,
        rating,
        note,
      });
      showToast('Vouch documented! ✦', 'success');
      vouchEl.classList.add('hidden');
    } catch (error) {
      showToast('Submit failed.', 'error');
    }
  });
}
