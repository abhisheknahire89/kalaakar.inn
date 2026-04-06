import { createCreatorProfile, uploadAvatar } from '../auth.js';
import { navigateTo } from '../router.js';
import { showToast } from '../components/toast.js';
import { trackEvent, logError } from '../observability/telemetry.js';

let currentStep = 1;
const totalSteps = 4;
let profileData = {
  primaryCraft: 'actor',
  name: '',
  city: '',
  state: '',
  accountType: 'talent',
  yearsExperience: 0,
  avatarFileId: ''
};

let onboardingViewInitialized = false;

export function initOnboardingView() {
  if (!onboardingViewInitialized) {
    onboardingViewInitialized = true;

    document.querySelectorAll('.next-step-btn').forEach(btn => {
      btn.addEventListener('click', () => goToStep(currentStep + 1));
    });
    
    document.querySelectorAll('.prev-step-btn').forEach(btn => {
      btn.addEventListener('click', () => goToStep(currentStep - 1));
    });

    document.querySelectorAll('.craft-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.craft-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        profileData.primaryCraft = e.currentTarget.dataset.craft;
      });
    });

    document.getElementById('complete-onboarding-btn')?.addEventListener('click', handleComplete);
    document.getElementById('ob-experience')?.addEventListener('input', syncExperienceLabel);
    document.getElementById('ob-avatar')?.addEventListener('change', handleAvatarSelect);
  }

  // Reset UI state when revisiting onboarding
  currentStep = 1;
  updateStepUI();
  showStep(1);
  syncExperienceLabel();
}

function goToStep(step) {
  if (step < 1 || step > totalSteps) return;
  
  // Validation before proceeding
  if (step === 3 && currentStep === 2) {
    profileData.name = document.getElementById('ob-name').value;
    profileData.city = document.getElementById('ob-city').value;
    profileData.state = document.getElementById('ob-state').value;
    if (!profileData.name) {
      showToast('Please enter your name', 'warning');
      return;
    }
  }

  if (step === 4 && currentStep === 3) {
    profileData.accountType = document.querySelector('input[name="accountType"]:checked').value;
    profileData.yearsExperience = document.getElementById('ob-experience').value || 0;
  }

  showStep(step);
  
  currentStep = step;
  updateStepUI();
}

function showStep(step) {
  document.querySelectorAll('.onboarding-step').forEach(el => el.classList.add('hidden'));
  document.getElementById(`onboarding-step-${step}`)?.classList.remove('hidden');
}

function updateStepUI() {
  const el = document.getElementById('onboarding-step-indicator');
  if (el) el.textContent = `Step ${currentStep} of ${totalSteps}`;
}

async function handleComplete() {
  const btn = document.getElementById('complete-onboarding-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Setting up...';
  }

  const result = await createCreatorProfile(profileData);
  
  if (result.success) {
    showToast('Profile created successfully! Welcome to Kalakar.', 'success');
    trackEvent('onboarding_completed', { primaryCraft: profileData.primaryCraft, accountType: profileData.accountType });
    // Guide the user to their first post immediately
    localStorage.setItem('kalakar_open_composer_once', 'true');
    navigateTo('stage');
    import('../app.js').then(m => m.boot());
  } else {
    logError(result.error, { area: 'onboarding_create_profile' });
    showToast(result.error, 'error');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Complete Setup ✦';
    }
  }
}

function syncExperienceLabel() {
  const range = document.getElementById('ob-experience');
  const label = document.getElementById('ob-experience-label');
  if (!range || !label) return;
  label.textContent = String(range.value || '0');
}

async function handleAvatarSelect(e) {
  const file = e.target?.files?.[0];
  if (!file) return;

  const preview = document.getElementById('ob-avatar-preview');
  try {
    const objectUrl = URL.createObjectURL(file);
    if (preview) preview.src = objectUrl;
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch {
    // ignore
  }

  try {
    const up = await uploadAvatar(file);
    if (!up.success) throw new Error(up.error || 'Upload failed');
    profileData.avatarFileId = up.fileId;
    showToast('Avatar uploaded.', 'success');
  } catch (error) {
    logError(error, { area: 'onboarding_avatar' });
    showToast('Avatar upload failed. You can skip for now.', 'warning');
  }
}
