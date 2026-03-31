import { mockData, getTimeAgo } from '../mockData.js';

export function initJobsView() {
  const container = document.getElementById('jobs-content');
  container.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="jobs-grid"></div>';
  
  const grid = document.getElementById('jobs-grid');
  
  mockData.jobs.forEach(job => {
    const timeAgo = getTimeAgo(job.createdAt);
    grid.innerHTML += `
      <div class="glass-panel rounded-xl p-6 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-gold/5">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-poppins font-semibold text-lg text-white">${job.title}</h3>
          <span class="text-xs bg-gold/10 text-gold px-3 py-1 rounded-full border border-gold/20 whitespace-nowrap">${job.type}</span>
        </div>
        <div class="flex items-center gap-4 text-sm text-muted mb-4">
          <span class="flex items-center gap-1"><i data-lucide="building-2" class="w-4 h-4"></i> ${job.company}</span>
          <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-4 h-4"></i> ${job.location}</span>
        </div>
        <p class="text-sm mb-6 line-clamp-2 text-gray-300 leading-relaxed">${job.description}</p>
        <div class="flex items-center justify-between mt-auto pt-4 border-t border-strong">
          <span class="text-xs text-muted flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> Posted ${timeAgo}</span>
          <button class="btn-ghost border border-strong rounded-full px-6 py-2 text-sm hover:border-gold hover:text-gold transition-colors flex items-center gap-2">
            Apply Now <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  });

  if (window.lucide) window.lucide.createIcons();
}
