/**
 * Callisto-Orbit Unified Header Component (header.js)
 * Autonomous Fund & Treasury Command for Callisto Cyber Security & AI
 *
 * Provides a single reusable top navigation header across Dashboard, Specialists, and Payments.
 * - Automatically renders the responsive navbar into #orbitHeader container
 * - Adapts active badge, metadata subtitle, and quick navigation links based on data-active
 * - Seamlessly provides standard DOM element IDs: #userName, #userAvatar, #userRole, #userRoleBadge, #logoutBtn, #squadMetaHeader
 * - Handles session termination & logout uniformly
 * - Provides window.updateOrbitHeaderUser(user) for live profile synchronization
 */

(function () {
  'use strict';

  function getRoleBadge(role) {
    if (role === 'super_admin') {
      return `<span class="badge" style="background: linear-gradient(135deg, rgba(255,85,0,0.35), rgba(216,27,27,0.35)); border: 1px solid #ff5500; color: #ff9d00; font-size: 0.62rem; font-weight: 700; box-shadow: 0 0 8px rgba(255,85,0,0.3);"><i class="bi bi-star-fill text-warning me-1"></i>SUPER ADMIN</span>`;
    }
    if (role === 'admin') {
      return `<span class="badge" style="background: rgba(0,210,255,0.18); border: 1px solid var(--callisto-cyan, #00d2ff); color: var(--callisto-cyan, #00d2ff); font-size: 0.62rem; font-weight: 700; box-shadow: 0 0 8px rgba(0,210,255,0.25);"><i class="bi bi-shield-lock-fill me-1"></i>ADMIN</span>`;
    }
    return `<span class="badge" style="background: rgba(0,240,118,0.15); border: 1px solid #00f076; color: #00f076; font-size: 0.62rem; font-weight: 700;"><i class="bi bi-person-check-fill me-1"></i>MEMBER</span>`;
  }

  function renderHeader(container) {
    if (!container) return;
    const active = (container.getAttribute('data-active') || '').toLowerCase();
    const customBadge = container.getAttribute('data-badge');
    const customMeta = container.getAttribute('data-meta');

    // Page Badge configuration
    let badgeText = customBadge;
    let badgeColor = '#00e676';
    let badgeBorder = 'rgba(0, 230, 118, 0.3)';
    let badgeBg = 'rgba(0, 230, 118, 0.15)';

    if (!badgeText) {
      if (active === 'dashboard') {
        badgeText = '● ONLINE';
      } else if (active === 'specialists') {
        badgeText = '● DIRECTORY';
      } else if (active === 'payments') {
        badgeText = '● VERIFICATION';
        badgeColor = '#10b981';
        badgeBorder = 'rgba(16, 185, 129, 0.3)';
        badgeBg = 'rgba(16, 185, 129, 0.15)';
      } else {
        badgeText = '● ORBIT';
      }
    }

    // Subtitle / meta configuration
    let metaSubtitle = customMeta;
    if (!metaSubtitle) {
      if (active === 'dashboard') {
        metaSubtitle = 'Loading squad pool metrics...';
      } else if (active === 'specialists') {
        metaSubtitle = 'Specialist Registry &bull; Zero-DB Vault';
      } else if (active === 'payments') {
        metaSubtitle = 'Payment Verification &bull; Zero-DB Vault';
      } else {
        metaSubtitle = 'Callisto Cyber Security & AI';
      }
    }

    // Quick navigation buttons
    let quickLinksHtml = '';

    if (active !== 'dashboard') {
      quickLinksHtml += `
        <a href="/dashboard.html" class="btn btn-sm d-flex align-items-center gap-1 glass-subcard text-decoration-none px-2 px-sm-3 py-1" style="border-radius: 10px; font-size: 0.8rem; color: var(--callisto-cyan, #00d2ff); border: 1px solid rgba(0, 210, 255, 0.35);" title="Go to Treasury Dashboard">
          <i class="bi bi-speedometer2"></i>
          <span class="d-none d-md-inline">Dashboard</span>
        </a>
      `;
    }

    if (active !== 'specialists') {
      quickLinksHtml += `
        <a href="/specialists.html" class="btn btn-sm d-flex align-items-center gap-1 glass-subcard text-decoration-none px-2 px-sm-3 py-1" style="border-radius: 10px; font-size: 0.8rem; color: var(--callisto-cyan, #00d2ff); border: 1px solid rgba(0, 210, 255, 0.35);" title="View Specialist Directory">
          <i class="bi bi-people-fill"></i>
          <span class="d-none d-md-inline">Specialists</span>
        </a>
      `;
    }

    if (active !== 'payments') {
      quickLinksHtml += `
        <a href="/payments.html" class="btn btn-sm d-flex align-items-center gap-1 glass-subcard text-decoration-none px-2 px-sm-3 py-1" style="border-radius: 10px; font-size: 0.8rem; color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35);" title="Payment Verification Vault">
          <i class="bi bi-cash-coin" style="color: #10b981;"></i>
          <span class="d-none d-md-inline">Payments</span>
        </a>
      `;
    }

    container.innerHTML = `
      <nav class="dash-navbar d-flex justify-content-between align-items-center px-2 px-sm-3 px-md-4 py-2" style="position: relative; z-index: 100;">
        <div class="d-flex align-items-center gap-2 gap-sm-3">
          
          <!-- Mobile Sidebar Toggle Hamburger Button -->
          <button class="btn btn-sm d-lg-none glass-subcard p-1 px-2 text-warning" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="sidebarOffcanvas" title="Toggle Sidebar">
            <i class="bi bi-list fs-5"></i>
          </button>

          <!-- Callisto Logo -->
          <a href="/dashboard.html" class="text-decoration-none" style="display: flex; align-items: center;">
            <div style="width: 38px; height: 38px; min-width: 38px; border-radius: 50%; overflow: hidden; border: 1.5px solid rgba(255,85,0,0.6); background: #0c1222; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(255,85,0,0.45);">
              <img src="/assets/images/callisto-logo.jpg" alt="Logo" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
            </div>
          </a>

          <!-- Brand & Subtitle -->
          <div>
            <div class="d-flex align-items-center gap-1 gap-sm-2 flex-wrap">
              <a href="/dashboard.html" class="text-decoration-none">
                <span style="font-family: var(--font-display, 'Rajdhani', sans-serif); font-weight: 700; font-size: clamp(1rem, 3.2vw, 1.25rem); letter-spacing: 0.8px; color: #fff;">
                  CALLISTO<span class="phoenix-gradient-text">-ORBIT</span>
                </span>
              </a>
              <span class="badge d-none d-sm-inline-flex align-items-center" id="headerStatusBadge" style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; font-size: 0.65rem;">
                ${badgeText}
              </span>
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;" id="squadMetaHeader">
              ${metaSubtitle}
            </div>
          </div>
        </div>

        <!-- Active User & Quick Actions (Top Right) -->
        <div class="d-flex align-items-center gap-2">
          <!-- Active User Chip (Hidden on extra-small mobile, shown sm+) -->
          <div class="d-none d-sm-flex align-items-center gap-2 px-3 py-1 glass-panel header-user-chip" style="border-radius: 50px;">
            <img id="userAvatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=User" alt="Avatar" style="width: 28px; height: 28px; border-radius: 50%; background: #1e293b; object-fit: cover;">
            <div class="d-flex flex-column text-start">
              <div class="d-flex align-items-center gap-1">
                <span id="userName" style="font-size: 0.82rem; font-weight: 600; color: #fff; line-height: 1.1;">Loading...</span>
                <span id="userRoleBadge" class="badge" style="font-size: 0.62rem; padding: 0.2rem 0.45rem;">MEMBER</span>
              </div>
              <span id="userRole" style="font-size: 0.68rem; color: #cbd5e1; line-height: 1;">User</span>
            </div>
          </div>

          <!-- Quick Navigation Buttons -->
          ${quickLinksHtml}

          <!-- Landing Phoenix Link -->
          <a href="/" class="btn btn-sm d-flex align-items-center gap-1 glass-subcard text-decoration-none px-2 px-sm-3 py-1" style="border-radius: 10px; font-size: 0.8rem; color: var(--callisto-amber, #ff9d00); border: 1px solid rgba(255, 85, 0, 0.35);" title="Return to Landing Page">
            <i class="bi bi-house-door-fill"></i>
            <span class="d-none d-md-inline">Phoenix</span>
          </a>

          <!-- Logout Button -->
          <button id="logoutBtn" class="btn btn-sm d-flex align-items-center gap-1 px-2 px-sm-3 py-1" style="background: rgba(230, 32, 32, 0.15); color: #ff6b6b; border: 1px solid rgba(230, 32, 32, 0.3); border-radius: 10px; font-size: 0.82rem; font-weight: 600;" title="Exit Session">
            <i class="bi bi-box-arrow-right"></i>
            <span class="d-none d-sm-inline">Logout</span>
          </button>
        </div>
      </nav>
    `;

    attachHeaderEvents();
  }

  function attachHeaderEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.dataset.listenerAttached) {
      logoutBtn.dataset.listenerAttached = 'true';
      logoutBtn.addEventListener('click', async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) {}
        try {
          sessionStorage.clear();
          document.cookie = 'callisto_token=; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (e) {}

        if (window.triggerOrbitTransition) {
          window.triggerOrbitTransition('/login.html', 'SESSION TERMINATED • EXITING CLEARANCE...', 800);
        } else {
          window.location.replace('/login.html');
        }
      });
    }
  }

  // Global helper for user profile sync
  window.updateOrbitHeaderUser = function (user) {
    if (!user) return;
    const userNameElem = document.getElementById('userName');
    const userAvatarElem = document.getElementById('userAvatar');
    const userRoleElem = document.getElementById('userRole');
    const userRoleBadge = document.getElementById('userRoleBadge');

    if (userNameElem && user.name) userNameElem.textContent = user.name;
    if (userAvatarElem && user.avatar) userAvatarElem.src = user.avatar;
    if (userRoleElem) {
      userRoleElem.textContent = user.title || (user.role === 'super_admin' ? 'Founder & Lead' : (user.role === 'admin' ? 'Squad Administrator' : 'Squad Specialist'));
    }
    if (userRoleBadge && user.role) {
      userRoleBadge.innerHTML = getRoleBadge(user.role);
    }
  };

  // Synchronous initialization if container already in DOM, else on DOMContentLoaded
  function init() {
    const container = document.getElementById('orbitHeader');
    if (container && !container.dataset.rendered) {
      container.dataset.rendered = 'true';
      renderHeader(container);
    }
  }

  if (document.getElementById('orbitHeader')) {
    init();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
