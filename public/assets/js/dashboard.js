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

  let bsRegisterModal = null;
  let bsEditModal = null;
  if (typeof bootstrap !== 'undefined') {
    if (modalRegisterSpecialist) bsRegisterModal = new bootstrap.Modal(modalRegisterSpecialist);
    if (modalEditSpecialist) bsEditModal = new bootstrap.Modal(modalEditSpecialist);
  }

  let currentUser = null;
  let cachedMembers = [];

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

  // 2. Handle Logout
  const executeLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      sessionStorage.removeItem('callisto_active_user');
    } catch (e) {}

    if (window.triggerOrbitTransition) {
      window.triggerOrbitTransition('/', 'SESSION TERMINATED • RETURNING TO PHOENIX...', 1000);
    } else {
      window.location.href = '/';
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
  }

  // 3. Load Dashboard & Collections Data
  async function loadDashboardData() {
    try {
      const [colRes, memRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/members')
      ]);

      const colData = await colRes.json();
      const memData = await memRes.json();

      if (memData.success && memData.members) {
        cachedMembers = memData.members;
        renderAdminSpecialists(cachedMembers);
        if (statRosterCount) statRosterCount.textContent = `${cachedMembers.length} Active`;
        if (squadMetaHeader) squadMetaHeader.innerHTML = `${cachedMembers.length} Members &bull; $100/mo Fund Pool`;
      }

      if (colData.success) {
        const stats = colData.stats;
        const currency = stats.currency || '$';
        if (statTotalCollected) statTotalCollected.textContent = `${currency}${stats.totalCollected.toLocaleString()}`;
        if (statMonthlyTarget) statMonthlyTarget.textContent = `${currency}${stats.monthlyTarget.toLocaleString()}`;
        if (statMonthlyTargetFormula) {
          statMonthlyTargetFormula.innerHTML = `<span>${cachedMembers.length} members &times; ${currency}100 / month</span>`;
        }

        const collections = colData.collections || [];
        const activeMonth = collections[collections.length - 1];

        if (activeMonth) {
          const collected = activeMonth.collected || 0;
          const target = activeMonth.target || (cachedMembers.length * 100);
          const pct = Math.min(100, Math.round((collected / target) * 100));
          if (statProgressPercentage) statProgressPercentage.textContent = `${pct}%`;
          if (statProgressBar) statProgressBar.style.width = `${pct}%`;

          renderActiveMembers(activeMonth.contributions, cachedMembers);
        }

        renderHistory(collections, currency);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }

  // Render Member Contribution Cards
  function renderActiveMembers(contributions = [], members = []) {
    if (!membersGrid) return;

    const contribMap = {};
    contributions.forEach(c => { contribMap[c.userId] = c; });

    membersGrid.innerHTML = members.map(m => {
      const contrib = contribMap[m.id] || { status: 'pending', amount: 0 };
      const isPaid = contrib.status === 'paid';

      return `
        <div class="col-12 col-md-6">
          <div class="member-card d-flex align-items-center justify-content-between p-3" style="background: rgba(14, 20, 36, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px;">
            <div class="d-flex align-items-center gap-3">
              <img src="${m.avatar}" alt="${m.name}" style="width: 44px; height: 44px; border-radius: 12px; background: #131c31; border: 1px solid rgba(255,255,255,0.1);">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span style="font-weight: 600; color: #fff; font-size: 0.92rem;">${m.name}</span>
                  ${getRoleBadge(m.role)}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${m.title || 'Squad Specialist'}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">
                  <span class="badge" style="background: rgba(255,255,255,0.06); color: #cbd5e1; font-family: monospace; font-size: 0.68rem;">NIC: ${m.nic}</span>
                  ${isPaid ? `<span class="ms-1 text-success"><i class="bi bi-calendar-check me-1"></i>Paid</span>` : '<span class="ms-1 text-warning"><i class="bi bi-clock-history me-1"></i>Awaiting</span>'}
                </div>
              </div>
            </div>

            <div class="text-end">
              <div>
                <span class="${isPaid ? 'member-badge-paid' : 'member-badge-pending'}">
                  ${isPaid ? '<i class="bi bi-check-circle-fill me-1"></i> PAID $100' : '<i class="bi bi-hourglass-split me-1"></i> PENDING $100'}
                </span>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 4px;">
                ${isPaid && contrib.method ? `${contrib.method} • ${contrib.txRef || 'Verified'}` : 'Target: $100/mo'}
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
          if (modalEditAlert) modalEditAlert.innerHTML = '';
          bsEditModal.show();
        }
      });
    });
  }

  // Render Collection History
  function renderHistory(collections, currency) {
    if (!historyList) return;
    historyList.innerHTML = collections.slice().reverse().map(c => `
      <div class="p-2 px-3 glass-panel d-flex justify-content-between align-items-center" style="border-radius: 10px; font-size: 0.82rem;">
        <div>
          <strong class="text-white">${c.month}</strong>
          <span class="text-dim ms-2">${c.status === 'completed' ? 'Fully Completed' : 'In Progress'}</span>
        </div>
        <div>
          <span style="font-weight: 700; color: ${c.collected >= c.target ? '#00e676' : '#ff9d00'};">
            ${currency}${c.collected}
          </span>
          <span class="text-dim">/ ${currency}${c.target}</span>
        </div>
      </div>
    `).join('');
  }

  // 4. Modal Triggers & Form Submissions
  if (btnOpenRegisterModal) {
    btnOpenRegisterModal.addEventListener('click', () => {
      if (modalRegAlert) modalRegAlert.innerHTML = '';
      if (formRegisterSpecialist) formRegisterSpecialist.reset();
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

      if (!nameVal || !nicVal) {
        modalRegAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Name and NIC Number are required.</div>`;
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
            email: emailVal
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          if (bsRegisterModal) bsRegisterModal.hide();
          if (adminConsoleAlert) {
            adminConsoleAlert.innerHTML = `
              <div class="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style="background: rgba(0,230,118,0.15); border: 1px solid #00e676; color: #00e676; font-size: 0.82rem; border-radius: 10px;">
                <i class="bi bi-check-circle-fill"></i>
                <div>${data.message}. The operator can now log in instantly using their NIC <strong>${nicVal}</strong>!</div>
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

      if (!nameVal || !nicVal) {
        modalEditAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Name and NIC Number are required.</div>`;
        return;
      }

      btnSubmitEdit.disabled = true;
      btnSubmitEdit.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Saving...`;

      try {
        const res = await fetch(`/api/admin/members/${memId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameVal,
            nic: nicVal,
            role: roleVal,
            title: titleVal
          })
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

  // Initial load
  loadDashboardData();
});
