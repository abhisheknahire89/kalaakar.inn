import { mockData, getTimeAgo } from '../mockData.js';

export function initNotificationsView() {
  const list = document.getElementById('notifications-list');
  list.innerHTML = '';
  
  mockData.notifications.forEach(notif => {
    const timeAgo = getTimeAgo(notif.createdAt);
    let icon = 'bell';
    if (notif.type === 'applaud') icon = 'heart';
    if (notif.type === 'connection') icon = 'user-plus';
    if (notif.type === 'job') icon = 'briefcase';

    list.innerHTML += `
      <div class="glass-panel rounded-xl p-4 flex gap-4 items-start transition-colors ${notif.isRead ? 'opacity-70' : 'bg-surface/50'}">
        <div class="relative shrink-0">
          <img src="${notif.actorAvatar}" class="w-10 h-10 rounded-full object-cover border border-strong">
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-surface rounded-full flex items-center justify-center border border-strong text-gold">
            <i data-lucide="${icon}" class="w-3 h-3"></i>
          </div>
        </div>
        <div class="flex-1">
          <p class="text-sm text-gray-200 leading-snug"><span class="font-medium text-white">${notif.actorName}</span> ${notif.content}</p>
          <span class="text-xs text-muted mt-1 block">${timeAgo}</span>
        </div>
        ${!notif.isRead ? '<div class="w-2 h-2 rounded-full bg-gold mt-2 shrink-0"></div>' : ''}
      </div>
    `;
  });

  if (window.lucide) window.lucide.createIcons();
}
