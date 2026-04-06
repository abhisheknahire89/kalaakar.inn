import { databases, DATABASE_ID, COLLECTIONS, Query } from '../appwriteClient.js';

let hiringValidated = false;

export async function validateHiringBackend() {
  if (hiringValidated) return;

  if (!navigator.onLine) {
    throw new Error('You are offline. Reconnect to start a deal.');
  }

  const checks = [
    { name: 'deals', id: COLLECTIONS.DEALS },
    { name: 'messages', id: COLLECTIONS.MESSAGES },
  ];

  const failures = [];
  for (const c of checks) {
    try {
      await databases.listDocuments(DATABASE_ID, c.id, [Query.limit(1)]);
    } catch (e) {
      failures.push({ collection: c.name, error: e });
    }
  }

  // vouches are only needed at completion time; validate best-effort but do not block deal creation
  try {
    await databases.listDocuments(DATABASE_ID, COLLECTIONS.VOUCHES, [Query.limit(1)]);
  } catch {
    // ignore
  }

  if (failures.length) {
    const names = failures.map((f) => f.collection).join(', ');
    throw new Error(
      `Hiring is not configured in Appwrite (missing access to: ${names}). Ensure these collections exist and users have read/create permissions.`
    );
  }

  hiringValidated = true;
}

