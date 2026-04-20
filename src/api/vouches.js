import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwriteClient.js';
import { Permission, Role } from 'appwrite';
import { isGuestMode } from '../utils/guestMode.js';

export async function listCreatorVouches(userId, { limit = 12 } = {}) {
  if (!userId) return [];
  if (isGuestMode()) return [];
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.VOUCHES, [
      Query.equal('creatorId', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
    ]);
    return res.documents;
  } catch {
    return [];
  }
}

export async function createVouchAndUpdateReliability({ creatorId, scoutId, dealId, rating = 5, note = '' } = {}) {
  if (isGuestMode()) throw new Error('Guest mode: vouching is disabled.');
  if (!creatorId || !scoutId || !dealId) throw new Error('Missing vouch fields');

  const permissions = [
    Permission.read(Role.user(creatorId)),
    Permission.read(Role.user(scoutId)),
    Permission.update(Role.user(scoutId)),
    Permission.delete(Role.user(scoutId)),
  ];

  // Create vouch doc (field names assume a reasonable schema; failures are surfaced)
  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.VOUCHES,
    ID.unique(),
    { creatorId, scoutId, dealId, rating, note },
    permissions
  );

  // Best-effort reliability score update on creator profile (if field exists)
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREATORS, [Query.equal('userId', creatorId), Query.limit(1)]);
    const doc = res.documents?.[0];
    if (!doc) return;

    const current = Number(doc.reliabilityScore || 0);
    const next = Math.max(0, current + 1);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.CREATORS, doc.$id, { reliabilityScore: next, reliability: next });
  } catch {
    // ignore
  }
}
