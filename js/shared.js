/**
 * TERAFIN — Shared UI Utilities
 * Toast notifications, sidebar, theme toggle, etc.
 */

/* ══════════════════════════════════
   TOAST NOTIFICATION SYSTEM
══════════════════════════════════ */
const TOAST = (() => {
    function show(type, title, message, duration = 4500) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon" style="color:#10b981"><polyline points="20 6 9 17 4 12"/></svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon" style="color:#ef4444"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon" style="color:#f59e0b"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="toast-icon" style="color:#6366f1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      ${icons[type] || ''}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-message">${message}</div>` : ''}
      </div>
    `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInRight .3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    return {
        success: (title, msg) => show('success', title, msg),
        error: (title, msg) => show('error', title, msg),
        warning: (title, msg) => show('warning', title, msg),
        info: (title, msg) => show('info', title, msg),
    };
})();

/* ══════════════════════════════════
   THEME MANAGEMENT
══════════════════════════════════ */
const THEME = (() => {
    const STORAGE_KEY = 'terafin_theme';
    const DEFAULT = 'dark';

    function getCurrent() {
        return localStorage.getItem(STORAGE_KEY) || DEFAULT;
    }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        // Update icon
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const isDark = theme === 'dark';
            btn.title = isDark ? 'Mode clair' : 'Mode sombre';
            btn.innerHTML = isDark
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
        }
    }

    function toggle() {
        const current = getCurrent();
        apply(current === 'dark' ? 'light' : 'dark');
    }

    function init() {
        apply(getCurrent());
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.addEventListener('click', toggle);
    }

    return { init, toggle, getCurrent, apply };
})();

/* ══════════════════════════════════
   SIDEBAR MANAGER
══════════════════════════════════ */
const SIDEBAR = (() => {
    const STORAGE_KEY = 'terafin_sidebar_collapsed';

    function isCollapsed() {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    function apply(collapsed) {
        const sidebar = document.getElementById('sidebar');
        const content = document.getElementById('main-content');
        if (!sidebar) return;
        if (collapsed) {
            sidebar.classList.add('collapsed');
            content?.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
            content?.classList.remove('collapsed');
        }
        localStorage.setItem(STORAGE_KEY, collapsed);
    }

    function toggle() {
        apply(!isCollapsed());
    }

    function init() {
        apply(isCollapsed());
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) toggleBtn.addEventListener('click', toggle);

        // Mobile overlay
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                document.getElementById('sidebar')?.classList.remove('mobile-open');
                overlay.classList.remove('active');
            });
        }

        const mobileBtn = document.getElementById('mobile-menu-btn');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                document.getElementById('sidebar')?.classList.toggle('mobile-open');
                overlay?.classList.toggle('active');
            });
        }

        // Mark active nav item
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.nav-item[data-page]').forEach(item => {
            if (item.dataset.page === currentPage) item.classList.add('active');
        });
    }

    return { init, toggle };
})();

/* ══════════════════════════════════
   MODAL MANAGER
══════════════════════════════════ */
const MODAL = (() => {
    function open(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close(modalId) {
        const overlay = document.getElementById(modalId);
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function closeAll() {
        document.querySelectorAll('.modal-overlay.active').forEach(el => {
            el.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    function init() {
        document.querySelectorAll('[data-modal-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.dataset.modalClose || btn.closest('.modal-overlay')?.id;
                if (modalId) close(modalId);
                else closeAll();
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close(overlay.id);
            });
        });

        document.querySelectorAll('[data-modal-open]').forEach(btn => {
            btn.addEventListener('click', () => open(btn.dataset.modalOpen));
        });
    }

    return { open, close, closeAll, init };
})();

/* ══════════════════════════════════
   ANIMATED COUNTER (KPI)
══════════════════════════════════ */
function animateCounter(el, target, duration = 1000, prefix = '', suffix = '') {
    const start = 0;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = start + (target - start) * eased;
        el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString('fr-FR')) + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

/* ══════════════════════════════════
   FORMAT HELPERS
══════════════════════════════════ */
function formatCurrency(amount, currency = 'CFA') {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' ' + currency;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function creditStatusBadge(statut) {
    // Backend enum: StatutCredit (Python) → string values
    const map = {
        // English enum values (actual DB values)
        'pending': ['badge-pending', 'En attente'],
        'active': ['badge-active', 'Actif'],
        'overdue': ['badge-late', 'En retard'],
        'completed': ['badge-done', 'Terminé'],
        // French aliases (in case)
        'en attente': ['badge-pending', 'En attente'],
        'actif': ['badge-active', 'Actif'],
        'en retard': ['badge-late', 'En retard'],
        'termine': ['badge-done', 'Terminé'],
        'soldé': ['badge-done', 'Soldé'],
    };
    const [cls, label] = map[statut] || ['badge-pending', statut];
    return `<span class="badge ${cls}">${label}</span>`;
}

function roleLabel(role) {
    const map = { admin: 'Administrateur', superviseur: 'Superviseur', agent: 'Agent' };
    return map[role] || role;
}

/* ══════════════════════════════════
   INIT (called by every page)
══════════════════════════════════ */
function initShared() {
    THEME.init();
    SIDEBAR.init();
    MODAL.init();
    if (typeof AUTH !== 'undefined') AUTH.populateSidebarUser();

    // Logout buttons
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', () => AUTH.logout());
    });
}
