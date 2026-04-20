import { GUEST_POSTS_KEY } from '../utils/guestMode.js';

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWriteJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function getSeedCreators() {
  return [
    {
      $id: 'u1',
      userId: 'u1',
      name: 'Priya Sharma',
      primaryCraft: 'actor',
      city: 'Mumbai',
      reliability: 84,
      avatar: '',
      headline: 'Actor • Screen & Stage',
    },
    {
      $id: 'u2',
      userId: 'u2',
      name: 'Arjun Mehta',
      primaryCraft: 'editor',
      city: 'Pune',
      reliability: 79,
      avatar: '',
      headline: 'Editor • Color & Cuts',
    },
    {
      $id: 'u3',
      userId: 'u3',
      name: 'Sunita Rao',
      primaryCraft: 'musician',
      city: 'Bengaluru',
      reliability: 82,
      avatar: '',
      headline: 'Musician • Original Scores',
    },
    {
      $id: 'u4',
      userId: 'u4',
      name: 'Ravi DOP',
      primaryCraft: 'dop',
      city: 'Delhi',
      reliability: 77,
      avatar: '',
      headline: 'Cinematography • Lighting',
    },
    {
      $id: 'u5',
      userId: 'u5',
      name: 'Kavya',
      primaryCraft: 'director',
      city: 'Mumbai',
      reliability: 86,
      avatar: '',
      headline: 'Director • Short Films',
    },
    {
      $id: 'u6',
      userId: 'u6',
      name: 'Dev Writer',
      primaryCraft: 'writer',
      city: 'Hyderabad',
      reliability: 73,
      avatar: '',
      headline: 'Writer • Screenplays',
    },
  ];
}

export function getSeedPosts() {
  const creators = getSeedCreators();
  const byId = Object.fromEntries(creators.map((c) => [c.userId, c]));
  const mk = (id, authorId, postType, content) => {
    const c = byId[authorId];
    return {
      $id: id,
      authorId,
      authorName: c?.name || 'Kalakar User',
      authorHeadline: c?.headline || 'Creator',
      authorAvatar: c?.avatar || '',
      postType,
      content,
      mediaFileId: '',
      mediaUrl: '',
      applaudCount: Math.floor(Math.random() * 30),
      commentCount: Math.floor(Math.random() * 12),
      viewCount: Math.floor(Math.random() * 500),
      $createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
    };
  };

  // Keep video-first identity but without actual media: stage view renders placeholders.
  return [
    mk('p_seed_1', 'u1', 'video', 'My latest reel — dramatic monologue. Thoughts?'),
    mk('p_seed_2', 'u2', 'image', 'Color graded this scene — noir + gold.'),
    mk('p_seed_3', 'u3', 'text', 'Just dropped my OST. Looking for short film scoring gigs.'),
    mk('p_seed_4', 'u4', 'video', 'Shot on RED. Lighting breakdown in comments.'),
    mk('p_seed_5', 'u5', 'image', 'Behind the scenes — blocking rehearsal.'),
    mk('p_seed_6', 'u6', 'text', 'Screenplay excerpt: “The city eats its own shadows.”'),
  ];
}

export function listGuestPosts() {
  const posts = safeReadJson(GUEST_POSTS_KEY, []);
  return Array.isArray(posts) ? posts : [];
}

export function addGuestPost(post) {
  const posts = listGuestPosts();
  posts.unshift(post);
  safeWriteJson(GUEST_POSTS_KEY, posts.slice(0, 50));
}

export function getGuestFeedPosts() {
  const seeded = getSeedPosts();
  const guest = listGuestPosts();
  return [...guest, ...seeded];
}

