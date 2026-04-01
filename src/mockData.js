export const mockData = {
  users: [
    {
      $id: 'user_1',
      name: 'Aarav Sharma',
      headline: 'Lead Actor | Theatre & Film',
      city: 'Mumbai',
      state: 'Maharashtra',
      avatarFileId: null,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
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
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
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
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
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
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      primaryCraft: 'Casting Director',
      vouchCount: 120,
      profileViews: 5600
    },
    {
      $id: 'user_5',
      name: 'Raj Malhotra',
      headline: 'Film Director | Short Films & Music Videos',
      city: 'Delhi',
      state: 'Delhi',
      avatarFileId: null,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      primaryCraft: 'Director',
      vouchCount: 67,
      profileViews: 2100
    },
    {
      $id: 'user_6',
      name: 'Anjali Rao',
      headline: 'Choreographer | Bollywood Dance',
      city: 'Mumbai',
      state: 'Maharashtra',
      avatarFileId: null,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      primaryCraft: 'Dancer',
      vouchCount: 95,
      profileViews: 4200
    }
  ],
  posts: [
    {
      $id: 'post_1',
      userId: 'user_1',
      authorName: 'Aarav Sharma',
      authorHeadline: 'Lead Actor | Theatre & Film',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      content: 'Just wrapped up an amazing theatre workshop in Andheri! The energy was unreal. Can\'t wait to apply these new techniques on set.',
      mediaUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop',
      mediaType: 'image',
      applaudCount: 124,
      commentCount: 18,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      $id: 'post_2',
      userId: 'user_2',
      authorName: 'Priya Patel',
      authorHeadline: 'Cinematographer | Ad Films',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      content: 'Testing out the new RED V-Raptor on a commercial shoot today. The dynamic range is absolutely insane!',
      mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop',
      mediaType: 'image',
      applaudCount: 342,
      commentCount: 45,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      $id: 'post_3',
      userId: 'user_5',
      authorName: 'Raj Malhotra',
      authorHeadline: 'Film Director | Short Films & Music Videos',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      content: 'Behind the scenes from our latest music video shoot. So proud of this team! Releasing next week.',
      mediaUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
      mediaType: 'image',
      applaudCount: 256,
      commentCount: 32,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      $id: 'post_4',
      userId: 'user_6',
      authorName: 'Anjali Rao',
      authorHeadline: 'Choreographer | Bollywood Dance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
      content: 'New dance reel dropping tomorrow! Classical meets contemporary. Stay tuned.',
      mediaUrl: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&h=600&fit=crop',
      mediaType: 'image',
      applaudCount: 189,
      commentCount: 27,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      $id: 'post_5',
      userId: 'user_3',
      authorName: 'Vikram Singh',
      authorHeadline: 'Film Editor | Premiere Pro & DaVinci',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      content: 'Color grading a short film set in the 90s. Trying to get that perfect nostalgic film look. Any tips for emulating Kodak Portra?',
      mediaUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=600&fit=crop',
      mediaType: 'image',
      applaudCount: 78,
      commentCount: 15,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
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
    },
    {
      $id: 'job_4',
      title: 'Dance Choreographer for Ad Film',
      company: 'Leo Burnett India',
      location: 'Mumbai, MH',
      type: 'Commercial',
      description: 'Seeking creative choreographer for a 30-sec commercial featuring contemporary and classical fusion.',
      postedBy: 'user_4',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open'
    },
    {
      $id: 'job_5',
      title: 'Assistant Director for Short Film',
      company: 'Pocket Aces',
      location: 'Delhi, DL',
      type: 'Short Film',
      description: 'Looking for an enthusiastic AD for our upcoming social drama short film. Experience with tight schedules preferred.',
      postedBy: 'user_5',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'open'
    }
  ],
  conversations: [
    {
      $id: 'conv_1',
      participants: ['current_user', 'user_4'],
      otherUser: {
        name: 'Neha Gupta',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        headline: 'Casting Director @ Studio9'
      },
      lastMessage: 'Hey, are you available for an audition next Tuesday?',
      lastMessageTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      unreadCount: 1
    },
    {
      $id: 'conv_2',
      participants: ['current_user', 'user_2'],
      otherUser: {
        name: 'Priya Patel',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        headline: 'Cinematographer | Ad Films'
      },
      lastMessage: 'Thanks for the recommendation! The shoot went great.',
      lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0
    },
    {
      $id: 'conv_3',
      participants: ['current_user', 'user_5'],
      otherUser: {
        name: 'Raj Malhotra',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        headline: 'Film Director'
      },
      lastMessage: 'Would love to collaborate on your next project!',
      lastMessageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      unreadCount: 0
    }
  ],
  notifications: [
    {
      $id: 'notif_1',
      type: 'applaud',
      actorName: 'Priya Patel',
      actorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      content: 'applauded your post.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      $id: 'notif_2',
      type: 'connection',
      actorName: 'Vikram Singh',
      actorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      content: 'sent you a connection request.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      $id: 'notif_3',
      type: 'job',
      actorName: 'Neha Gupta',
      actorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      content: 'posted a new casting call: Lead Actor for Indie Feature.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      $id: 'notif_4',
      type: 'vouch',
      actorName: 'Raj Malhotra',
      actorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
      content: 'vouched for your directing skills.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
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
