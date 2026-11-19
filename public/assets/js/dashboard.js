/**
 * Callisto-Orbit Dashboard Logic
 * Handles session verification, metrics loading, member contribution display,
 * and Privileged Admin Console (NIC registration, role management).
 */

document.addEventListener('DOMContentLoaded', async () => {
  const userNameElem = document.getElementById('userName');
  const userRoleElem = document.getElementById('userRole');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const userAvatarElem = document.getElementById('userAvatar');
  const logoutBtn = document.getElementById('logoutBtn');

  // Sidebar elements
  const sideUserAvatar = document.getElementById('sideUserAvatar');
  const sideUserName = document.getElementById('sideUserName');
  const sideUserRoleBadge = document.getElementById('sideUserRoleBadge');
  const sideAdminGroup = document.getElementById('sideAdminGroup');
  const sideTargetProgress = document.getElementById('sideTargetProgress');
  const sideProgressBar = document.getElementById('sideProgressBar');
  const sideTargetMembers = document.getElementById('sideTargetMembers');
  const sideTargetUnit = document.getElementById('sideTargetUnit');
  const sideBtnRegisterSpecialist = document.getElementById('sideBtnRegisterSpecialist');
  const sideLogoutBtn = document.getElementById('sideLogoutBtn');

  // Stats
  const statTotalCollected = document.getElementById('statTotalCollected');
  const statMonthlyTarget = document.getElementById('statMonthlyTarget');
  const statMonthlyTargetFormula = document.getElementById('statMonthlyTargetFormula');
  const statProgressPercentage = document.getElementById('statProgressPercentage');
  const statProgressBar = document.getElementById('statProgressBar');
  const statRosterCount = document.getElementById('statRosterCount');
  const squadMetaHeader = document.getElementById('squadMetaHeader');
  const membersGrid = document.getElementById('membersGrid');
  const historyList = document.getElementById('historyList');

  // Admin Console elements
  const adminConsoleSection = document.getElementById('adminConsoleSection');
  const adminTierBadge = document.getElementById('adminTierBadge');
  const adminSpecialistsTbody = document.getElementById('adminSpecialistsTbody');
  const adminConsoleAlert = document.getElementById('adminConsoleAlert');
  const btnOpenRegisterModal = document.getElementById('btnOpenRegisterModal');

  // Register Modal elements
  const modalRegisterSpecialist = document.getElementById('modalRegisterSpecialist');
  const formRegisterSpecialist = document.getElementById('formRegisterSpecialist');
  const modalRegAlert = document.getElementById('modalRegAlert');
  const regName = document.getElementById('regName');
  const regNic = document.getElementById('regNic');
  const regRole = document.getElementById('regRole');
  const regUsername = document.getElementById('regUsername');
  const regTitle = document.getElementById('regTitle');
  const regEmail = document.getElementById('regEmail');
  const optSuperAdmin = document.getElementById('optSuperAdmin');
  const btnSubmitRegister = document.getElementById('btnSubmitRegister');
  const regPasswordGroup = document.getElementById('regPasswordGroup');
  const regPassword = document.getElementById('regPassword');
  const btnToggleRegPassword = document.getElementById('btnToggleRegPassword');
  const eyeIconRegPassword = document.getElementById('eyeIconRegPassword');

  // Edit Modal elements
  const modalEditSpecialist = document.getElementById('modalEditSpecialist');
  const formEditSpecialist = document.getElementById('formEditSpecialist');
  const modalEditAlert = document.getElementById('modalEditAlert');
  const editMemberId = document.getElementById('editMemberId');
  const editName = document.getElementById('editName');
  const editNic = document.getElementById('editNic');
  const editRole = document.getElementById('editRole');
  const editTitle = document.getElementById('editTitle');
  const optEditSuperAdmin = document.getElementById('optEditSuperAdmin');
  const btnSubmitEdit = document.getElementById('btnSubmitEdit');
  const editPasswordGroup = document.getElementById('editPasswordGroup');
  const editPassword = document.getElementById('editPassword');
  const btnToggleEditPassword = document.getElementById('btnToggleEditPassword');
  const eyeIconEditPassword = document.getElementById('eyeIconEditPassword');

  let bsRegisterModal = null;
  let bsEditModal = null;
  if (typeof bootstrap !== 'undefined') {
    if (modalRegisterSpecialist) bsRegisterModal = new bootstrap.Modal(modalRegisterSpecialist);
    if (modalEditSpecialist) bsEditModal = new bootstrap.Modal(modalEditSpecialist);
  }

  let currentUser = null;
  let cachedMembers = [];
  let cachedPaymentStatusMap = {}; // userId -> { status, amount } for active month

  // Load pending payment count and update sidebar badge
  async function loadPendingBadge() {
    try {
      const r = await fetch('/api/payments/pending-count');
      if (!r.ok) return;
      const d = await r.json();
      const badge = document.getElementById('pendingPayBadge');
      if (badge && d.success && d.pendingCount > 0) {
        badge.textContent = d.pendingCount;
        badge.classList.remove('d-none');
        badge.title = `${d.pendingCount} payment(s) awaiting verification`;
      } else if (badge) {
        badge.classList.add('d-none');
      }
    } catch (e) { /* silent */ }
  }

  // Helper: Role badge generator
  function getRoleBadge(role) {
    if (role === 'super_admin') {
      return `<span class="badge" style="background: linear-gradient(135deg, rgba(255,85,0,0.3), rgba(216,27,27,0.3)); border: 1px solid #ff5500; color: #ff9d00; font-size: 0.68rem; font-weight: 700; box-shadow: 0 0 10px rgba(255,85,0,0.35);"><i class="bi bi-star-fill text-warning me-1"></i>SUPER ADMIN</span>`;
    }
    if (role === 'admin') {
      return `<span class="badge" style="background: rgba(0,210,255,0.18); border: 1px solid var(--callisto-cyan); color: var(--callisto-cyan); font-size: 0.68rem; font-weight: 700; box-shadow: 0 0 10px rgba(0,210,255,0.25);"><i class="bi bi-shield-lock-fill me-1"></i>ADMIN</span>`;
    }
    return `<span class="badge" style="background: rgba(0,240,118,0.15); border: 1px solid #00f076; color: #00f076; font-size: 0.68rem; font-weight: 700;"><i class="bi bi-person-check-fill me-1"></i>MEMBER</span>`;
  }

  // 1. Verify Authentication
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.replace('/');
      return;
    }
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      renderUserData(currentUser);
    } else {
      window.location.replace('/');
      return;
    }
  } catch (err) {
    console.error('Session check failed:', err);
    window.location.replace('/');
    return;
  }

  function renderUserData(user) {
    if (userNameElem) userNameElem.textContent = user.name;
    if (userAvatarElem && user.avatar) userAvatarElem.src = user.avatar;

    // Sidebar User Profile Sync
    if (sideUserName) sideUserName.textContent = user.name;
    if (sideUserAvatar && user.avatar) sideUserAvatar.src = user.avatar;

    const role = user.role || 'member';
    if (userRoleElem) {
      userRoleElem.textContent = user.title || (role === 'super_admin' ? 'Founder & Lead' : (role === 'admin' ? 'Squad Administrator' : 'Squad Specialist'));
    }

    if (sideUserRoleBadge) {
      sideUserRoleBadge.innerHTML = getRoleBadge(role);
    }

    if (userRoleBadge) {
      if (role === 'super_admin') {
        userRoleBadge.className = 'badge';
        userRoleBadge.style.cssText = 'background: linear-gradient(135deg, rgba(255,85,0,0.35), rgba(216,27,27,0.35)); border: 1px solid #ff5500; color: #ff9d00; box-shadow: 0 0 8px rgba(255,85,0,0.4); font-size: 0.65rem;';
        userRoleBadge.innerHTML = '<i class="bi bi-star-fill text-warning me-1"></i>SUPER ADMIN';
      } else if (role === 'admin') {
        userRoleBadge.className = 'badge';
        userRoleBadge.style.cssText = 'background: rgba(0,210,255,0.2); border: 1px solid var(--callisto-cyan); color: var(--callisto-cyan); box-shadow: 0 0 8px rgba(0,210,255,0.3); font-size: 0.65rem;';
        userRoleBadge.innerHTML = '<i class="bi bi-shield-lock-fill me-1"></i>ADMIN';
      } else {
        userRoleBadge.className = 'badge';
        userRoleBadge.style.cssText = 'background: rgba(0,240,118,0.15); border: 1px solid #00f076; color: #00f076; font-size: 0.65rem;';
        userRoleBadge.innerHTML = '<i class="bi bi-person-check-fill me-1"></i>MEMBER';
      }
    }

    // Configure Admin Console visibility in main content & sidebar
    if (role === 'super_admin' || role === 'admin') {
      if (adminConsoleSection) adminConsoleSection.classList.remove('d-none');
      if (sideAdminGroup) sideAdminGroup.classList.remove('d-none');

      if (adminTierBadge) {
        if (role === 'super_admin') {
          adminTierBadge.textContent = '★ SUPER ADMIN ACCESS (FULL CLEARANCE)';
          adminTierBadge.style.color = '#ff9d00';
          adminTierBadge.style.background = 'rgba(255,85,0,0.2)';
        } else {
          adminTierBadge.textContent = '⚡ ADMIN ACCESS';
          adminTierBadge.style.color = 'var(--callisto-cyan)';
          adminTierBadge.style.background = 'rgba(0,210,255,0.2)';
        }
      }

      // Restrict super_admin creation to only super_admins
      if (role !== 'super_admin') {
        if (optSuperAdmin) optSuperAdmin.disabled = true;
        if (optEditSuperAdmin) optEditSuperAdmin.disabled = true;
      }
    }
  }

  // 2. Handle Logout & Exit Session
  const executeLogout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout API error:', err);
    }

    try {
      sessionStorage.clear();
      document.cookie = 'callisto_token=; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (e) {}

    if (window.triggerOrbitTransition) {
      window.triggerOrbitTransition('/login.html', 'SESSION TERMINATED • EXITING CLEARANCE...', 800);
    } else {
      window.location.replace('/login.html');
    }
  };

  if (logoutBtn) logoutBtn.addEventListener('click', executeLogout);
  if (sideLogoutBtn) sideLogoutBtn.addEventListener('click', executeLogout);

  // Sidebar Register Specialist Button Trigger
  if (sideBtnRegisterSpecialist && btnOpenRegisterModal) {
    sideBtnRegisterSpecialist.addEventListener('click', () => {
      btnOpenRegisterModal.click();
    });
  }

  // Helper: Month formatting
  function formatMonth(str) {
    if (!str) return 'Current Cycle';
    try {
      const [y, m] = str.split('-');
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      const mIdx = parseInt(m, 10) - 1;
      return `${months[mIdx] || m} ${y}`;
    } catch { return str; }
  }

  // Helper: Get current month in YYYY-MM format
  function getCurrentMonth() {
    return new Date().toISOString().slice(0, 7);
  }

  // 3. Load Dashboard & Collections Data (100% Real Live Calculated Metrics)
  async function loadDashboardData() {
    try {
      const [colRes, memRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/members')
      ]);

      const colData = await colRes.json();
      const memData = await memRes.json();

      const stats = colData.success && colData.stats ? colData.stats : {};
      const currency = stats.currency || 'Rs. ';
      const collections = colData.collections || [];

      // Identify active month
      const activeMonthStr = stats.currentMonth || getCurrentMonth();
      const activeMonthName = stats.currentMonthName || formatMonth(activeMonthStr);

      // Fetch member payment statuses for the active month
      try {
        const payStatusRes = await fetch(`/api/payments/member-status?month=${activeMonthStr}`);
        if (payStatusRes.ok) {
          const psd = await payStatusRes.json();
          if (psd.success) cachedPaymentStatusMap = psd.statusMap || {};
        }
      } catch (e) {
        console.warn('Payment status fetch failed:', e);
      }

      // Member roster & counts
      if (memData.success && Array.isArray(memData.members)) {
        cachedMembers = memData.members;
        renderAdminSpecialists(cachedMembers);
      }

      const memberCount = cachedMembers.length || stats.totalMembers || 0;
      const perMember = stats.perMember || 100;
      const monthlyTarget = stats.monthlyTarget || (memberCount * perMember);
      const totalCollected = stats.totalCollected !== undefined ? stats.totalCollected : 0;
      const currentProgress = stats.currentMonthProgress !== undefined
        ? stats.currentMonthProgress
        : (monthlyTarget > 0 ? Math.min(100, Math.round(((stats.currentMonthCollected || 0) / monthlyTarget) * 100)) : 0);

      // 1. Roster Count & Top Meta
      if (statRosterCount) statRosterCount.textContent = `${memberCount} Active`;
      if (squadMetaHeader) squadMetaHeader.innerHTML = `${memberCount} Members &bull; ${currency}${perMember}/mo Fund Pool`;
      const statRosterStatus = document.getElementById('statRosterStatus');
      if (statRosterStatus) {
        statRosterStatus.innerHTML = `<i class="bi bi-shield-check"></i><span>${memberCount} of ${memberCount} verified</span>`;
      }

      // 2. Total Fund Collected Card
      if (statTotalCollected) statTotalCollected.textContent = `${currency}${totalCollected.toLocaleString()}`;

      // 3. Monthly Squad Target Card
      if (statMonthlyTarget) statMonthlyTarget.textContent = `${currency}${monthlyTarget.toLocaleString()}`;
      if (statMonthlyTargetFormula) {
        statMonthlyTargetFormula.innerHTML = `<span>${memberCount} members &times; ${currency}${perMember} / month</span>`;
      }

      // 4. Current Month Progress Card
      if (statProgressPercentage) statProgressPercentage.textContent = `${currentProgress}%`;
      if (statProgressBar) statProgressBar.style.width = `${currentProgress}%`;

      // 5. Active Month Section Header
      const activeMonthNameElem = document.getElementById('activeMonthName');
      if (activeMonthNameElem) activeMonthNameElem.textContent = activeMonthName;

      // 6. Sidebar Widget Live Sync
      if (window.updateOrbitSidebarTarget) {
        window.updateOrbitSidebarTarget({
          percentage: currentProgress,
          membersCount: memberCount,
          unitText: `${currency}${perMember}/mo`
        });
      }

      // 7. Active Month Contribution Grid
      let activeMonthEntry = collections.find(c => c.month === activeMonthStr) || collections[collections.length - 1];
      const activeContributions = (activeMonthEntry && Array.isArray(activeMonthEntry.contributions))
        ? activeMonthEntry.contributions
        : [];

      renderActiveMembers(activeContributions, cachedMembers, currency);

      // 8. Collection History
      renderHistory(collections, currency);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }

  // Render Member Contribution Cards (enhanced with payment status)
  function renderActiveMembers(contributions = [], members = [], currency = 'Rs. ') {
    if (!membersGrid) return;

    const contribMap = {};
    contributions.forEach(c => { contribMap[c.userId] = c; });

    membersGrid.innerHTML = members.map(m => {
      // Check payment vault status first (payments.json), fallback to collections.json
      const payStatus = cachedPaymentStatusMap[m.id];
      // Only use contrib if it has a real paid record — never default to fake pending state
      const contrib = contribMap[m.id] || null;
      const hasRealContrib = contrib && contrib.status === 'paid';

      let statusClass, statusIcon, statusLabel, statusColor, borderColor;
      const isSelf = currentUser && currentUser.id === m.id;

      if (payStatus) {
        if (payStatus.status === 'verified') {
          statusClass = 'member-badge-paid';
          statusIcon = 'bi-check-circle-fill';
          statusLabel = `VERIFIED ${currency}${payStatus.amount || 100}`;
          statusColor = '#10b981';
          borderColor = 'rgba(16,185,129,0.3)';
        } else if (payStatus.status === 'pending_verification') {
          statusClass = '';
          statusIcon = 'bi-hourglass-split';
          statusLabel = `AWAITING VERIFY ${currency}${payStatus.amount || 100}`;
          statusColor = '#f59e0b';
          borderColor = 'rgba(245,158,11,0.3)';
        } else if (payStatus.status === 'rejected') {
          statusClass = '';
          statusIcon = 'bi-x-circle-fill';
          statusLabel = `REJECTED — Resubmit`;
          statusColor = '#ef4444';
          borderColor = 'rgba(239,68,68,0.3)';
        }
      } else if (hasRealContrib) {
        statusClass = 'member-badge-paid';
        statusIcon = 'bi-check-circle-fill';
        statusLabel = `PAID ${currency}${contrib.amount || 100}`;
        statusColor = '#10b981';
        borderColor = 'rgba(16,185,129,0.3)';
      } else {
        // No payment submitted at all — neutral grey, NOT a yellow PENDING
        statusClass = '';
        statusIcon = 'bi-dash-circle';
        statusLabel = `NOT PAID`;
        statusColor = '#64748b';
        borderColor = 'rgba(100,116,139,0.15)';
      }

      // Build payment sub-line info
      let paySubInfo = '';
      if (payStatus) {
        if (payStatus.status === 'verified') {
          paySubInfo = `<span style="color:#34d399;"><i class="bi bi-patch-check-fill me-1"></i>Credited to Treasury</span>`;
        } else if (payStatus.status === 'pending_verification') {
          paySubInfo = `<span style="color:#fbbf24;"><i class="bi bi-clock me-1"></i>Awaiting Admin Verification</span>`;
        } else if (payStatus.status === 'rejected') {
          paySubInfo = `<span style="color:#f87171;"><i class="bi bi-exclamation-triangle-fill me-1"></i>Payment was rejected</span>`;
        }
      } else if (hasRealContrib && contrib.method) {
        paySubInfo = `<span style="color:#94a3b8;">${contrib.method}${contrib.txRef ? ' • ' + contrib.txRef : ''}</span>`;
      } else {
        paySubInfo = `<span style="color:#64748b;">No payment this month</span>`;
      }

      // Show "Submit Payment" link for self only if no payment at all OR rejected
      const showSubmitLink = isSelf && (!payStatus || payStatus.status === 'rejected') && !hasRealContrib;
      const submitLink = showSubmitLink
        ? `<a href="/payments.html" style="color:#10b981;font-size:0.7rem;font-weight:600;text-decoration:none;"><i class="bi bi-plus-circle me-1"></i>Submit Payment</a>`
        : '';

      return `
        <div class="col-12 col-md-6">
          <div class="member-card d-flex align-items-center justify-content-between p-3" style="background: rgba(14,20,36,0.7); border: 1px solid ${borderColor}; border-radius: 14px; border-left: 3px solid ${statusColor}; transition: border-color 0.2s;">
            <div class="d-flex align-items-center gap-3" style="min-width:0;">
              <div style="position:relative;flex-shrink:0;">
                <img src="${m.avatar}" alt="${m.name}" style="width:44px;height:44px;border-radius:12px;background:#131c31;border:1px solid rgba(255,255,255,0.1);">
                ${isSelf ? `<span style="position:absolute;bottom:-3px;right:-3px;width:12px;height:12px;background:#ff5500;border-radius:50%;border:2px solid #060b18;" title="You"></span>` : ''}
              </div>
              <div style="min-width:0;">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span style="font-weight:600;color:#fff;font-size:0.92rem;">${m.name}</span>
                  ${getRoleBadge(m.role)}
                  ${isSelf ? `<span class="badge" style="background:rgba(255,85,0,0.15);border:1px solid rgba(255,85,0,0.4);color:#ff9d00;font-size:0.6rem;">YOU</span>` : ''}
                </div>
                <div style="font-size:0.75rem;color:#94a3b8;">${m.title || 'Squad Specialist'}</div>
                <div style="font-size:0.7rem;margin-top:3px;">${paySubInfo}</div>
                ${submitLink ? `<div style="margin-top:4px;">${submitLink}</div>` : ''}
              </div>
            </div>

            <div class="text-end flex-shrink-0">
              <div>
                <span style="background:rgba(${statusColor === '#10b981' ? '16,185,129' : statusColor === '#f59e0b' ? '245,158,11' : statusColor === '#ef4444' ? '239,68,68' : '100,116,139'},0.15);border:1px solid ${statusColor};color:${statusColor};font-size:0.68rem;font-weight:700;padding:0.25rem 0.55rem;border-radius:7px;white-space:nowrap;">
                  <i class="bi ${statusIcon} me-1"></i>${statusLabel}
                </span>
              </div>
              <div style="font-size:0.68rem;color:#475569;margin-top:4px;">
                NIC: <span style="font-family:monospace;color:#94a3b8;">${m.nic}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Admin Console Specialists Table
  function renderAdminSpecialists(members = []) {
    if (!adminSpecialistsTbody) return;

    adminSpecialistsTbody.innerHTML = members.map(m => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${m.avatar}" alt="${m.name}" style="width: 32px; height: 32px; border-radius: 8px; background: #131c31; border: 1px solid rgba(255,255,255,0.1);">
            <div>
              <div style="font-weight: 600; color: #fff; font-size: 0.88rem;">${m.name}</div>
              <div style="font-size: 0.7rem; color: var(--text-dim);">@${m.username}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge px-2 py-1" style="background: rgba(255, 85, 0, 0.15); border: 1px solid rgba(255, 85, 0, 0.3); color: #ff9d00; font-family: monospace; font-size: 0.78rem; letter-spacing: 0.5px;">
            ${m.nic}
          </span>
        </td>
        <td>
          ${getRoleBadge(m.role)}
        </td>
        <td style="font-size: 0.82rem; color: #cbd5e1;">
          ${m.title || 'Squad Specialist'}
        </td>
        <td style="font-size: 0.78rem; color: var(--text-dim);">
          ${m.email || '—'}
        </td>
        <td class="text-end">
          <button type="button" class="btn btn-sm btn-outline-info btn-edit-specialist" data-member-id="${m.id}" style="border-radius: 8px; font-size: 0.72rem; padding: 0.25rem 0.65rem;">
            <i class="bi bi-pencil-square me-1"></i> Edit NIC/Role
          </button>
        </td>
      </tr>
    `).join('');

    // Attach click events to Edit buttons
    document.querySelectorAll('.btn-edit-specialist').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-member-id');
        const target = cachedMembers.find(m => m.id === id);
        if (target && bsEditModal) {
          editMemberId.value = target.id;
          editName.value = target.name;
          editNic.value = target.nic;
          editRole.value = target.role || 'member';
          editTitle.value = target.title || '';
          if (editPassword) {
            editPassword.value = '';
            editPassword.type = 'password';
          }
          if (eyeIconEditPassword) eyeIconEditPassword.className = 'bi bi-eye';
          updateEditPasswordVisibility();
          if (modalEditAlert) modalEditAlert.innerHTML = '';
          bsEditModal.show();
        }
      });
    });
  }

  // Dynamic Password Visibility Helpers
  function updateRegPasswordVisibility() {
    if (!regPasswordGroup || !regRole) return;
    const isPrivileged = regRole.value === 'admin' || regRole.value === 'super_admin';
    if (isPrivileged) {
      regPasswordGroup.classList.remove('d-none');
    } else {
      regPasswordGroup.classList.add('d-none');
      if (regPassword) regPassword.value = '';
    }
  }

  function updateEditPasswordVisibility() {
    if (!editPasswordGroup || !editRole) return;
    const isPrivileged = editRole.value === 'admin' || editRole.value === 'super_admin';
    if (isPrivileged) {
      editPasswordGroup.classList.remove('d-none');
    } else {
      editPasswordGroup.classList.add('d-none');
      if (editPassword) editPassword.value = '';
    }
  }

  if (regRole) {
    regRole.addEventListener('change', updateRegPasswordVisibility);
  }

  if (editRole) {
    editRole.addEventListener('change', updateEditPasswordVisibility);
  }

  // Password Visibility Toggle Eye Buttons
  if (btnToggleRegPassword && regPassword && eyeIconRegPassword) {
    btnToggleRegPassword.addEventListener('click', () => {
      const isPass = regPassword.type === 'password';
      regPassword.type = isPass ? 'text' : 'password';
      eyeIconRegPassword.className = isPass ? 'bi bi-eye-slash text-warning' : 'bi bi-eye';
    });
  }

  if (btnToggleEditPassword && editPassword && eyeIconEditPassword) {
    btnToggleEditPassword.addEventListener('click', () => {
      const isPass = editPassword.type === 'password';
      editPassword.type = isPass ? 'text' : 'password';
      eyeIconEditPassword.className = isPass ? 'bi bi-eye-slash text-warning' : 'bi bi-eye';
    });
  }

  // Render Collection History (enhanced with progress bars)
  function renderHistory(collections, currency) {
    if (!historyList) return;
    const sorted = collections.slice().reverse();
    historyList.innerHTML = sorted.map((c, idx) => {
      const pct = c.target > 0 ? Math.min(100, Math.round((c.collected / c.target) * 100)) : 0;
      const isComplete = c.collected >= c.target && c.target > 0;
      const isActive = idx === 0;
      const barColor = isComplete ? '#10b981' : (pct >= 50 ? '#ff9d00' : '#00d2ff');
      return `
        <div style="background:rgba(14,20,36,0.6);border:1px solid rgba(255,255,255,${isActive ? '0.12' : '0.06'});border-radius:12px;padding:0.75rem 1rem;${isActive ? 'border-left:3px solid var(--callisto-cyan, #00d2ff);' : ''}">
          <div class="d-flex justify-content-between align-items-center mb-1 flex-wrap gap-1">
            <div class="d-flex align-items-center gap-2">
              <strong style="color:#fff;font-size:0.85rem;">${formatMonth(c.month)}</strong>
              ${isActive ? `<span class="badge" style="background:rgba(0,210,255,0.15);color:#00d2ff;border:1px solid rgba(0,210,255,0.3);font-size:0.6rem;">ACTIVE CYCLE</span>` : ''}
              ${isComplete ? `<span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid #10b981;font-size:0.6rem;"><i class="bi bi-check2-all me-1"></i>COMPLETE</span>` : ''}
            </div>
            <div>
              <span style="font-weight:700;color:${barColor};font-size:0.9rem;">${currency}${c.collected.toLocaleString()}</span>
              <span style="color:#64748b;font-size:0.78rem;"> / ${currency}${c.target.toLocaleString()}</span>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.06);border-radius:4px;height:5px;overflow:hidden;margin-top:4px;">
            <div style="width:${pct}%;height:100%;background:${barColor};border-radius:4px;transition:width 0.5s ease;box-shadow:0 0 6px ${barColor};"></div>
          </div>
          <div class="d-flex justify-content-between align-items-center mt-1" style="font-size:0.68rem;color:#64748b;">
            <span>${c.status === 'completed' ? 'Target Achieved' : 'Cycle in Progress'}</span>
            <span>${pct}% collected</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Modal Triggers & Form Submissions
  if (btnOpenRegisterModal) {
    btnOpenRegisterModal.addEventListener('click', () => {
      if (modalRegAlert) modalRegAlert.innerHTML = '';
      if (formRegisterSpecialist) formRegisterSpecialist.reset();
      if (regPassword) {
        regPassword.value = '';
        regPassword.type = 'password';
      }
      if (eyeIconRegPassword) eyeIconRegPassword.className = 'bi bi-eye';
      updateRegPasswordVisibility();
      if (bsRegisterModal) bsRegisterModal.show();
    });
  }

  // Submit New Specialist Registration
  if (formRegisterSpecialist) {
    formRegisterSpecialist.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (modalRegAlert) modalRegAlert.innerHTML = '';

      const nameVal = regName.value.trim();
      const nicVal = regNic.value.trim();
      const roleVal = regRole.value;
      const unameVal = regUsername.value.trim();
      const titleVal = regTitle.value.trim();
      const emailVal = regEmail.value.trim();
      const passVal = regPassword ? regPassword.value.trim() : '';

      if (!nameVal || !nicVal) {
        modalRegAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Name and NIC Number are required.</div>`;
        return;
      }

      // If Admin or Super Admin, require password
      if ((roleVal === 'admin' || roleVal === 'super_admin') && (!passVal || passVal.length < 6)) {
        modalRegAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">A secure password (minimum 6 characters) is required for Admin clearance.</div>`;
        if (regPassword) regPassword.focus();
        return;
      }

      btnSubmitRegister.disabled = true;
      btnSubmitRegister.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Registering to Vault...`;

      try {
        const res = await fetch('/api/admin/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameVal,
            nic: nicVal,
            role: roleVal,
            username: unameVal,
            title: titleVal,
            email: emailVal,
            password: passVal
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (bsRegisterModal) bsRegisterModal.hide();
          if (adminConsoleAlert) {
            const loginInfo = (roleVal === 'admin' || roleVal === 'super_admin')
              ? `The Admin can log in using Admin mode with their NIC/Username and the created password.`
              : `The operator can now log in instantly using single-field NIC clearance (<strong>${nicVal}</strong>)!`;
            adminConsoleAlert.innerHTML = `
              <div class="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style="background: rgba(0,230,118,0.15); border: 1px solid #00e676; color: #00e676; font-size: 0.82rem; border-radius: 10px;">
                <i class="bi bi-check-circle-fill"></i>
                <div>${data.message}. ${loginInfo}</div>
              </div>
            `;
          }
          await loadDashboardData();
        } else {
          modalRegAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">${data.message || 'Registration failed'}</div>`;
        }
      } catch (err) {
        console.error('Registration failed:', err);
        modalRegAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Network error. Please try again.</div>`;
      } finally {
        btnSubmitRegister.disabled = false;
        btnSubmitRegister.innerHTML = `<i class="bi bi-shield-check me-1"></i> Register to Zero-DB Vault`;
      }
    });
  }

  // Submit Edit Specialist NIC/Role
  if (formEditSpecialist) {
    formEditSpecialist.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (modalEditAlert) modalEditAlert.innerHTML = '';

      const memId = editMemberId.value;
      const nameVal = editName.value.trim();
      const nicVal = editNic.value.trim();
      const roleVal = editRole.value;
      const titleVal = editTitle.value.trim();
      const passVal = editPassword ? editPassword.value.trim() : '';

      if (!nameVal || !nicVal) {
        modalEditAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Name and NIC Number are required.</div>`;
        return;
      }

      if (passVal && passVal.length < 6) {
        modalEditAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Password must be at least 6 characters.</div>`;
        if (editPassword) editPassword.focus();
        return;
      }

      btnSubmitEdit.disabled = true;
      btnSubmitEdit.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Saving...`;

      try {
        const payload = {
          name: nameVal,
          nic: nicVal,
          role: roleVal,
          title: titleVal
        };
        if (passVal) {
          payload.password = passVal;
        }

        const res = await fetch(`/api/admin/members/${memId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (bsEditModal) bsEditModal.hide();
          if (adminConsoleAlert) {
            adminConsoleAlert.innerHTML = `
              <div class="alert alert-info d-flex align-items-center gap-2 py-2 mb-3" style="background: rgba(0,210,255,0.15); border: 1px solid var(--callisto-cyan); color: var(--callisto-cyan); font-size: 0.82rem; border-radius: 10px;">
                <i class="bi bi-check-circle-fill"></i>
                <div>${data.message}. Updated NIC: <strong>${nicVal}</strong> [${roleVal.toUpperCase()}].</div>
              </div>
            `;
          }
          await loadDashboardData();
        } else {
          modalEditAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">${data.message || 'Update failed'}</div>`;
        }
      } catch (err) {
        console.error('Update failed:', err);
        modalEditAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Network error. Please try again.</div>`;
      } finally {
        btnSubmitEdit.disabled = false;
        btnSubmitEdit.innerHTML = `<i class="bi bi-check2-circle me-1"></i> Save Clearance Changes`;
      }
    });
  }

  // 5. Sidebar Navigation Links Smooth Scroll & Active Highlight
  const sideNavLinks = document.querySelectorAll('.sidebar-nav-link[href^="#"]');
  sideNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        sideNavLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile offcanvas if open
        const offcanvasEl = document.getElementById('sidebarOffcanvas');
        if (offcanvasEl && typeof bootstrap !== 'undefined') {
          const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
          if (bsOffcanvas) bsOffcanvas.hide();
        }
      }
    });
  });

  // Initial load
  loadPendingBadge();
  loadDashboardData();
});
