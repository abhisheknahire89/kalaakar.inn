import { databases, DATABASE_ID, COLLECTIONS, Query } from './appwriteClient.js';
import { showBlockingError } from './components/blockingError.js';
import { logError } from './observability/telemetry.js';

export async function validateAppwriteMvp({ userId } = {}) {
  // We can’t reliably read collection metadata from the browser (often requires API key),
  // so validate by performing minimal queries that the logged-in user must be allowed to do.
  if (!userId) return;

  try {
    await databases.listDocuments(DATABASE_ID, COLLECTIONS.CREATORS, [Query.equal('userId', userId), Query.limit(1)]);
  } catch (error) {
    handleValidationFailure(error, 'Creators');
    throw error;
  }

  try {
    await databases.listDocuments(DATABASE_ID, COLLECTIONS.POSTS, [Query.orderDesc('$createdAt'), Query.limit(1)]);
  } catch (error) {
    handleValidationFailure(error, 'Posts');
    throw error;
  }

  try {
    await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, [Query.equal('userId', userId), Query.limit(1)]);
  } catch (error) {
    handleValidationFailure(error, 'Notifications');
    throw error;
  }
}

function handleValidationFailure(error, area) {
  logError(error, { area: `appwrite_validation_${area}` });

  const code = error?.code;
  const message =
    code === 404
      ? `Missing Appwrite database/collection for ${area}.`
      : code === 401 || code === 403
        ? `Appwrite permissions are blocking access to ${area}.`
        : `Unable to access ${area} due to a network or server issue.`;

  showBlockingError({
    title: 'Configuration issue',
    message: `${message}\n\nFix in Appwrite Console:\n- Ensure database ID and collection IDs match the app.\n- Ensure collection permissions allow authenticated users to read needed data.\n- Ensure document permissions are set correctly (user-only for profile/notifications; authenticated-read for posts).`,
    actionText: 'Retry',
    onAction: () => window.location.reload(),
  });
}

