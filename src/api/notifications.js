import { client, databases, DATABASE_ID, COLLECTIONS, Query } from '../appwriteClient.js';
import { showToast } from '../components/toast.js';

export function initNotificationListener(userId) {
  client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.NOTIFICATIONS}.documents`, response => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      const notif = response.payload;
      if (notif.userId === userId) {
        showToast(notif.content, 'info');
        fetchUnreadCount(userId);
      }
    }
  });
}

export function initMessageListener(userId) {
  client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`, response => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      fetchUnreadCount(userId);
    }
  });
}

export async function fetchUnreadCount(userId) {
  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.NOTIFICATIONS, [
      Query.equal('userId', userId),
      Query.equal('isRead', false),
      Query.limit(1)
    ]);
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (result.total > 0) {
        badge.textContent = result.total;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  } catch (error) {
    console.error('Failed to fetch unread count', error);
  }
}
