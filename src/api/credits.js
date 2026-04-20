import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwriteClient.js';
import { isGuestMode } from '../utils/guestMode.js';

export async function listCreatorCredits(userId, { limit = 20 } = {}) {
  if (!userId) return [];
  if (isGuestMode()) return [];

  const tryField = async (field) => {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREDITS, [
      Query.equal(field, userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
    ]);
    return res.documents;
  };

  try {
    return await tryField('creatorId');
  } catch (e1) {
    try {
      return await tryField('userId');
    } catch (e2) {
      try {
        return await tryField('authorId');
      } catch {
        return [];
      }
    }
  }
}
