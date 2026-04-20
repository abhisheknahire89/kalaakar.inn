import { databases, ID, Query, DATABASE_ID, COLLECTIONS } from '../appwriteClient.js';
import { currentUser } from '../app.js';
import { GUEST_SAVED_KEY } from '../utils/guestMode.js';

function readGuestSaved() {
  try {
    const raw = localStorage.getItem(GUEST_SAVED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeGuestSaved(list) {
  try {
    localStorage.setItem(GUEST_SAVED_KEY, JSON.stringify(list || []));
  } catch {
    // ignore
  }
}

/**
 * Follow a user.
 */
export async function followUser(targetId) {
  if (!currentUser?.$id) throw new Error('Sign in to follow creators.');
  if (currentUser.$id === 'guest') throw new Error('Complete onboarding to follow creators.');
  
  try {
    return await databases.createDocument(DATABASE_ID, COLLECTIONS.CONNECTIONS, ID.unique(), {
      followerId: currentUser.$id,
      followingId: targetId,
      status: 'active',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Follow failed:', error);
    throw error;
  }
}

/**
 * Unfollow a user.
 */
export async function unfollowUser(targetId) {
  if (!currentUser?.$id) return;
  if (currentUser.$id === 'guest') return;
  
  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CONNECTIONS, [
      Query.equal('followerId', currentUser.$id),
      Query.equal('followingId', targetId),
      Query.limit(1)
    ]);
    
    if (existing.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.CONNECTIONS, existing.documents[0].$id);
    }
  } catch (error) {
    console.error('Unfollow failed:', error);
  }
}

/**
 * Check if the current user follows someone.
 */
export async function isFollowing(targetId) {
  if (!currentUser?.$id) return false;
  if (currentUser.$id === 'guest') return false;
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CONNECTIONS, [
      Query.equal('followerId', currentUser.$id),
      Query.equal('followingId', targetId),
      Query.limit(1)
    ]);
    return result.documents.length > 0;
  } catch {
    return false;
  }
}

/**
 * Save a post.
 */
export async function savePost(postId) {
  if (!currentUser?.$id) throw new Error('Sign in to save posts.');
  if (currentUser.$id === 'guest') {
    const list = readGuestSaved();
    if (!list.includes(postId)) list.unshift(postId);
    writeGuestSaved(list.slice(0, 200));
    return { $id: `guest_save_${postId}` };
  }
  
  try {
    return await databases.createDocument(DATABASE_ID, COLLECTIONS.SAVED_ITEMS, ID.unique(), {
      userId: currentUser.$id,
      itemId: postId, // itemId refers to the postId
      itemType: 'post',
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save failed:', error);
    throw error;
  }
}

/**
 * Unsave a post.
 */
export async function unsavePost(postId) {
  if (!currentUser?.$id) return;
  if (currentUser.$id === 'guest') {
    const list = readGuestSaved().filter((x) => x !== postId);
    writeGuestSaved(list);
    return;
  }
  
  try {
    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_ITEMS, [
      Query.equal('userId', currentUser.$id),
      Query.equal('itemId', postId),
      Query.limit(1)
    ]);
    
    if (existing.documents.length > 0) {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SAVED_ITEMS, existing.documents[0].$id);
    }
  } catch (error) {
    console.error('Unsave failed:', error);
  }
}

/**
 * List all saved posts for the current user.
 */
export async function listSavedPosts() {
  if (!currentUser?.$id) return [];
  if (currentUser.$id === 'guest') {
    return readGuestSaved().map((id) => ({ itemId: id }));
  }
  
  try {
    const saved = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SAVED_ITEMS, [
      Query.equal('userId', currentUser.$id),
      Query.equal('itemType', 'post'),
      Query.orderDesc('savedAt')
    ]);
    
    return saved.documents;
  } catch (error) {
    console.error('List saved failed:', error);
    return [];
  }
}
