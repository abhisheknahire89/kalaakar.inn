import { databases, DATABASE_ID, COLLECTIONS, Query, ID, storage, BUCKETS } from '../appwriteClient.js';
import { Permission, Role } from 'appwrite';

/**
 * List posts with optional filters for Search/Explore.
 */
export async function listFilteredPosts({ search = '', type = '', limit = 20 } = {}) {
  const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)];
  
  if (search) queries.push(Query.search('content', search));
  if (type && type !== 'all') queries.push(Query.equal('postType', type));

  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.POSTS, queries);
    return result.documents;
  } catch (error) {
    console.warn('Filtered posts load failed, trying without filters:', error);
    return listFeedPosts({ limit });
  }
}

/**
 * Increment the view count for a post.
 */
export async function incrementPostView(postId) {
  try {
    // Note: This requires a 'viewCount' attribute in the Posts collection.
    // If it doesn't exist, this will fail silently.
    const post = await databases.getDocument(DATABASE_ID, COLLECTIONS.POSTS, postId);
    const newViews = (post.viewCount || 0) + 1;
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.POSTS, postId, {
      viewCount: newViews
    });
  } catch (error) {
    // Silent failure if viewCount doesn't exist in schema
  }
}

export async function listFeedPosts({ limit = 10 } = {}) {
  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.POSTS, [
    Query.orderDesc('$createdAt'),
    Query.limit(limit),
  ]);
  return result.documents;
}

export async function uploadPostMedia(file) {
  if (!file) throw new Error('Missing file');
  const res = await storage.createFile(BUCKETS.POSTS_MEDIA, ID.unique(), file);
  return { fileId: res.$id };
}

export function getPostMediaViewUrl(fileId) {
  if (!fileId) return '';
  try {
    return storage.getFileView(BUCKETS.POSTS_MEDIA, fileId).href;
  } catch {
    return '';
  }
}

export async function createPost({
  authorId,
  postType = 'video',
  content = '',
  mediaFileId = '',
} = {}) {
  if (!authorId) throw new Error('Missing authorId');
  if (!content?.trim()) throw new Error('Post content is empty');
  if (!['video', 'image', 'text'].includes(postType)) throw new Error('Invalid postType');
  if ((postType === 'video' || postType === 'image') && !mediaFileId) throw new Error('Missing media');

  const permissions = [
    Permission.read(Role.users()),
    Permission.update(Role.user(authorId)),
    Permission.delete(Role.user(authorId)),
  ];

  const text = content.trim();
  const cachedField = getCachedPostTextField();
  const cachedTypeField = getCachedField(POST_TYPE_FIELD_KEY);
  const cachedMediaField = getCachedField(POST_MEDIA_FIELD_KEY);

  const typeCandidates = uniq([cachedTypeField, 'postType', 'type']).filter(Boolean);
  const textCandidates = uniq([cachedField, 'content', 'text', 'body', 'message', 'caption', 'description', 'postText']).filter(Boolean);
  const mediaCandidates = postType === 'text'
    ? ['']
    : uniq([cachedMediaField, 'mediaFileId', 'fileId', 'mediaId', 'assetId']).filter(Boolean);

  // 1) If we already learned the correct field name, try it first.
  if (cachedField && cachedTypeField && (postType === 'text' || cachedMediaField)) {
    try {
      const payload = { authorId, [cachedTypeField]: postType, [cachedField]: text };
      if (postType !== 'text') payload[cachedMediaField] = mediaFileId;
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.POSTS,
        ID.unique(),
        payload,
        permissions
      );
    } catch (error) {
      if (isUnknownAttributeError(error)) {
        clearCachedPostTextField();
        clearCachedField(POST_TYPE_FIELD_KEY);
        clearCachedField(POST_MEDIA_FIELD_KEY);
      } else {
        throw error;
      }
    }
  }

  // 2) Try combinations of likely schema field names.
  for (const typeField of typeCandidates) {
    for (const textField of textCandidates) {
      for (const mediaField of mediaCandidates) {
        const payload = { authorId, [typeField]: postType, [textField]: text };
        if (postType !== 'text') payload[mediaField] = mediaFileId;

        try {
          const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.POSTS, ID.unique(), payload, permissions);
          cachePostTextField(textField);
          cacheField(POST_TYPE_FIELD_KEY, typeField);
          if (postType !== 'text') cacheField(POST_MEDIA_FIELD_KEY, mediaField);
          return doc;
        } catch (error) {
          if (isUnknownAttributeError(error)) continue;
          const required = getRequiredAttributeFromError(error);
          if (required) {
            // If required is a field we can satisfy (text/type/media), retry once.
            const retryPayload = { ...payload, [required]: required === mediaField ? mediaFileId : payload[required] };
            if (!(required in retryPayload)) {
              if (postType !== 'text') retryPayload[required] = mediaFileId;
              else retryPayload[required] = text;
            }
            try {
              const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.POSTS, ID.unique(), retryPayload, permissions);
              // Cache best guess
              if (required && required !== 'authorId') cachePostTextField(required);
              cacheField(POST_TYPE_FIELD_KEY, typeField);
              if (postType !== 'text') cacheField(POST_MEDIA_FIELD_KEY, mediaField);
              return doc;
            } catch (e2) {
              if (isUnknownAttributeError(e2)) continue;
              throw e2;
            }
          }
          throw error;
        }
      }
    }
  }

  // 3) Last resort: attempt minimal payload to get a better error message.
  // This typically returns "Missing required attribute: <field>", which we surface to the UI.
  const minimal = { authorId };
  if (postType !== 'text') minimal['mediaFileId'] = mediaFileId;
  return databases.createDocument(DATABASE_ID, COLLECTIONS.POSTS, ID.unique(), minimal, permissions);
}

const POST_TEXT_FIELD_KEY = 'kalakar_posts_text_field';
const POST_TYPE_FIELD_KEY = 'kalakar_posts_type_field';
const POST_MEDIA_FIELD_KEY = 'kalakar_posts_media_field';

function getCachedPostTextField() {
  return getCachedField(POST_TEXT_FIELD_KEY);
}

function cachePostTextField(field) {
  cacheField(POST_TEXT_FIELD_KEY, field);
}

function clearCachedPostTextField() {
  clearCachedField(POST_TEXT_FIELD_KEY);
}

function getCachedField(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function cacheField(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function clearCachedField(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function isUnknownAttributeError(error) {
  const msg = String(error?.message || '');
  return msg.includes('Unknown attribute');
}

function getRequiredAttributeFromError(error) {
  const msg = String(error?.message || '');
  // Appwrite usually returns: Invalid document structure: Missing required attribute: "fieldName"
  const match = msg.match(/Missing required attribute:\s*['"]([^'"]+)['"]/i);
  return match?.[1] || '';
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}
