/**
 * TERAFIN — Sidebar Component Renderer
 * Injects the sidebar HTML into pages dynamically.
 */

function renderSidebar(activePage = '') {
  const role = typeof AUTH !== 'undefined' ? AUTH.getRole() : 'agent';
  const isAdmin = role === 'admin';
  const isSuperviseur = ['admin', 'superviseur'].includes(role);

  const navItems = [
    {
      section: 'Général',
      items: [
        { page: 'dashboard.html', icon: gridIcon, label: 'Vue d\'ensemble', roles: ['admin', 'superviseur', 'agent'] },
      ]
    },
    {
      section: 'Gestion',
      items: [
        { page: 'clients.html', icon: usersIcon, label: 'Clients', roles: ['admin', 'superviseur', 'agent'] },
        { page: 'credits.html', icon: creditIcon, label: 'Crédits', roles: ['admin', 'superviseur', 'agent'] },
        { page: 'paiements.html', icon: walletIcon, label: 'Paiements', roles: ['admin', 'superviseur', 'agent'] },
        { page: 'caisse.html', icon: caisseIcon, label: 'Caisse', roles: ['admin', 'superviseur'] },
      ]
    },
    {
      section: 'Monitoring',
      items: [
        { page: 'notifications.html', icon: bellIcon, label: 'Notifications', badge: 'notif-badge', roles: ['admin', 'superviseur', 'agent'] },
        { page: 'audit.html', icon: logIcon, label: 'Journal d\'Audit', roles: ['admin', 'superviseur'] },
      ]
    },
    {
      section: 'Administration',
      items: [
        { page: 'utilisateurs.html', icon: teamIcon, label: 'Utilisateurs', roles: ['admin'] },
        { page: 'parametres.html', icon: settingsIcon, label: 'Paramètres', roles: ['admin'] },
      ]
    },
  ];

  const currentPage = activePage || window.location.pathname.split('/').pop() || 'dashboard.html';

  let navHTML = '';
  for (const section of navItems) {
    const visibleItems = section.items.filter(item => item.roles.includes(role));
    if (!visibleItems.length) continue;

    for (const item of visibleItems) {
      const isActive = currentPage === item.page;
      navHTML += `
        <a href="${item.page}" class="nav-item${isActive ? ' active' : ''}" data-page="${item.page}">
          <span class="nav-item-icon">${item.icon}</span>
          <span class="nav-item-text">${item.label}</span>
          ${item.badge ? `<span class="nav-item-badge hidden" id="${item.badge}">0</span>` : ''}
        </a>
      `;
    }
  }

  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <a href="dashboard.html" class="sidebar-brand">
        <div class="sidebar-brand-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="sidebar-brand-text">
          <span class="sidebar-brand-name">Terafin</span>
          <span class="sidebar-brand-sub">Gestion Crédit</span>
        </div>
      </a>

      <nav class="sidebar-nav">${navHTML}</nav>

      <div class="sidebar-user">
        <div class="sidebar-user-card">
          <div class="user-avatar" id="sidebar-avatar">A</div>
          <div class="user-info">
            <div class="user-name" id="sidebar-username">Utilisateur</div>
            <div class="user-role" id="sidebar-role">agent</div>
          </div>
          <span class="user-logout-btn" data-action="logout" title="Déconnexion">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </span>
        </div>
      </div>
    </aside>

    <button class="sidebar-toggle" id="sidebar-toggle" title="Réduire">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <div class="sidebar-overlay" id="sidebar-overlay"></div>
  `;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = sidebarHTML;
  else document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Load unread notification count
  if (typeof API !== 'undefined') {
    API.notifications.stats().then(data => {
      const badge = document.getElementById('notif-badge');
      if (badge && data && data.non_lues > 0) {
        badge.textContent = data.non_lues;
        badge.classList.remove('hidden');
      }
    }).catch(() => { });
  }
}

/* SVG Icon constants */
const gridIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`;
const usersIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const creditIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
const walletIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 0 2 2h16v4z"/><path d="M22 12a2 2 0 0 1 0 4h-4a2 2 0 0 1 0-4h4z"/><line x1="6" y1="2" x2="4" y2="6"/><line x1="10" y1="2" x2="8" y2="6"/></svg>`;
const bellIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`;
const logIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
const teamIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5z"/><path d="M20.59 22c0-3.87-3.85-7-8.59-7s-8.59 3.13-8.59 7"/></svg>`;
const settingsIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const caisseIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><circle cx="12" cy="15" r="2"/></svg>`;

