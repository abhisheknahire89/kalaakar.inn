import { mockData, getTimeAgo } from '../mockData.js';

export function initMessagesView() {
  const list = document.getElementById('conversations-list');
  list.innerHTML = '';
  
  mockData.conversations.forEach(conv => {
    const timeAgo = getTimeAgo(conv.lastMessageTime);
    const unreadBadge = conv.unreadCount > 0 
      ? `<span class="bg-gold text-black text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">${conv.unreadCount}</span>`
      : '';
      
    list.innerHTML += `
      <div class="p-4 border-b border-strong hover:bg-surface cursor-pointer flex gap-4 items-center transition-colors">
        <img src="${conv.otherUser.avatarUrl}" class="w-12 h-12 rounded-full border border-strong object-cover">
        <div class="flex-1 overflow-hidden">
          <div class="flex justify-between items-center mb-1">
            <h4 class="font-medium text-sm text-white truncate flex items-center">${conv.otherUser.name} ${unreadBadge}</h4>
            <span class="text-[10px] text-muted whitespace-nowrap ml-2">${timeAgo}</span>
          </div>
          <p class="text-xs ${conv.unreadCount > 0 ? 'text-white font-medium' : 'text-muted'} truncate">${conv.lastMessage}</p>
        </div>
      </div>
    `;
  });
}
