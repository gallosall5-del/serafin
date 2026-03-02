/**
 * TERAFIN — Auth Module
 * Handles JWT token management, role checks, and logout.
 */

const AUTH = (() => {
  const TOKEN_KEY = 'terafin_access_token';
  const REFRESH_KEY = 'terafin_refresh_token';
  const USER_KEY = 'terafin_user';

  /* ── Storage helpers ── */
  function saveTokens(accessToken, refreshToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  }

  function getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getRefreshToken() {
    return localStorage.getItem(REFRESH_KEY);
  }

  function clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /* ── JWT Decode (without library) ── */
  function decodeJWT(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /* ── Get current user from token ── */
  function getCurrentUser() {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch { /* fallthrough */ }
    }
    const token = getAccessToken();
    if (!token) return null;
    const payload = decodeJWT(token);
    if (!payload) return null;
    const user = {
      // sub = email in this backend
      email: payload.sub || '',
      username: payload.sub ? payload.sub.split('@')[0] : 'Utilisateur',
      role: payload.role || 'agent',
      exp: payload.exp,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }

  /* ── Token expiry check ── */
  function isTokenExpired(token) {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    return Date.now() / 1000 > payload.exp;
  }

  /* ── Is authenticated ── */
  function isAuthenticated() {
    const token = getAccessToken();
    return !!token && !isTokenExpired(token);
  }

  /* ── Role checks ── */
  function getRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
  }

  function isAdmin() { return getRole() === 'admin'; }
  function isSuperviseur() { return ['admin', 'superviseur'].includes(getRole()); }
  function isAgent() { return !!getRole(); } // any logged-in user

  /* ── Guard: redirect to login if not authenticated ── */
  function requireAuth(redirectTo = 'login.html') {
    if (!isAuthenticated()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }

  /* ── Guard: redirect if role insufficient ── */
  function requireRole(roles, redirectTo = 'dashboard.html') {
    if (!isAuthenticated()) { window.location.href = 'login.html'; return false; }
    const role = getRole();
    if (!roles.includes(role)) { window.location.href = redirectTo; return false; }
    return true;
  }

  /* ── Logout ── */
  function logout() {
    clearTokens();
    window.location.href = 'login.html';
  }

  /* ── Save email temporarily (between login→OTP pages) ── */
  function savePendingEmail(email) {
    sessionStorage.setItem('terafin_pending_email', email);
  }

  function getPendingEmail() {
    return sessionStorage.getItem('terafin_pending_email') || '';
  }

  function clearPendingEmail() {
    sessionStorage.removeItem('terafin_pending_email');
  }

  /* ── Populate sidebar user info ── */
  function populateSidebarUser() {
    const user = getCurrentUser();
    if (!user) return;
    const nameEl = document.getElementById('sidebar-username');
    const roleEl = document.getElementById('sidebar-role');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = user.username;
    if (roleEl) roleEl.textContent = roleLabel(user.role);
    if (avatarEl) avatarEl.textContent = (user.username || 'U').charAt(0).toUpperCase();

    // Hide admin-only items
    if (!isAdmin()) {
      document.querySelectorAll('[data-role="admin"]').forEach(el => el.classList.add('hidden'));
    }
    // Hide superviseur-only items
    if (!isSuperviseur()) {
      document.querySelectorAll('[data-role="superviseur"]').forEach(el => el.classList.add('hidden'));
    }
  }

  return {
    saveTokens, getAccessToken, getRefreshToken, clearTokens,
    decodeJWT, getCurrentUser, isTokenExpired, isAuthenticated,
    getRole, isAdmin, isSuperviseur, isAgent,
    requireAuth, requireRole, logout,
    savePendingEmail, getPendingEmail, clearPendingEmail,
    populateSidebarUser,
  };
})();
