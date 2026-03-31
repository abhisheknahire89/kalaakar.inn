import { Client, Account, Databases, Storage, Query, ID, OAuthProvider } from 'appwrite';

const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69c8ee1b0037e381d046');

export const account  = new Account(client);
export const databases = new Databases(client);
export const storage  = new Storage(client);
export { client, Query, ID, OAuthProvider };

// ═══════════════════════════════════
// DATABASE ID
// ═══════════════════════════════════
export const DATABASE_ID = 'kalakar_db';

// ═══════════════════════════════════
// ALL 17 COLLECTION IDS
// ═══════════════════════════════════
export const COLLECTIONS = {
  CREATORS:         'creators',
  STUDIOS:          'studios',
  POSTS:            'posts',
  COMMENTS:         'comments',
  APPLAUDS:         'applauds',
  CONNECTIONS:      'connections',
  VOUCHES:          'vouches',
  CREDITS:          'credits',
  JOBS:             'jobs',
  APPLICATIONS:     'applications',
  CONVERSATIONS:    'conversations',
  MESSAGES:         'messages',
  CONTRACTS:        'contracts',
  NOTIFICATIONS:    'notifications',
  WEEKLY_PROMPTS:   'weeklyPrompts',
  SAVED_ITEMS:      'savedItems',
  JOB_ALERT_PREFS:  'jobAlertPreferences',
};

// ═══════════════════════════════════
// STORAGE BUCKET
// ═══════════════════════════════════
export const BUCKETS = {
  AVATARS: 'avatars',
};
