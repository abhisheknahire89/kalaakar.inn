import { mockData } from '../mockData.js';

let searchViewInitialized = false;

export function initSearchView() {
  if (searchViewInitialized) return;
  searchViewInitialized = true;

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', () => {
      searchInput.parentElement.classList.add('ring-2', 'ring-gold/50');
    });
    searchInput.addEventListener('blur', () => {
      searchInput.parentElement.classList.remove('ring-2', 'ring-gold/50');
    });
  }

  // Make trending pills clickable
  document.querySelectorAll('[data-view="search"] .pill-tab').forEach(pill => {
    pill.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = pill.textContent;
        handleSearch({ target: searchInput });
      }
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('search-results');
  
  if (!query) {
    // Show default view
    resultsContainer.innerHTML = `
      <h3 class="text-sm text-muted mb-3 uppercase tracking-wider">Recently Viewed</h3>
      <div class="glass-panel rounded-xl p-4 flex items-center gap-4">
        <img src="https://picsum.photos/seed/search1/100/100" class="w-12 h-12 rounded-full object-cover">
        <div class="flex-1">
          <h4 class="font-medium text-white">Priya Patel</h4>
          <p class="text-xs text-muted">Cinematographer | Ad Films</p>
        </div>
        <button class="btn-ghost border border-strong rounded-full px-3 py-1 text-xs">View</button>
      </div>
    `;
    return;
  }

  // Search through mock data
  const matchedUsers = mockData.users.filter(u => 
    u.name.toLowerCase().includes(query) || 
    u.primaryCraft.toLowerCase().includes(query) ||
    u.headline.toLowerCase().includes(query)
  );

  const matchedJobs = mockData.jobs.filter(j =>
    j.title.toLowerCase().includes(query) ||
    j.company.toLowerCase().includes(query) ||
    j.description.toLowerCase().includes(query)
  );

  let html = '';
  
  if (matchedUsers.length > 0) {
    html += '<h3 class="text-sm text-muted mb-3 uppercase tracking-wider">People</h3>';
    matchedUsers.forEach(user => {
      html += `
        <div class="glass-panel rounded-xl p-4 flex items-center gap-4 mb-3">
          <img src="${user.avatarUrl}" class="w-12 h-12 rounded-full object-cover">
          <div class="flex-1">
            <h4 class="font-medium text-white">${user.name}</h4>
            <p class="text-xs text-gold">${user.primaryCraft}</p>
            <p class="text-xs text-muted">${user.city}, ${user.state}</p>
          </div>
          <button class="btn-ghost border border-strong rounded-full px-3 py-1 text-xs hover:border-gold hover:text-gold">Connect</button>
        </div>
      `;
    });
  }

  if (matchedJobs.length > 0) {
    html += '<h3 class="text-sm text-muted mb-3 mt-4 uppercase tracking-wider">Jobs</h3>';
    matchedJobs.forEach(job => {
      html += `
        <div class="glass-panel rounded-xl p-4 flex items-center gap-4 mb-3">
          <div class="w-12 h-12 rounded-lg bg-surface flex items-center justify-center text-gold">
            <i data-lucide="briefcase" class="w-6 h-6"></i>
          </div>
          <div class="flex-1">
            <h4 class="font-medium text-white">${job.title}</h4>
            <p class="text-xs text-muted">${job.company} | ${job.location}</p>
          </div>
          <button class="btn-ghost border border-strong rounded-full px-3 py-1 text-xs hover:border-gold hover:text-gold">Apply</button>
        </div>
      `;
    });
  }

  if (!html) {
    html = `
      <div class="text-center py-12">
        <div class="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center text-muted">
          <i data-lucide="search-x" class="w-8 h-8"></i>
        </div>
        <h3 class="font-medium text-white mb-2">No results found</h3>
        <p class="text-sm text-muted">Try a different search term</p>
      </div>
    `;
  }

  resultsContainer.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}
