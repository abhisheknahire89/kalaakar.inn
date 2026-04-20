import { databases, ID, Query, DATABASE_ID, COLLECTIONS } from '../appwriteClient.js';
import { isGuestMode } from '../utils/guestMode.js';
import { getSeedCreators } from './guestData.js';

/**
 * Get a creator profile by their user ID.
 */
export async function getProfile(userId) {
  if (isGuestMode()) {
    return getSeedCreators().find((c) => c.userId === userId) || null;
  }
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

/**
 * Update a creator profile's metadata.
 */
export async function updateProfile(documentId, data) {
  if (isGuestMode()) {
    return { $id: documentId, ...data };
  }
  try {
    const result = await databases.updateDocument(DATABASE_ID, COLLECTIONS.CREATORS, documentId, data);
    return result;
  } catch (error) {
    console.error('Update profile failed:', error);
    throw error;
  }
}

/**
 * Increment profile visits or other stats.
 */
export async function trackProfileVisit(userId) {
  if (isGuestMode()) return;
  try {
    const profile = await getProfile(userId);
    if (!profile) return;
    
    const currentVisits = profile.profileVisits || 0;
    await updateProfile(profile.$id, { profileVisits: currentVisits + 1 });
  } catch (error) {
    console.warn('Silent failure tracking profile visit:', error);
  }
}

/**
 * List creators with filters (search, craft, reliability).
 */
export async function listCreators({ search = '', craft = '', minReliability = 0, limit = 20 } = {}) {
  if (isGuestMode()) {
    const q = (search || '').toLowerCase();
    const list = getSeedCreators()
      .filter((c) => (craft ? c.primaryCraft === craft : true))
      .filter((c) => (minReliability > 0 ? (c.reliability || 0) >= minReliability : true))
      .filter((c) => (q ? (c.name || '').toLowerCase().includes(q) || (c.primaryCraft || '').toLowerCase().includes(q) : true))
      .sort((a, b) => (b.reliability || 0) - (a.reliability || 0));
    return list.slice(0, limit);
  }
  const queries = [Query.limit(limit)];
  
  if (search) queries.push(Query.search('name', search));
  if (craft) queries.push(Query.equal('primaryCraft', craft));
  if (minReliability > 0) queries.push(Query.greaterThanEqual('reliability', minReliability));
  
  queries.push(Query.orderDesc('reliability')); // Show most reliable first

  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREATORS, queries);
    return result.documents;
  } catch (error) {
    console.error('List creators failed:', error);
    return [];
  }
}
