import { client, databases, DATABASE_ID, COLLECTIONS, Query } from '../appwriteClient.js';
import { showToast } from '../components/toast.js';
import { isGuestMode } from '../utils/guestMode.js';

export async function initNotificationListener(userId, { onUnreadChange } = {}) {
  if (isGuestMode()) return { close() {} };
  const sub = await client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.NOTIFICATIONS}.documents`, response => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      const notif = response.payload;
      if (notif.userId === userId) {
        showToast(notif.content, 'info');
        fetchUnreadCount(userId, { onUnreadChange });
      }
    }
  });
  return sub;
}

export async function fetchUnreadCount(userId, { onUnreadChange } = {}) {
  if (isGuestMode()) {
    onUnreadChange?.(0);
    const badge = document.getElementById('notif-badge');
    const badgeMobile = document.getElementById('notif-badge-mobile');
    badge?.classList.add('hidden');
    badgeMobile?.classList.add('hidden');
    return;
  }
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, [
      Query.equal('userId', userId),
      Query.equal('isRead', false),
      Query.limit(1)
    ]);
    onUnreadChange?.(result.total);
    const badge = document.getElementById('notif-badge');
    const badgeMobile = document.getElementById('notif-badge-mobile');
    if (badge) {
      if (result.total > 0) {
        badge.textContent = formatBadgeCount(result.total);
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
    if (badgeMobile) {
      if (result.total > 0) {
        badgeMobile.textContent = formatBadgeCount(result.total);
        badgeMobile.classList.remove('hidden');
      } else {
        badgeMobile.classList.add('hidden');
      }
    }
  } catch (error) {
    console.error('Failed to fetch unread count', error);
  }
}

function formatBadgeCount(count) {
  const n = Number(count) || 0;
  if (n <= 0) return '';
  if (n > 9) return '9+';
  return String(n);
}
