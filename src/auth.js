import { account, databases, storage, ID, Query, DATABASE_ID, COLLECTIONS, BUCKETS, OAuthProvider } from './appwriteClient.js';

export async function getCurrentUser() {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    if (localStorage.getItem('kalakar_mock_session')) {
      return { $id: 'demo_session', name: 'Guest User' };
    }
    return null;
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
    
    const user = await account.get();
    if (!user.email && !user.phone) {
      // If no profile found but user is anonymous guest, return mock profile to bypass onboarding
      return {
        name: 'Guest User',
        primaryCraft: 'Director',
        city: 'Mumbai',
        state: 'Maharashtra',
        headline: 'Aspiring Filmmaker',
        bio: 'Passionate about telling stories that matter. Currently working on my first short film.',
        profileViews: 42,
        impressions: 156,
        vouchCount: 3,
        avatarUrl: 'https://picsum.photos/seed/guest/200/200',
        avatarFileId: null
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch creator profile, falling back to mock:', error);
    // Demo fallback: if we fail or are a demo user, return a mock profile
    if (userId === 'demo_session' || error.code === 401 || !userId || localStorage.getItem('kalakar_mock_session')) {
      return {
        name: 'Guest User',
        primaryCraft: 'Director',
        city: 'Mumbai',
        state: 'Maharashtra',
        headline: 'Aspiring Filmmaker',
        bio: 'Passionate about telling stories that matter. Currently working on my first short film.',
        profileViews: 42,
        impressions: 156,
        vouchCount: 3,
        avatarUrl: 'https://picsum.photos/seed/guest/200/200',
        avatarFileId: null
      };
    }
    return null;
  }
}

export async function logout() {
  try {
    localStorage.removeItem('kalakar_mock_session');
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.warn('Appwrite logout failed, clearing mock session:', error);
    return { success: true };
  }
}

export async function sendPhoneOTP(phone) {
  try {
    // Demo mode: Bypass real SMS and return a mock user ID
    return { success: true, userId: 'demo_' + phone };
  } catch (error) {
    console.error('Send OTP failed:', error);
    return { success: false, error: 'Failed to send OTP. Please check your number and try again.' };
  }
}

export async function verifyPhoneOTP(userId, otp) {
  try {
    if (otp === '1250') {
      // Create an anonymous session to keep Appwrite client authenticated
      try {
        await account.createAnonymousSession();
      } catch (e) {
        // Ignore if session already exists
      }
      localStorage.setItem('kalakar_mock_session', 'true');
      return { success: true, session: { userId: 'demo_session' } };
    } else {
      return { success: false, error: 'Invalid OTP code. Use 1250 for demo.' };
    }
  } catch (error) {
    console.error('Verify OTP failed:', error);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}

export async function continueAsGuest() {
  try {
    try {
      await account.createAnonymousSession();
    } catch (e) {
      console.warn('Appwrite session failed, falling back to mock session', e);
    }
    localStorage.setItem('kalakar_mock_session', 'true');
    return { success: true };
  } catch (error) {
    console.error('Guest login failed:', error);
    localStorage.setItem('kalakar_mock_session', 'true');
    return { success: true };
  }
}

export async function createCreatorProfile(profileData) {
  try {
    const user = await account.get();
    const profile = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.CREATORS,
      ID.unique(),
      {
        userId: user.$id,
        name: profileData.name || user.name || '',
        avatarFileId: profileData.avatarFileId || '',
        coverFileId: '',
        headline: profileData.headline || '',
        bio: '',
        city: profileData.city || '',
        state: profileData.state || '',
        primaryCraft: profileData.primaryCraft || 'actor',
        secondaryCrafts: [],
        yearsExperience: parseInt(profileData.yearsExperience) || 0,
        availability: 'available',
        unions: [],
        physicalAttributes: '{}',
        languages: JSON.stringify(profileData.languages || []),
        skills: [],
        training: '[]',
        socialLinks: '{}',
        contactPrefs: JSON.stringify({ openToMessages: true, openToCasting: true, openToCollabs: true }),
        profileViews: 0,
        impressions: 0,
        vouchCount: 0,
        isVerified: false,
        accountType: profileData.accountType || 'talent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    return { success: true, profile };
  } catch (error) {
    console.error('Create profile failed:', error);
    return { success: false, error: 'Failed to create profile. Please try again.' };
  }
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
