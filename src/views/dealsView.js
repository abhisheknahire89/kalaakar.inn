import { currentUser } from '../app.js';
import { databases, Query, DATABASE_ID, COLLECTIONS } from '../appwriteClient.js';
import { escapeHtml } from '../utils/escapeHtml.js';
import { navigateTo } from '../router.js';

let dealsBound = false;

/**
 * Initialize the "My Deals" dashboard.
 * Shows both "My Requests" (sent) and "Active Hiring" (received).
 */
export async function initDealsListView() {
  const container = document.getElementById('deals-list-content');
  if (!container) return;

  if (!currentUser?.$id) {
    container.innerHTML = `<div class="text-center text-muted py-20 px-6">Sign in to manage your professional deals.</div>`;
    return;
  }

  container.innerHTML = `<div class="text-center text-muted py-20 animate-pulse">Syncing briefcase...</div>`;

  try {
    // 1. Fetch deals where I am the Scout (Requested)
    const myProposals = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DEALS, [
      Query.equal('scoutId', currentUser.$id),
      Query.orderDesc('$createdAt'),
      Query.limit(20)
    ]);

    // 2. Fetch deals where I am the Creator (Hiring Me)
    const myJobs = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DEALS, [
      Query.equal('creatorId', currentUser.$id),
      Query.orderDesc('$createdAt'),
      Query.limit(20)
    ]);

    renderDealsDashboard(container, myJobs.documents, myProposals.documents);
    
    if (!dealsBound) {
      dealsBound = true;
      bindDealsActions(container);
    }

    if (window.lucide) window.lucide.createIcons();
  } catch (error) {
    console.error('Deals dashboard error:', error);
    container.innerHTML = `<div class="text-center text-muted py-12">Failed to load professional history.</div>`;
  }
}

function renderDealsDashboard(container, jobs, proposals) {
  if (jobs.length === 0 && proposals.length === 0) {
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-24 text-center px-6">
        <div class="w-20 h-20 rounded-full bg-surface border border-gold/10 flex items-center justify-center text-gold mb-6 opacity-40">
          <i data-lucide="briefcase" class="w-9 h-9"></i>
        </div>
        <h3 class="text-white font-bold text-xl mb-2">No Active Deals</h3>
        <p class="text-sm text-muted max-w-sm">Manage your professional collaborations and hiring requests in one secure dashboard.</p>
        <button id="deals-empty-explore" class="btn-gold px-10 py-3 rounded-full font-bold mt-8 shadow-lg shadow-gold/20">Explore Talent ✦</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- INCOMING REQUESTS (Hiring Me) -->
    ${jobs.length > 0 ? `
      <section class="mb-12">
        <div class="flex items-center gap-3 mb-6 px-2">
          <h3 class="text-xs font-bold uppercase tracking-[0.25em] text-gold">Hiring Inquiries</h3>
          <div class="h-px flex-1 bg-gold/10"></div>
        </div>
        <div class="space-y-3">
          ${jobs.map(d => renderDealStrip(d, true)).join('')}
        </div>
      </section>
    ` : ''}

    <!-- SENT PROPOSALS (My Requests) -->
    ${proposals.length > 0 ? `
      <section class="mb-12">
        <div class="flex items-center gap-3 mb-6 px-2">
          <h3 class="text-xs font-bold uppercase tracking-[0.25em] text-white">Sent Proposals</h3>
          <div class="h-px flex-1 bg-white/5"></div>
        </div>
        <div class="space-y-3">
          ${proposals.map(d => renderDealStrip(d, false)).join('')}
        </div>
      </section>
    ` : ''}
  `;
}

function renderDealStrip(d, isIncoming) {
  const status = d.status || 'Requested';
  const role = d.roleRequired || 'Creative Role';
  const project = d.projectTitle || 'Project Untitled';
  const date = new Date(d.$createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
  
  return `
    <div class="deal-strip glass-panel p-5 rounded-2xl border-white/5 flex items-center justify-between group hover:border-gold/30 hover:bg-gold/[0.02] transition-all cursor-pointer" data-deal-id="${d.$id}">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-surface border border-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold/10 transition-colors">
          <i data-lucide="${isIncoming ? 'user' : 'briefcase'}" class="w-5 h-5 text-gold"></i>
        </div>
        <div>
          <div class="text-white font-bold text-sm tracking-tight leading-none group-hover:text-gold transition-colors">${escapeHtml(project)}</div>
          <div class="text-[10px] text-muted font-bold uppercase tracking-widest mt-1.5">${escapeHtml(role)} • ${date}</div>
        </div>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-strong ${statusColor(status)}">
          ${escapeHtml(status)}
        </div>
        <i data-lucide="chevron-right" class="w-4 h-4 text-muted group-hover:text-white transition-colors"></i>
      </div>
    </div>
  `;
}

function statusColor(status) {
  const s = status.toLowerCase();
  if (s === 'requested') return 'text-gold bg-gold/5';
  if (s === 'active') return 'text-green-400 bg-green-400/5';
  if (s === 'completed') return 'text-blue-400 bg-blue-400/5';
  if (s === 'rejected') return 'text-red-400 bg-red-400/5';
  return 'text-muted';
}

function bindDealsActions(container) {
  container.addEventListener('click', (e) => {
    const strip = e.target.closest('.deal-strip');
    if (strip) {
      const dealId = strip.getAttribute('data-deal-id');
      if (dealId) navigateTo('deal', { dealId });
    }
    if (e.target?.id === 'deals-empty-explore') {
      navigateTo('explore');
    }
  });
}
