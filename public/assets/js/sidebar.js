/**
 * Callisto-Orbit Unified Sidebar Component (sidebar.js)
 * Autonomous Fund & Treasury Command for Callisto Cyber Security & AI
 *
 * Provides a single reusable sidebar across Dashboard, Specialists, and Payments.
 * - Automatically renders the sidebar into #orbitSidebar container
 * - Sets the active navigation link based on data-active attribute or URL
 * - Real-time syncs active specialist name, avatar, clearance role badge
 * - Displays pending payment count badge
 * - Provides Admin quick action buttons (+ Register Specialist, + Add Payment)
 * - Handles session termination & logout
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

  function renderSidebar(container) {
    if (!container) return;
    const active = (container.getAttribute('data-active') || '').toLowerCase();

    container.innerHTML = `
      <div class="offcanvas-lg offcanvas-start command-sidebar-offcanvas" tabindex="-1" id="sidebarOffcanvas" aria-labelledby="sidebarOffcanvasLabel">
        <!-- Mobile Offcanvas Header -->
        <div class="d-flex justify-content-between align-items-center d-lg-none mb-3 pb-2" style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div class="d-flex align-items-center gap-2">
            <img src="/assets/images/callisto-logo.jpg" alt="Logo" style="width: 28px; height: 28px; border-radius: 50%;">
            <span style="font-family: var(--font-display, 'Rajdhani', sans-serif); font-weight: 700; color: #fff; font-size: 1rem;">CALLISTO ORBIT</span>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" data-bs-target="#sidebarOffcanvas" aria-label="Close"></button>
        </div>

        <div class="command-sidebar command-sidebar-sticky">
          <!-- 1. Active Specialist Profile Card -->
          <div class="sidebar-user-card mb-3">
            <div class="d-flex align-items-center gap-2 mb-2">
              <img id="sideUserAvatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=User" alt="Specialist" style="width: 40px; height: 40px; border-radius: 12px; background: #131c31; border: 1.5px solid rgba(255,85,0,0.5); box-shadow: 0 0 10px rgba(255,85,0,0.3); flex-shrink: 0;">
              <div style="min-width: 0;">
                <div id="sideUserName" class="text-truncate text-white" style="font-weight: 700; font-size: 0.88rem; line-height: 1.2;">Specialist</div>
                <div id="sideUserRoleBadge" class="mt-1">
                  <span class="badge" style="background: rgba(0,240,118,0.15); border: 1px solid #00f076; color: #00f076; font-size: 0.62rem;">MEMBER</span>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center justify-content-between pt-2 mt-2" style="border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.72rem; color: #cbd5e1;">
              <span>Operator Status:</span>
              <span class="d-flex align-items-center gap-1 text-success" style="font-weight: 600;">
                <span class="status-indicator-dot" style="width: 6px; height: 6px; background:#00f076; box-shadow:0 0 8px #00f076;"></span>
                Clearance Active
              </span>
            </div>
          </div>

          <!-- 2. Orbit Navigation Links -->
          <div class="sidebar-nav-title">Orbit Navigation</div>
          <nav class="d-flex flex-column gap-1 mb-3">
            <a href="/dashboard.html" class="sidebar-nav-link ${active === 'dashboard' ? 'active' : ''}" id="navLinkOverview">
              <i class="bi bi-speedometer2 ${active === 'dashboard' ? '' : 'text-info'}"></i>
              <span>Treasury Dashboard</span>
            </a>
            <a href="/specialists.html" class="sidebar-nav-link ${active === 'specialists' ? 'active' : ''}" id="navLinkSpecialists">
              <i class="bi bi-people-fill ${active === 'specialists' ? '' : 'text-warning'}"></i>
              <span>Specialist Directory</span>
            </a>
            <a href="/payments.html" class="sidebar-nav-link ${active === 'payments' ? 'active' : ''}" id="navLinkPayments">
              <i class="bi bi-cash-coin" style="color: #10b981;"></i>
              <span>Payment Verification</span>
              <span id="pendingPayBadge" class="d-none ms-auto badge" style="background: rgba(245,158,11,0.25); border: 1px solid #f59e0b; color: #fbbf24; font-size: 0.6rem; padding: 0.2rem 0.45rem; border-radius: 5px;"></span>
            </a>
            <a href="/dashboard.html#sectionMonthStatus" class="sidebar-nav-link" id="navLinkStatus">
              <i class="bi bi-pie-chart-fill text-info"></i>
              <span>Monthly Pool Status</span>
            </a>
            <a href="/dashboard.html#sectionHistory" class="sidebar-nav-link" id="navLinkHistory">
              <i class="bi bi-clock-history text-warning"></i>
              <span>Collection History</span>
            </a>
            <a href="/dashboard.html#sectionArchitecture" class="sidebar-nav-link" id="navLinkArch">
              <i class="bi bi-shield-check text-success"></i>
              <span>Zero-DB Vault Info</span>
            </a>
          </nav>

          <!-- 3. Privileged Admin Quick Actions -->
          <div id="sideAdminGroup" class="d-none mb-3">
            <div class="sidebar-nav-title d-flex justify-content-between align-items-center">
              <span>Admin Actions</span>
              <span class="badge" style="background: rgba(255,85,0,0.2); color:#ff9d00; font-size:0.6rem;">ADMIN</span>
            </div>
            <nav class="d-flex flex-column gap-1">
              <button type="button" class="btn btn-sm btn-phoenix-main w-100 py-2 d-flex align-items-center justify-content-center gap-2" id="sideBtnRegisterSpecialist" style="border-radius: 10px; font-size: 0.78rem; font-weight: 600;">
                <i class="bi bi-person-plus-fill"></i>
                <span>+ Register Specialist</span>
              </button>
              <button type="button" class="btn btn-sm w-100 py-2 d-flex align-items-center justify-content-center gap-2 mt-1" id="sideBtnAddPayment" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; color: #34d399; border-radius: 10px; font-size: 0.78rem; font-weight: 600;">
                <i class="bi bi-plus-circle-fill"></i>
                <span>+ Add Payment</span>
              </button>
            </nav>
          </div>

          <!-- 4. Quick Treasury Widget -->
          <div class="sidebar-bottom-pill p-3 mb-3" id="sideTargetWidget">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span style="font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Squad Target</span>
              <span style="font-size: 0.75rem; color: #00e676; font-weight: 700;" id="sideTargetProgress">—</span>
            </div>
            <div class="progress-cyber" style="height: 6px;">
              <div id="sideProgressBar" class="progress-cyber-bar" style="width: 0%;"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2" style="font-size: 0.7rem; color: #cbd5e1;">
              <span id="sideTargetMembers">— Specialists</span>
              <span id="sideTargetUnit">Rs. 100/mo</span>
            </div>
          </div>

          <!-- 5. Return & Exit Session -->
          <div class="d-flex flex-column gap-1 pt-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
            <a href="/" class="sidebar-nav-link text-decoration-none">
              <i class="bi bi-house-door-fill text-warning"></i>
              <span>Landing Phoenix</span>
            </a>
            <button type="button" class="sidebar-nav-link text-start text-danger border-0 bg-transparent w-100" id="sideLogoutBtn" style="cursor: pointer;">
              <i class="bi bi-box-arrow-right text-danger"></i>
              <span>Exit Session</span>
            </button>
          </div>

        </div>
      </div>
    `;

    attachSidebarEvents(active);
  }

  function attachSidebarEvents(active) {
    // 1. Exit Session / Logout Handler
    const logoutBtn = document.getElementById('sideLogoutBtn');
    if (logoutBtn) {
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

    // 2. Admin action: Register Specialist
    const sideBtnRegisterSpecialist = document.getElementById('sideBtnRegisterSpecialist');
    if (sideBtnRegisterSpecialist) {
      sideBtnRegisterSpecialist.addEventListener('click', () => {
        const modalBtn = document.getElementById('btnOpenRegisterModal');
        if (modalBtn) {
          modalBtn.click();
        } else {
          window.location.href = '/specialists.html?action=register';
        }
      });
    }

    // 3. Admin action: Add Payment
    const sideBtnAddPayment = document.getElementById('sideBtnAddPayment');
    if (sideBtnAddPayment) {
      sideBtnAddPayment.addEventListener('click', () => {
        const adminPayBtn = document.getElementById('btnAddPaymentAdmin');
        if (adminPayBtn) {
          adminPayBtn.click();
        } else {
          window.location.href = '/payments.html?action=add';
        }
      });
    }

    // 4. Pending payments notification count
    loadPendingBadge();

    // 5. Squad Target live stats sync
    loadSidebarTargetStats();
  }

  async function loadPendingBadge() {
    try {
      const res = await fetch('/api/payments/pending-count');
      if (!res.ok) return;
      const data = await res.json();
      const badge = document.getElementById('pendingPayBadge');
      if (badge && data.success && data.pendingCount > 0) {
        badge.textContent = data.pendingCount;
        badge.classList.remove('d-none');
        badge.title = `${data.pendingCount} payment(s) awaiting verification`;
      } else if (badge) {
        badge.classList.add('d-none');
      }
    } catch (e) {}
  }

  async function loadSidebarTargetStats() {
    try {
      const res = await fetch('/api/collections');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.stats) {
        window.updateOrbitSidebarTarget({
          percentage: data.stats.currentMonthProgress !== undefined ? data.stats.currentMonthProgress : 0,
          membersCount: data.stats.totalMembers || 0,
          unitText: `${data.stats.currency || 'Rs. '}100/mo`
        });
      }
    } catch (e) {}
  }

  // Global helper for user profile sync
  window.updateOrbitSidebarUser = function (user) {
    if (!user) return;
    const sideUserName = document.getElementById('sideUserName');
    const sideUserAvatar = document.getElementById('sideUserAvatar');
    const sideUserRoleBadge = document.getElementById('sideUserRoleBadge');
    const sideAdminGroup = document.getElementById('sideAdminGroup');

    if (sideUserName && user.name) sideUserName.textContent = user.name;
    if (sideUserAvatar && user.avatar) sideUserAvatar.src = user.avatar;
    if (sideUserRoleBadge && user.role) {
      sideUserRoleBadge.innerHTML = getRoleBadge(user.role);
    }
    if (sideAdminGroup && (user.role === 'admin' || user.role === 'super_admin')) {
      sideAdminGroup.classList.remove('d-none');
    }
  };

  // Global helper for target stats sync
  window.updateOrbitSidebarTarget = function (stats) {
    if (!stats) return;
    const sideTargetProgress = document.getElementById('sideTargetProgress');
    const sideProgressBar = document.getElementById('sideProgressBar');
    const sideTargetMembers = document.getElementById('sideTargetMembers');
    const sideTargetUnit = document.getElementById('sideTargetUnit');

    if (stats.percentage !== undefined) {
      if (sideTargetProgress) sideTargetProgress.textContent = `${stats.percentage}%`;
      if (sideProgressBar) sideProgressBar.style.width = `${stats.percentage}%`;
    }
    if (stats.membersCount !== undefined && sideTargetMembers) {
      sideTargetMembers.textContent = `${stats.membersCount} Specialists`;
    }
    if (stats.unitText && sideTargetUnit) {
      sideTargetUnit.textContent = stats.unitText;
    }
  };

  // Auto-render when DOM is ready or immediately if already loaded
  function init() {
    const container = document.getElementById('orbitSidebar');
    if (container) {
      renderSidebar(container);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
