import { currentUser } from '../app.js';
import { navigateTo } from '../router.js';
import { createDeal } from '../api/deals.js';
import { showToast } from './toast.js';

let hireInitialized = false;
let target = { creatorId: '', creatorName: '', postId: '' };
let selectedAction = 'hire'; // hire | collab | message

/**
 * Initialize hire flow modal listeners once.
 */
export function initHireFlow() {
  if (hireInitialized) return;
  hireInitialized = true;

  const modal = document.getElementById('hire-modal');
  if (!modal) return;

  // Header listeners
  document.getElementById('close-hire-modal-btn')?.addEventListener('click', closeHireModal);
  modal.addEventListener('click', (e) => {
    if (e.target?.id === 'hire-modal') closeHireModal();
  });

  // Action choice buttons (Hire / Collaborate / Message)
  document.querySelectorAll('.hire-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedAction = btn.getAttribute('data-action') || 'hire';
      showDealForm();
    });
  });

  // Modal navigation
  document.getElementById('deal-back-btn')?.addEventListener('click', showActionChoices);

  // Form submission
  document.getElementById('deal-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitDeal();
  });

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHireModal();
  });
}

/**
 * Open the hire modal for a specific creator.
 */
export function openHireFlow({ creatorId, creatorName = '', postId = '' } = {}) {
  initHireFlow();

  if (!creatorId) {
    showToast('Unable to start hiring: missing creator id.', 'error');
    return;
  }

  if (currentUser?.$id === creatorId) {
    showToast("You can’t hire yourself. Explore the feed to find other creators.", 'neutral');
    return;
  }

  target = { creatorId, creatorName, postId };
  
  const modal = document.getElementById('hire-modal');
  if (!modal) return;

  const targetLabel = document.getElementById('hire-target-sub');
  if (targetLabel) targetLabel.textContent = creatorName ? `To: ${creatorName}` : `To: ${creatorId}`;

  resetDealForm();
  showActionChoices();
  modal.classList.remove('hidden');
}

export function closeHireModal() {
  const modal = document.getElementById('hire-modal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function showActionChoices() {
  document.getElementById('hire-actions')?.classList.remove('hidden');
  document.getElementById('deal-form')?.classList.add('hidden');
  
  const title = document.getElementById('hire-modal-title');
  if (title) title.textContent = 'How would you like to proceed?';
}

function showDealForm() {
  document.getElementById('hire-actions')?.classList.add('hidden');
  document.getElementById('deal-form')?.classList.remove('hidden');

  const modalTitle = document.getElementById('hire-modal-title');
  const detailsSection = document.getElementById('deal-project-details');
  const submitBtn = document.getElementById('deal-submit-btn');
  const backBtn = document.getElementById('deal-back-btn');

  const isMessage = selectedAction === 'message';
  const isCollab = selectedAction === 'collab';

  if (modalTitle) {
    modalTitle.textContent = isMessage ? 'Start a conversation' : isCollab ? 'Propose collaboration' : 'New hire request';
  }

  // Hide project fields if it's just a message
  if (detailsSection) {
    const fields = detailsSection.querySelectorAll('input:not(#deal-message-input)');
    fields.forEach(f => f.classList.toggle('hidden', isMessage));
  }
  
  if (submitBtn) submitBtn.textContent = isMessage ? 'Send message' : 'Send request';
  if (backBtn) backBtn.classList.remove('hidden');

  // Focus message
  document.getElementById('deal-message')?.focus();
}

function resetDealForm() {
  const form = document.getElementById('deal-form');
  if (form) form.reset();
}

async function submitDeal() {
  if (!currentUser?.$id) {
    showToast('Please sign in to continue.', 'warning');
    return;
  }
  if (currentUser.$id === 'guest') {
    showToast('Guest mode: complete onboarding to send hire requests.', 'neutral');
    closeHireModal();
    navigateTo('onboarding');
    return;
  }

  const projectTitle = (document.getElementById('deal-projectTitle')?.value || '').trim();
  const roleRequired = (document.getElementById('deal-roleRequired')?.value || '').trim();
  const location = (document.getElementById('deal-location')?.value || '').trim();
  const duration = (document.getElementById('deal-duration')?.value || '').trim();
  const budget = (document.getElementById('deal-budget')?.value || '').trim();
  const message = (document.getElementById('deal-message')?.value || '').trim();

  // Validation
  if (selectedAction !== 'message' && !projectTitle) return showToast('Project title is required.', 'warning');
  if (!message && selectedAction === 'message') return showToast('Please type a message.', 'warning');

  const submitBtn = document.getElementById('deal-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
  }

  try {
    const deal = await createDeal({
      creatorId: target.creatorId,
      scoutId: currentUser.$id,
      postId: target.postId,
      dealType: selectedAction,
      projectTitle: projectTitle || 'General Inquiry',
      roleRequired: roleRequired || 'Talent',
      location,
      duration,
      budget,
      message,
    });

    showToast('Success! Request sent.', 'success');
    closeHireModal();
    navigateTo('deal', { dealId: deal.$id });
  } catch (error) {
    showToast(error?.message || 'Failed to send request.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = selectedAction === 'message' ? 'Send message' : 'Send request';
    }
  }
}
