const sdk = require('node-appwrite');

const client = new sdk.Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('69c8ee1b0037e381d046')
  .setKey(process.env.APPWRITE_API_KEY || 'YOUR_API_KEY_HERE');

const databases = new sdk.Databases(client);
const storage   = new sdk.Storage(client);

const DATABASE_ID = 'kalakar_db';

async function init() {
  console.log('🎬 Kalakar — Provisioning Appwrite Backend...\n');

  try {
    await databases.get(DATABASE_ID);
    console.log('✅ Database already exists: kalakar_db');
  } catch (e) {
    if (e.code === 404) {
      try {
        await databases.create(DATABASE_ID, 'Kalakar DB');
        console.log('✅ Database created: kalakar_db');
      } catch (createErr) {
        throw createErr;
      }
    } else {
      throw e;
    }
  }

  const collections = [
    { id: 'creators', name: 'Creators', attrs: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'name', type: 'string', size: 200, required: true },
      { key: 'avatarFileId', type: 'string', size: 36, required: false },
      { key: 'coverFileId', type: 'string', size: 36, required: false },
      { key: 'headline', type: 'string', size: 200, required: false },
      { key: 'bio', type: 'string', size: 500, required: false },
      { key: 'city', type: 'string', size: 100, required: false },
      { key: 'state', type: 'string', size: 100, required: false },
      { key: 'primaryCraft', type: 'string', size: 50, required: true },
      { key: 'secondaryCrafts', type: 'stringArray', required: false },
      { key: 'yearsExperience', type: 'integer', required: false },
      { key: 'availability', type: 'string', size: 20, required: false },
      { key: 'unions', type: 'stringArray', required: false },
      { key: 'physicalAttributes', type: 'string', size: 2000, required: false },
      { key: 'languages', type: 'string', size: 2000, required: false },
      { key: 'skills', type: 'stringArray', required: false },
      { key: 'training', type: 'string', size: 2000, required: false },
      { key: 'socialLinks', type: 'string', size: 2000, required: false },
      { key: 'contactPrefs', type: 'string', size: 1000, required: false },
      { key: 'profileViews', type: 'integer', required: false, default: 0 },
      { key: 'impressions', type: 'integer', required: false, default: 0 },
      { key: 'vouchCount', type: 'integer', required: false, default: 0 },
      { key: 'isVerified', type: 'boolean', required: false, default: false },
      { key: 'accountType', type: 'string', size: 20, required: false },
      { key: 'createdAt', type: 'string', size: 30, required: true },
      { key: 'updatedAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'studios', name: 'Studios', attrs: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'name', type: 'string', size: 200, required: true },
      { key: 'logoFileId', type: 'string', size: 36, required: false },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'website', type: 'string', size: 200, required: false },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'posts', name: 'Posts', attrs: [
      { key: 'authorId', type: 'string', size: 36, required: true },
      { key: 'authorName', type: 'string', size: 200, required: true },
      { key: 'content', type: 'string', size: 2000, required: false },
      { key: 'mediaFileId', type: 'string', size: 36, required: false },
      { key: 'mediaType', type: 'string', size: 20, required: false },
      { key: 'applaudCount', type: 'integer', required: false, default: 0 },
      { key: 'commentCount', type: 'integer', required: false, default: 0 },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'comments', name: 'Comments', attrs: [
      { key: 'postId', type: 'string', size: 36, required: true },
      { key: 'authorId', type: 'string', size: 36, required: true },
      { key: 'content', type: 'string', size: 1000, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'applauds', name: 'Applauds', attrs: [
      { key: 'postId', type: 'string', size: 36, required: true },
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'connections', name: 'Connections', attrs: [
      { key: 'requesterId', type: 'string', size: 36, required: true },
      { key: 'recipientId', type: 'string', size: 36, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'vouches', name: 'Vouches', attrs: [
      { key: 'voucherId', type: 'string', size: 36, required: true },
      { key: 'recipientId', type: 'string', size: 36, required: true },
      { key: 'skill', type: 'string', size: 100, required: true },
      { key: 'content', type: 'string', size: 1000, required: false },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'credits', name: 'Credits', attrs: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'role', type: 'string', size: 100, required: true },
      { key: 'year', type: 'integer', required: true },
      { key: 'isVerified', type: 'boolean', required: false, default: false },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'jobs', name: 'Jobs', attrs: [
      { key: 'studioId', type: 'string', size: 36, required: true },
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 2000, required: true },
      { key: 'location', type: 'string', size: 100, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'applications', name: 'Applications', attrs: [
      { key: 'jobId', type: 'string', size: 36, required: true },
      { key: 'applicantId', type: 'string', size: 36, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'coverLetter', type: 'string', size: 2000, required: false },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'conversations', name: 'Conversations', attrs: [
      { key: 'participants', type: 'stringArray', required: true },
      { key: 'lastMessage', type: 'string', size: 1000, required: false },
      { key: 'updatedAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'messages', name: 'Messages', attrs: [
      { key: 'conversationId', type: 'string', size: 36, required: true },
      { key: 'senderId', type: 'string', size: 36, required: true },
      { key: 'content', type: 'string', size: 2000, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'contracts', name: 'Contracts', attrs: [
      { key: 'conversationId', type: 'string', size: 36, required: true },
      { key: 'creatorId', type: 'string', size: 36, required: true },
      { key: 'recipientId', type: 'string', size: 36, required: true },
      { key: 'terms', type: 'string', size: 5000, required: true },
      { key: 'status', type: 'string', size: 20, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'notifications', name: 'Notifications', attrs: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'type', type: 'string', size: 50, required: true },
      { key: 'content', type: 'string', size: 500, required: true },
      { key: 'isRead', type: 'boolean', required: false, default: false },
      { key: 'link', type: 'string', size: 200, required: false },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'weeklyPrompts', name: 'Weekly Prompts', attrs: [
      { key: 'title', type: 'string', size: 200, required: true },
      { key: 'description', type: 'string', size: 1000, required: true },
      { key: 'isActive', type: 'boolean', required: false, default: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'savedItems', name: 'Saved Items', attrs: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'itemId', type: 'string', size: 36, required: true },
      { key: 'itemType', type: 'string', size: 50, required: true },
      { key: 'createdAt', type: 'string', size: 30, required: true },
    ]},
    { id: 'jobAlertPreferences', name: 'Job Alert Preferences', attrs: [
      { key: 'userId', type: 'string', size: 36, required: true },
      { key: 'roles', type: 'stringArray', required: false },
      { key: 'locations', type: 'stringArray', required: false },
      { key: 'minPay', type: 'integer', required: false },
      { key: 'updatedAt', type: 'string', size: 30, required: true },
    ]}
  ];

  for (const col of collections) {
    try {
      await databases.createCollection(DATABASE_ID, col.id, col.name);
      console.log(`✅ Collection created: ${col.name}`);

      for (const attr of col.attrs) {
        try {
          if (attr.type === 'string') {
            await databases.createStringAttribute(DATABASE_ID, col.id, attr.key, attr.size, attr.required, attr.default || null);
          } else if (attr.type === 'integer') {
            await databases.createIntegerAttribute(DATABASE_ID, col.id, attr.key, attr.required, attr.min || null, attr.max || null, attr.default || null);
          } else if (attr.type === 'boolean') {
            await databases.createBooleanAttribute(DATABASE_ID, col.id, attr.key, attr.required, attr.default || null);
          } else if (attr.type === 'stringArray') {
            await databases.createStringAttribute(DATABASE_ID, col.id, attr.key, 200, attr.required, null, true);
          }
          console.log(`   ✅ Attribute: ${attr.key}`);
        } catch (e) {
          if (e.code === 409) console.log(`   ⚠️  Attribute exists: ${attr.key}`);
          else console.log(`   ❌ Attribute failed: ${attr.key} — ${e.message}`);
        }
      }
    } catch (e) {
      if (e.code === 409) console.log(`⚠️  Collection already exists: ${col.name}`);
      else console.log(`❌ Collection failed: ${col.name} — ${e.message}`);
    }
  }

  try {
    await storage.getBucket('avatars');
    console.log('✅ Bucket already exists: avatars');
  } catch (e) {
    if (e.code === 404) {
      try {
        await storage.createBucket(
          'avatars',
          'Avatars & Media',
          undefined,
          false,
          true,
          104857600,
          ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov', 'pdf', 'doc', 'docx'],
          'none',
          false,
          false
        );
        console.log('✅ Storage bucket created: avatars');
      } catch (createErr) {
        throw createErr;
      }
    } else {
      console.log(`❌ Bucket failed: ${e.message}`);
    }
  }

  console.log('\n🎬 Kalakar backend provisioning complete!');
}

init().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
