/**
 * Callisto-Orbit Specialists Directory & Registry Logic
 * Manages full specialists roster, role-based clearances, real-time search/filtering,
 * and Privileged Admin registration/editing with cryptographic password verification.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Top Navbar elements
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
  const sideBtnRegisterSpecialist = document.getElementById('sideBtnRegisterSpecialist');
  const sideLogoutBtn = document.getElementById('sideLogoutBtn');

  // Main Directory Toolbar & Table
  const searchInput = document.getElementById('searchSpecialistInput');
  const filterBtns = document.querySelectorAll('.filter-pill-btn');
  const countFilterAll = document.getElementById('countFilterAll');
  const countFilterSuperAdmin = document.getElementById('countFilterSuperAdmin');
  const countFilterAdmin = document.getElementById('countFilterAdmin');
  const countFilterMember = document.getElementById('countFilterMember');
  const btnOpenRegisterModal = document.getElementById('btnOpenRegisterModal');
  const memberNotice = document.getElementById('memberNotice');
  const totalRosterBadge = document.getElementById('totalRosterBadge');
  const specialistsTableBody = document.getElementById('specialistsTableBody');
  const noSpecialistsState = document.getElementById('noSpecialistsState');
  const specialistsAlert = document.getElementById('specialistsAlert');

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

  // Delete Modal elements
  const modalDeleteSpecialist = document.getElementById('modalDeleteSpecialist');
  const modalDeleteAlert = document.getElementById('modalDeleteAlert');
  const delSpecialistAvatar = document.getElementById('delSpecialistAvatar');
  const delSpecialistName = document.getElementById('delSpecialistName');
  const delSpecialistUsername = document.getElementById('delSpecialistUsername');
  const delSpecialistNic = document.getElementById('delSpecialistNic');
  const delSpecialistRoleBadge = document.getElementById('delSpecialistRoleBadge');
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');
  let targetDeleteMemberId = null;

  let bsRegisterModal = null;
  let bsEditModal = null;
  let bsDeleteModal = null;
  if (typeof bootstrap !== 'undefined') {
    if (modalRegisterSpecialist) bsRegisterModal = new bootstrap.Modal(modalRegisterSpecialist);
    if (modalEditSpecialist) bsEditModal = new bootstrap.Modal(modalEditSpecialist);
    if (modalDeleteSpecialist) bsDeleteModal = new bootstrap.Modal(modalDeleteSpecialist);
  }

  let currentUser = null;
  let cachedMembers = [];
  let currentFilter = 'all';
  let searchQuery = '';

  // Role Badge Helper
  function getRoleBadge(role) {
    if (role === 'super_admin') {
      return `<span class="badge" style="background: linear-gradient(135deg, rgba(255,85,0,0.35), rgba(216,27,27,0.35)); border: 1px solid #ff5500; color: #ff9d00; font-size: 0.68rem; font-weight: 700; box-shadow: 0 0 10px rgba(255,85,0,0.35);"><i class="bi bi-star-fill text-warning me-1"></i>SUPER ADMIN</span>`;
    }
    if (role === 'admin') {
      return `<span class="badge" style="background: rgba(0,210,255,0.18); border: 1px solid var(--callisto-cyan); color: var(--callisto-cyan); font-size: 0.68rem; font-weight: 700; box-shadow: 0 0 10px rgba(0,210,255,0.25);"><i class="bi bi-shield-lock-fill me-1"></i>ADMIN</span>`;
    }
    return `<span class="badge" style="background: rgba(0,240,118,0.15); border: 1px solid #00f076; color: #00f076; font-size: 0.68rem; font-weight: 700;"><i class="bi bi-person-check-fill me-1"></i>MEMBER</span>`;
  }

  // 1. Verify User Authentication
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.replace('/');
      return;
    }
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      renderCurrentUser(currentUser);
    } else {
      window.location.replace('/');
      return;
    }
  } catch (err) {
    console.error('Session check failed:', err);
    window.location.replace('/');
    return;
  }

  function renderCurrentUser(user) {
    if (userNameElem) userNameElem.textContent = user.name;
    if (userAvatarElem && user.avatar) userAvatarElem.src = user.avatar;
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
      userRoleBadge.innerHTML = getRoleBadge(role);
    }

    const isPrivileged = role === 'admin' || role === 'super_admin';
    if (isPrivileged) {
      if (btnOpenRegisterModal) btnOpenRegisterModal.classList.remove('d-none');
      if (sideAdminGroup) sideAdminGroup.classList.remove('d-none');
      if (memberNotice) memberNotice.classList.add('d-none');

      if (role !== 'super_admin') {
        if (optSuperAdmin) optSuperAdmin.disabled = true;
        if (optEditSuperAdmin) optEditSuperAdmin.disabled = true;
      } else {
        if (optSuperAdmin) optSuperAdmin.disabled = false;
        if (optEditSuperAdmin) optEditSuperAdmin.disabled = false;
      }
    } else {
      if (btnOpenRegisterModal) btnOpenRegisterModal.classList.add('d-none');
      if (sideAdminGroup) sideAdminGroup.classList.add('d-none');
      if (memberNotice) memberNotice.classList.remove('d-none');
    }
  }

  // 2. Load Specialists from API
  async function loadSpecialists() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        cachedMembers = data.members;
        updateCounts(cachedMembers);
        renderTable();
      }
    } catch (err) {
      console.error('Failed to load specialists roster:', err);
    }
  }

  function updateCounts(members) {
    const total = members.length;
    const superAdmins = members.filter(m => m.role === 'super_admin').length;
    const admins = members.filter(m => m.role === 'admin').length;
    const regularMembers = members.filter(m => m.role === 'member').length;

    if (countFilterAll) countFilterAll.textContent = total;
    if (countFilterSuperAdmin) countFilterSuperAdmin.textContent = superAdmins;
    if (countFilterAdmin) countFilterAdmin.textContent = admins;
    if (countFilterMember) countFilterMember.textContent = regularMembers;

    if (totalRosterBadge) {
      totalRosterBadge.textContent = `${total} Specialists Registered`;
    }
  }

  function renderTable() {
    if (!specialistsTableBody) return;

    let filtered = cachedMembers.slice();

    // Apply role filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(m => m.role === currentFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        return (
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.username && m.username.toLowerCase().includes(q)) ||
          (m.nic && m.nic.toLowerCase().includes(q)) ||
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.role && m.role.toLowerCase().includes(q))
        );
      });
    }

    if (filtered.length === 0) {
      specialistsTableBody.innerHTML = '';
      if (noSpecialistsState) noSpecialistsState.classList.remove('d-none');
      return;
    }

    if (noSpecialistsState) noSpecialistsState.classList.add('d-none');

    const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
    const isSuperAdminUser = currentUser && currentUser.role === 'super_admin';

    specialistsTableBody.innerHTML = filtered.map(m => {
      const avatarUrl = m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name)}`;
      const isSuperAdminTarget = m.role === 'super_admin';
      const canEditThisUser = canEdit && (isSuperAdminUser || !isSuperAdminTarget);

      const isSelf = currentUser && currentUser.id === m.id;
      // Strict rule: Only Super Admin can delete specialists, and cannot delete themselves
      const canDeleteThisUser = isSuperAdminUser && !isSelf;
      let actionBtn = '';

      if (canEditThisUser) {
        actionBtn = `
          <div class="d-flex align-items-center justify-content-end gap-1">
            <button type="button" class="btn btn-sm glass-subcard text-info btn-edit-specialist" data-member-id="${m.id}" style="border: 1px solid rgba(0,210,255,0.4); border-radius: 8px; padding: 0.35rem 0.65rem; font-size: 0.75rem; font-weight: 600;" title="Edit Specialist Clearance">
              <i class="bi bi-pencil-square me-1"></i> Edit
            </button>
            ${canDeleteThisUser ? `
              <button type="button" class="btn btn-sm glass-subcard text-danger btn-delete-specialist" data-member-id="${m.id}" style="border: 1px solid rgba(230,32,32,0.4); border-radius: 8px; padding: 0.35rem 0.65rem; font-size: 0.75rem; font-weight: 600;" title="Revoke & Delete Specialist">
                <i class="bi bi-trash3-fill me-1"></i> Delete
              </button>
            ` : (isSelf ? `<span class="badge" style="background: rgba(255,255,255,0.06); color: #94a3b8; font-size: 0.68rem; padding: 0.35rem 0.5rem; border: 1px solid rgba(255,255,255,0.1);">You</span>` : '')}
          </div>
        `;
      } else if (isSuperAdminTarget) {
        actionBtn = `<span class="badge" style="background: linear-gradient(135deg, rgba(255,85,0,0.2), rgba(216,27,27,0.2)); border: 1px solid rgba(255,85,0,0.5); color: #ff9d00; font-size: 0.72rem; padding: 0.35rem 0.65rem; font-weight: 700;"><i class="bi bi-shield-lock-fill me-1"></i>Protected</span>`;
      } else {
        actionBtn = `<span class="badge" style="background: rgba(255,255,255,0.06); color: #94a3b8; font-size: 0.7rem; border: 1px solid rgba(255,255,255,0.1);">Verified</span>`;
      }

      return `
        <tr class="specialist-table-row" style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <td class="py-3">
            <div class="d-flex align-items-center gap-2">
              <img src="${avatarUrl}" alt="${m.name}" style="width: 36px; height: 36px; border-radius: 10px; background: #131c31; border: 1.5px solid rgba(255,85,0,0.35);">
              <div>
                <strong class="text-white d-block" style="font-size: 0.88rem; line-height: 1.2;">${m.name}</strong>
                <span style="font-size: 0.72rem; color: #94a3b8;">@${m.username || 'user'}</span>
              </div>
            </div>
          </td>
          <td>
            <div class="d-flex align-items-center gap-1 font-monospace" style="color: #cbd5e1; font-size: 0.84rem; font-weight: 600;">
              <i class="bi bi-person-vcard text-warning me-1"></i>
              <span>${m.nic}</span>
            </div>
          </td>
          <td>
            ${getRoleBadge(m.role)}
          </td>
          <td>
            <div style="font-size: 0.82rem; color: #cbd5e1; font-weight: 500;">
              ${m.title || 'Squad Specialist'}
            </div>
          </td>
          <td>
            <div style="font-size: 0.8rem; color: #94a3b8;">
              ${m.email || '—'}
            </div>
          </td>
          <td>
            <div style="font-size: 0.78rem; color: #94a3b8;">
              ${m.joinedDate || '2026-01-01'}
            </div>
          </td>
          <td class="text-end">
            ${actionBtn}
          </td>
        </tr>
      `;
    }).join('');

    // Attach click events to edit buttons
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

          // Self-role protection & Super Admin assignment check
          const isSelf = currentUser && currentUser.id === target.id;
          const editRoleHelp = document.getElementById('editRoleHelp');
          if (isSelf) {
            editRole.disabled = true;
            if (editRoleHelp) {
              editRoleHelp.textContent = 'You cannot modify your own clearance role';
              editRoleHelp.classList.remove('d-none');
            }
          } else {
            editRole.disabled = false;
            if (editRoleHelp) {
              editRoleHelp.textContent = '';
              editRoleHelp.classList.add('d-none');
            }
            if (optEditSuperAdmin) {
              optEditSuperAdmin.disabled = (currentUser && currentUser.role !== 'super_admin');
            }
          }

          bsEditModal.show();
        }
      });
    });

    // Attach click events to delete buttons
    document.querySelectorAll('.btn-delete-specialist').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-member-id');
        const target = cachedMembers.find(m => m.id === id);
        if (target && bsDeleteModal) {
          targetDeleteMemberId = target.id;
          if (delSpecialistAvatar) delSpecialistAvatar.src = target.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(target.name)}`;
          if (delSpecialistName) delSpecialistName.textContent = target.name;
          if (delSpecialistUsername) delSpecialistUsername.textContent = `@${target.username || 'user'}`;
          if (delSpecialistNic) delSpecialistNic.textContent = target.nic;
          if (delSpecialistRoleBadge) delSpecialistRoleBadge.innerHTML = getRoleBadge(target.role);
          if (modalDeleteAlert) modalDeleteAlert.innerHTML = '';
          bsDeleteModal.show();
        }
      });
    });
  }

  // 3. Search & Filter Handlers
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderTable();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderTable();
    });
  });

  // 4. Dynamic Password Visibility in Modals
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

  if (regRole) regRole.addEventListener('change', updateRegPasswordVisibility);
  if (editRole) editRole.addEventListener('change', updateEditPasswordVisibility);

  // Toggle Password Eye Icons
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

  // 5. Open Register Modal
  if (btnOpenRegisterModal) {
    btnOpenRegisterModal.addEventListener('click', () => {
      if (optSuperAdmin) {
        optSuperAdmin.disabled = (currentUser && currentUser.role !== 'super_admin');
      }
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

  if (sideBtnRegisterSpecialist && btnOpenRegisterModal) {
    sideBtnRegisterSpecialist.addEventListener('click', () => {
      btnOpenRegisterModal.click();
    });
  }

  // 6. Submit New Specialist Registration
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
          if (specialistsAlert) {
            const loginInfo = (roleVal === 'admin' || roleVal === 'super_admin')
              ? `The Admin can log in using Admin Mode with their NIC/Username and password.`
              : `The operator can now log in instantly using single-field NIC clearance (<strong>${nicVal}</strong>)!`;
            specialistsAlert.innerHTML = `
              <div class="alert alert-success d-flex align-items-center gap-2 py-2 mb-3" style="background: rgba(0,230,118,0.15); border: 1px solid #00e676; color: #00e676; font-size: 0.82rem; border-radius: 10px;">
                <i class="bi bi-check-circle-fill"></i>
                <div>${data.message}. ${loginInfo}</div>
              </div>
            `;
          }
          await loadSpecialists();
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

  // 7. Submit Edit Specialist NIC/Role
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
          if (specialistsAlert) {
            specialistsAlert.innerHTML = `
              <div class="alert alert-info d-flex align-items-center gap-2 py-2 mb-3" style="background: rgba(0,210,255,0.15); border: 1px solid var(--callisto-cyan); color: var(--callisto-cyan); font-size: 0.82rem; border-radius: 10px;">
                <i class="bi bi-check-circle-fill"></i>
                <div>${data.message}. Updated NIC: <strong>${nicVal}</strong> [${roleVal.toUpperCase()}].</div>
              </div>
            `;
          }
          await loadSpecialists();
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

  // 8. Submit Delete Specialist
  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      if (!targetDeleteMemberId) return;

      btnConfirmDelete.disabled = true;
      btnConfirmDelete.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Deleting...`;

      try {
        const res = await fetch(`/api/admin/members/${targetDeleteMemberId}`, {
          method: 'DELETE'
        });
        const data = await res.json();

        if (res.ok && data.success) {
          if (bsDeleteModal) bsDeleteModal.hide();
          if (specialistsAlert) {
            specialistsAlert.innerHTML = `
              <div class="alert alert-warning d-flex align-items-center gap-2 py-2 mb-3" style="background: rgba(255,85,0,0.15); border: 1px solid #ff5500; color: #ff9d00; font-size: 0.82rem; border-radius: 10px;">
                <i class="bi bi-trash3-fill"></i>
                <div>${data.message}</div>
              </div>
            `;
          }
          targetDeleteMemberId = null;
          await loadSpecialists();
        } else {
          if (modalDeleteAlert) {
            modalDeleteAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">${data.message || 'Failed to delete specialist'}</div>`;
          }
        }
      } catch (err) {
        console.error('Delete error:', err);
        if (modalDeleteAlert) {
          modalDeleteAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size: 0.78rem;">Network error. Please try again.</div>`;
        }
      } finally {
        btnConfirmDelete.disabled = false;
        btnConfirmDelete.innerHTML = `<i class="bi bi-trash3-fill me-1"></i> Revoke &amp; Delete Specialist`;
      }
    });
  }

  // 9. Logout & Exit Session
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

  // Check URL query parameters (e.g. ?action=register)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('action') === 'register' && btnOpenRegisterModal) {
    setTimeout(() => {
      btnOpenRegisterModal.click();
    }, 400);
  }

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

  // Initial load
  loadPendingBadge();
  loadSpecialists();
});
