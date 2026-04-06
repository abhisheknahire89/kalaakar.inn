import { account, databases, storage, ID, Query, DATABASE_ID, COLLECTIONS, BUCKETS, OAuthProvider } from './appwriteClient.js';
import { withRetry, isRetriableAppwriteError } from './utils/retry.js';
import { Role, Permission } from 'appwrite';

export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    if (error?.code !== 401) {
      console.warn('getCurrentUser failed:', error);
    }
    return null;
  }
}

/**
 * Higher-level session check used by the app booter.
 * Returns { user, profile, onboardingRequired }
 */
export async function checkSession() {
  try {
    const user = await getCurrentUser();
    if (!user) return { user: null, profile: null, onboardingRequired: false };

    const profile = await getCreatorProfile(user.$id);
    return { 
      user, 
      profile, 
      onboardingRequired: !profile 
    };
  } catch (error) {
    console.error('Session check critical failure:', error);
    return { user: null, profile: null, onboardingRequired: false, error };
  }
}

export function startGoogleLogin() {
  const origin = window.location.origin;
  const successUrl = `${origin}/#stage`;
  const failureUrl = `${origin}/#login`;
  return account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
}

export async function sendMagicLink(email) {
  const origin = window.location.origin;
  // Use current hash login view as the return path
  const redirectUrl = `${origin}/#login`;

  try {
    await withRetry(
      () => account.createMagicURLToken(ID.unique(), email, redirectUrl),
      { retries: 2, baseDelayMs: 500, shouldRetry: isRetriableAppwriteError }
    );
    return { success: true };
  } catch (error) {
    console.error('Send magic link failed:', error);
    return { success: false, error: mapAuthError(error, 'send_magic'), code: error?.code };
  }
}

export async function consumeMagicLinkFromUrl() {
  const url = new URL(window.location.href);
  const userId = url.searchParams.get('userId');
  const secret = url.searchParams.get('secret');

  if (!userId || !secret) return { consumed: false };

  try {
    // Phase 1: Create session
    await withRetry(
      () => account.createSession(userId, secret),
      { retries: 1, baseDelayMs: 400, shouldRetry: isRetriableAppwriteError }
    );

    // Phase 2: Cleanup URL
    url.searchParams.delete('userId');
    url.searchParams.delete('secret');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    
    // Phase 3: Force redirect to internal view
    window.location.hash = 'stage';
    return { consumed: true };
  } catch (error) {
    console.error('Consume magic link failed:', error);
    
    // Cleanup URL even on failure to avoid infinite retry loops
    url.searchParams.delete('userId');
    url.searchParams.delete('secret');
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);

    return { consumed: false, error: mapAuthError(error, 'consume_magic'), code: error?.code };
  }
}

export async function getCreatorProfile(userId) {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREATORS, [
      Query.equal('userId', userId),
      Query.limit(1)
    ]);
    
    if (result.documents.length > 0) {
      return result.documents[0];
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch creator profile:', error);
    throw error;
  }
}

export async function logout() {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.warn('Appwrite logout failed, clearing mock session:', error);
    return { success: true };
  }
}

export async function createCreatorProfile(profileData) {
  try {
    const user = await account.get();
    const richPayload = {
      userId: user.$id,
      name: profileData.name || user.name || '',
      city: profileData.city || '',
      state: profileData.state || '',
      primaryCraft: profileData.primaryCraft || 'actor',
      accountType: profileData.accountType || 'talent',
      yearsExperience: parseInt(profileData.yearsExperience) || 0,
      headline: profileData.headline || '',
      bio: '',
      avatarFileId: profileData.avatarFileId || '',
    };

    const permissions = [
      Permission.read(Role.user(user.$id)),
      Permission.update(Role.user(user.$id)),
      Permission.delete(Role.user(user.$id)),
    ];

    let profile = null;
    try {
      profile = await databases.createDocument(DATABASE_ID, COLLECTIONS.CREATORS, ID.unique(), richPayload, permissions);
    } catch (error) {
      console.warn('Rich profile payload rejected; retrying with minimal payload', error);
      profile = await databases.createDocument(DATABASE_ID, COLLECTIONS.CREATORS, ID.unique(), {
        userId: user.$id,
        name: richPayload.name,
      }, permissions);
    }
    return { success: true, profile };
  } catch (error) {
    console.error('Create profile failed:', error);
    return { success: false, error: 'Failed to create profile. Please try again.' };
  }
}

function mapAuthError(error, stage) {
  if (!navigator.onLine) return 'You are offline. Please reconnect and try again.';

  const code = error?.code;
  const message = String(error?.message || '').toLowerCase();

  if (code === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (code === 401 || message.includes('invalid') || message.includes('secret') || message.includes('unauthorized')) {
    if (stage === 'consume_magic') return 'This sign-in link is invalid or expired. Please request a new one.';
    return 'Authentication failed. Please try again.';
  }
  if (code === 404) return 'Auth service is unavailable. Please contact support.';
  if (code === 402) return 'Service limit reached. Please check the Appwrite console.';
  if (code >= 500) return 'Server error. Please try again in a moment.';
  
  return error?.message || 'Something went wrong. Please try again.';
}

export async function uploadAvatar(file) {
  try {
    const response = await storage.createFile(BUCKETS.AVATARS, ID.unique(), file);
    return { success: true, fileId: response.$id };
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return { success: false, error: 'Failed to upload photo.' };
  }
}

export function getFilePreview(fileId, width = 200, height = 200) {
  if (!fileId) return '/assets/default-avatar.svg';
  return storage.getFilePreview(BUCKETS.AVATARS, fileId, width, height).href;
}
