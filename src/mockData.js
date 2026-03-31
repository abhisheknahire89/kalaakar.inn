export const mockData = {
  users: [
    {
      $id: 'user_1',
      name: 'Aarav Sharma',
      headline: 'Lead Actor | Theatre & Film',
      city: 'Mumbai',
      state: 'Maharashtra',
      avatarFileId: null,
      avatarUrl: 'https://picsum.photos/seed/aarav/200/200',
      primaryCraft: 'Actor',
      vouchCount: 42,
      profileViews: 1205
    },
    {
      $id: 'user_2',
      name: 'Priya Patel',
      headline: 'Cinematographer | Ad Films',
      city: 'Pune',
      state: 'Maharashtra',
      avatarFileId: null,
      avatarUrl: 'https://picsum.photos/seed/priya/200/200',
      primaryCraft: 'DOP',
      vouchCount: 89,
      profileViews: 3400
    },
    {
      $id: 'user_3',
      name: 'Vikram Singh',
      headline: 'Film Editor | Premiere Pro & DaVinci',
      city: 'Hyderabad',
      state: 'Telangana',
      avatarFileId: null,
      avatarUrl: 'https://picsum.photos/seed/vikram/200/200',
      primaryCraft: 'Editor',
      vouchCount: 15,
      profileViews: 890
    },
    {
      $id: 'user_4',
      name: 'Neha Gupta',
      headline: 'Casting Director @ Studio9',
      city: 'Mumbai',
      state: 'Maharashtra',
      avatarFileId: null,
      avatarUrl: 'https://picsum.photos/seed/neha/200/200',
      primaryCraft: 'Casting Director',
      vouchCount: 120,
      profileViews: 5600
    }
  ],
  posts: [
    {
      $id: 'post_1',
      userId: 'user_1',
      authorName: 'Aarav Sharma',
      authorHeadline: 'Lead Actor | Theatre & Film',
      authorAvatar: 'https://picsum.photos/seed/aarav/200/200',
      content: 'Just wrapped up an amazing theatre workshop in Andheri! The energy was unreal. Can\'t wait to apply these new techniques on set. 🎭✨ #Acting #MumbaiTheatre',
      mediaUrl: 'https://picsum.photos/seed/theatre/800/600',
      mediaType: 'image',
      applaudCount: 124,
      commentCount: 18,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      $id: 'post_2',
      userId: 'user_2',
      authorName: 'Priya Patel',
      authorHeadline: 'Cinematographer | Ad Films',
      authorAvatar: 'https://picsum.photos/seed/priya/200/200',
      content: 'Testing out the new RED V-Raptor on a commercial shoot today. The dynamic range is absolutely insane. 🎥🔥',
      mediaUrl: 'https://picsum.photos/seed/camera/800/600',
      mediaType: 'image',
      applaudCount: 342,
      commentCount: 45,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      $id: 'post_3',
      userId: 'user_3',
      authorName: 'Vikram Singh',
      authorHeadline: 'Film Editor | Premiere Pro & DaVinci',
      authorAvatar: 'https://picsum.photos/seed/vikram/200/200',
      content: 'Color grading a short film set in the 90s. Trying to get that perfect nostalgic film look. Any tips for emulating Kodak Portra? 🎞️',
      mediaUrl: null,
      mediaType: null,
      applaudCount: 56,
      commentCount: 12,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    }
  ],
  jobs: [
    {
      $id: 'job_1',
      title: 'Lead Actor for Indie Feature',
      company: 'Phantom Films',
      location: 'Mumbai, MH',
      type: 'Feature Film',
      description: 'Looking for a male lead (25-30 yrs) for an upcoming indie feature film shooting in Mumbai. Must be fluent in Hindi and Marathi.',
      postedBy: 'user_4',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'open'
    },
    {
      $id: 'job_2',
      title: 'Freelance DOP for Music Video',
      company: 'T-Series',
      location: 'Hyderabad, TS',
      type: 'Music Video',
      description: 'Need an experienced DOP with their own gear (preferably Sony FX3 or similar) for a 2-day music video shoot in Hyderabad.',
      postedBy: 'user_1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open'
    },
    {
      $id: 'job_3',
      title: 'Video Editor for YouTube Channel',
      company: 'FilterCopy',
      location: 'Remote',
      type: 'Web Series',
      description: 'Looking for a fast and creative editor for our upcoming comedy sketches. Must know Premiere Pro and After Effects.',
      postedBy: 'user_2',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open'
    }
  ],
  conversations: [
    {
      $id: 'conv_1',
      participants: ['current_user', 'user_4'],
      otherUser: {
        name: 'Neha Gupta',
        avatarUrl: 'https://picsum.photos/seed/neha/200/200',
        headline: 'Casting Director @ Studio9'
      },
      lastMessage: 'Hey, are you available for an audition next Tuesday?',
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      unreadCount: 1
    },
    {
      $id: 'conv_2',
      participants: ['current_user', 'user_2'],
      otherUser: {
        name: 'Priya Patel',
        avatarUrl: 'https://picsum.photos/seed/priya/200/200',
        headline: 'Cinematographer | Ad Films'
      },
      lastMessage: 'Thanks for the recommendation! The shoot went great.',
      lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      unreadCount: 0
    }
  ],
  notifications: [
    {
      $id: 'notif_1',
      type: 'applaud',
      actorName: 'Priya Patel',
      actorAvatar: 'https://picsum.photos/seed/priya/200/200',
      content: 'applauded your post.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
      isRead: false
    },
    {
      $id: 'notif_2',
      type: 'connection',
      actorName: 'Vikram Singh',
      actorAvatar: 'https://picsum.photos/seed/vikram/200/200',
      content: 'sent you a connection request.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      isRead: false
    },
    {
      $id: 'notif_3',
      type: 'job',
      actorName: 'Neha Gupta',
      actorAvatar: 'https://picsum.photos/seed/neha/200/200',
      content: 'posted a new casting call: Lead Actor for Indie Feature.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      isRead: true
    }
  ],
  profile: {
    name: 'Guest User',
    headline: 'Aspiring Filmmaker',
    city: 'Mumbai',
    state: 'Maharashtra',
    primaryCraft: 'Director',
    bio: 'Passionate about telling stories that matter. Currently working on my first short film.',
    profileViews: 42,
    impressions: 156,
    vouchCount: 3,
    avatarUrl: 'https://picsum.photos/seed/guest/200/200'
  }
};

export function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
