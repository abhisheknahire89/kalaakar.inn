export const GUEST_MODE_KEY = 'kalakar_guest_mode';
export const GUEST_PROFILE_KEY = 'kalakar_guest_profile';
export const GUEST_POSTS_KEY = 'kalakar_guest_posts';
export const GUEST_SAVED_KEY = 'kalakar_guest_saved_posts';

export function isGuestMode() {
  try {
    return localStorage.getItem(GUEST_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enableGuestMode() {
  try {
    localStorage.setItem(GUEST_MODE_KEY, '1');
  } catch {
    // ignore
  }
}

export function disableGuestMode() {
  try {
    localStorage.removeItem(GUEST_MODE_KEY);
  } catch {
    // ignore
  }
}

export function getGuestUser() {
  return {
    $id: 'guest',
    name: 'Guest',
    email: '',
    labels: ['guest'],
  };
}

export function getGuestProfile() {
  try {
    const raw = localStorage.getItem(GUEST_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {
    $id: 'guest_profile',
    userId: 'guest',
    name: 'Guest',
    primaryCraft: 'guest',
    city: '',
    state: '',
    accountType: 'talent',
    yearsExperience: 0,
    avatarFileId: '',
    avatarUrl: '',
    bio: 'Browsing as guest. Complete onboarding to personalize your profile.',
    reliability: 0,
  };
}

export function setGuestProfile(profile) {
  try {
    localStorage.setItem(GUEST_PROFILE_KEY, JSON.stringify(profile || {}));
  } catch {
    // ignore
  }
}

