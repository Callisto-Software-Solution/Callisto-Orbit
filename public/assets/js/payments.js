/**
 * Callisto-Orbit — payments.js v1.0
 * Payment Verification Vault — Submit, verify, reject pool contributions
 */
document.addEventListener('DOMContentLoaded', async () => {

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const portalLoader         = document.getElementById('portalLoader');
  const userNameElem         = document.getElementById('userName');
  const userAvatarElem       = document.getElementById('userAvatar');
  const userRoleElem         = document.getElementById('userRole');
  const userRoleBadge        = document.getElementById('userRoleBadge');
  const sideUserName         = document.getElementById('sideUserName');
  const sideUserAvatar       = document.getElementById('sideUserAvatar');
  const sideUserRoleBadge    = document.getElementById('sideUserRoleBadge');
  const sideAdminGroup       = document.getElementById('sideAdminGroup');
  const sideLogoutBtn        = document.getElementById('sideLogoutBtn');

  const paymentsAlert        = document.getElementById('paymentsAlert');
  const paymentsList         = document.getElementById('paymentsList');
  const paymentsLoadingState = document.getElementById('paymentsLoadingState');
  const paymentsEmptyState   = document.getElementById('paymentsEmptyState');
  const filterMonthLabel     = document.getElementById('filterMonthLabel');

  // Summary stats
  const statTotal   = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statVerified = document.getElementById('statVerified');
  const statAmount  = document.getElementById('statAmount');

  // Buttons
  const btnOpenPayModal    = document.getElementById('btnOpenPayModal');
  const btnAddPaymentAdmin = document.getElementById('btnAddPaymentAdmin');
  const sideBtnAddPayment  = document.getElementById('sideBtnAddPayment');

  // Submit Payment Modal
  const modalSubmitPayment = document.getElementById('modalSubmitPayment');
  const payModalTitle      = document.getElementById('payModalTitle');
  const payModalSub        = document.getElementById('payModalSub');
  const payModalAlert      = document.getElementById('payModalAlert');
  const formSubmitPayment  = document.getElementById('formSubmitPayment');
  const payForMemberGroup  = document.getElementById('payForMemberGroup');
  const payForMemberId     = document.getElementById('payForMemberId');
  const payMonth           = document.getElementById('payMonth');
  const payAmount          = document.getElementById('payAmount');
  const payMethod          = document.getElementById('payMethod');
  const payTxRef           = document.getElementById('payTxRef');
  const payDate            = document.getElementById('payDate');
  const payNotes           = document.getElementById('payNotes');
  const payAutoVerifyGroup = document.getElementById('payAutoVerifyGroup');
  const payAutoVerify      = document.getElementById('payAutoVerify');
  const btnSubmitPay       = document.getElementById('btnSubmitPay');

  // Reject Modal
  const modalRejectPayment = document.getElementById('modalRejectPayment');
  const rejectPayAlert     = document.getElementById('rejectPayAlert');
  const rejectReason       = document.getElementById('rejectReason');
  const btnConfirmReject   = document.getElementById('btnConfirmReject');

  let bsPayModal    = null;
  let bsRejectModal = null;
  if (typeof bootstrap !== 'undefined') {
    if (modalSubmitPayment) bsPayModal    = new bootstrap.Modal(modalSubmitPayment);
    if (modalRejectPayment) bsRejectModal = new bootstrap.Modal(modalRejectPayment);
  }

  let currentUser     = null;
  let cachedPayments  = [];
  let cachedMembers   = [];
  let currentFilter   = 'all';
  let rejectTargetId  = null;
  let isAdminMode     = false; // true when admin opens "Add for member"

  // ── Helpers ───────────────────────────────────────────────────────────────
  function getRoleBadge(role) {
    if (role === 'super_admin') return `<span class="badge" style="background:linear-gradient(135deg,rgba(255,85,0,0.35),rgba(216,27,27,0.35));border:1px solid #ff5500;color:#ff9d00;font-size:0.65rem;font-weight:700;"><i class="bi bi-star-fill text-warning me-1"></i>SUPER ADMIN</span>`;
    if (role === 'admin')       return `<span class="badge" style="background:rgba(0,210,255,0.18);border:1px solid #00d2ff;color:#00d2ff;font-size:0.65rem;font-weight:700;"><i class="bi bi-shield-lock-fill me-1"></i>ADMIN</span>`;
    return `<span class="badge" style="background:rgba(0,240,118,0.15);border:1px solid #00f076;color:#00f076;font-size:0.65rem;font-weight:700;"><i class="bi bi-person-check-fill me-1"></i>MEMBER</span>`;
  }

  function formatDate(str) {
    if (!str) return '—';
    try {
      const d = new Date(str);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return str; }
  }

  function formatMonth(str) {
    if (!str) return '—';
    try {
      const [y, m] = str.split('-');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[parseInt(m) - 1]} ${y}`;
    } catch { return str; }
  }

  function showAlert(html, type = 'success') {
    if (!paymentsAlert) return;
    paymentsAlert.innerHTML = `
      <div class="alert d-flex align-items-center gap-2 py-2 mb-3" style="background:rgba(${type === 'success' ? '16,185,129' : type === 'danger' ? '239,68,68' : '245,158,11'},0.15);border:1px solid ${type === 'success' ? '#10b981' : type === 'danger' ? '#ef4444' : '#f59e0b'};color:${type === 'success' ? '#34d399' : type === 'danger' ? '#f87171' : '#fbbf24'};font-size:0.82rem;border-radius:10px;">
        <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'danger' ? 'x-circle-fill' : 'exclamation-triangle-fill'}"></i>
        <div>${html}</div>
      </div>`;
    setTimeout(() => { if (paymentsAlert) paymentsAlert.innerHTML = ''; }, 6000);
  }

  // ── 1. Auth check ─────────────────────────────────────────────────────────
  try {
    const r = await fetch('/api/auth/me');
    if (!r.ok) { window.location.replace('/'); return; }
    const d = await r.json();
    if (d.success && d.user) {
      currentUser = d.user;
      renderCurrentUser(currentUser);
    } else {
      window.location.replace('/');
      return;
    }
  } catch (e) {
    console.error('Auth check failed:', e);
    window.location.replace('/');
    return;
  }

  function renderCurrentUser(user) {
    const role = user.role || 'member';
    if (userNameElem)   userNameElem.textContent  = user.name;
    if (userRoleElem)   userRoleElem.textContent   = user.title || (role === 'super_admin' ? 'Founder & Lead' : role === 'admin' ? 'Squad Administrator' : 'Squad Specialist');
    if (userAvatarElem && user.avatar) userAvatarElem.src = user.avatar;
    if (sideUserName)   sideUserName.textContent  = user.name;
    if (sideUserAvatar && user.avatar) sideUserAvatar.src = user.avatar;
    if (sideUserRoleBadge) sideUserRoleBadge.innerHTML = getRoleBadge(role);
    if (userRoleBadge)  userRoleBadge.innerHTML   = getRoleBadge(role);

    const isAdmin = role === 'admin' || role === 'super_admin';
    if (isAdmin) {
      if (sideAdminGroup)       sideAdminGroup.classList.remove('d-none');
      if (btnAddPaymentAdmin)   btnAddPaymentAdmin.classList.remove('d-none');
      if (payAutoVerifyGroup)   payAutoVerifyGroup.classList.remove('d-none');
    }
  }

  // ── 2. Load members (for admin dropdown) ──────────────────────────────────
  async function loadMembers() {
    try {
      const r = await fetch('/api/members');
      const d = await r.json();
      if (d.success && Array.isArray(d.members)) {
        cachedMembers = d.members;
        // Populate select
        if (payForMemberId) {
          payForMemberId.innerHTML = cachedMembers.map(m =>
            `<option value="${m.id}">${m.name} (${m.role}) — NIC: ${m.nic}</option>`
          ).join('');
        }
      }
    } catch (e) { console.error('Failed to load members:', e); }
  }

  // ── 3. Load & render payments ─────────────────────────────────────────────
  async function loadPayments() {
    try {
      const r = await fetch('/api/payments');
      if (!r.ok) { console.error('API error:', r.status); return; }
      const d = await r.json();

      if (d.success) {
        cachedPayments = d.payments || [];
        renderSummary(d.summary || {});
        renderPayments();
      }
    } catch (e) {
      console.error('Failed to load payments:', e);
    } finally {
      if (paymentsLoadingState) paymentsLoadingState.classList.add('d-none');
    }
  }

  function renderSummary(s) {
    const currency = s.currency || 'Rs. ';
    if (statTotal)    statTotal.textContent   = s.totalCount    ?? '0';
    if (statPending)  statPending.textContent  = s.pendingCount  ?? '0';
    if (statVerified) statVerified.textContent = s.verifiedCount ?? '0';
    if (statAmount)   statAmount.textContent   = `${currency}${(s.verifiedTotalAmount || 0).toLocaleString()}`;
  }

  function renderPayments() {
    if (!paymentsList) return;

    let list = cachedPayments.slice();
    if (currentFilter !== 'all') {
      list = list.filter(p => p.status === currentFilter);
    }

    if (list.length === 0) {
      paymentsList.innerHTML = '';
      if (paymentsEmptyState) paymentsEmptyState.classList.remove('d-none');
      return;
    }
    if (paymentsEmptyState) paymentsEmptyState.classList.add('d-none');

    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
    const isSuperAdmin = currentUser && currentUser.role === 'super_admin';

    paymentsList.innerHTML = list.map(p => {
      const isSelf = currentUser && currentUser.id === p.userId;
      const statusClass = p.status === 'verified' ? 'status-verified' : p.status === 'rejected' ? 'status-rejected' : 'status-pending';

      let statusBadge = '';
      if (p.status === 'verified')             statusBadge = `<span class="badge-verified"><i class="bi bi-check-circle-fill me-1"></i>Verified</span>`;
      else if (p.status === 'rejected')        statusBadge = `<span class="badge-rejected"><i class="bi bi-x-circle-fill me-1"></i>Rejected</span>`;
      else                                     statusBadge = `<span class="badge-pending"><i class="bi bi-hourglass-split me-1"></i>Pending</span>`;

      const avatarSrc = p.userAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.userName || 'user')}`;

      // Action buttons
      let actionBtns = '';
      if (isAdmin && p.status === 'pending_verification') {
        actionBtns = `
          <button class="btn-verify-pay btn-action-verify" data-id="${p.id}"><i class="bi bi-check-circle-fill me-1"></i>Verify</button>
          <button class="btn-reject-pay btn-action-reject" data-id="${p.id}"><i class="bi bi-x-circle me-1"></i>Reject</button>`;
      }
      if (isSuperAdmin) {
        actionBtns += `<button class="btn-delete-pay btn-action-delete ms-1" data-id="${p.id}" title="Delete Entry"><i class="bi bi-trash3-fill"></i></button>`;
      }

      // Verification / rejection info
      let verifyInfo = '';
      if (p.status === 'verified' && p.verifiedByName) {
        verifyInfo = `<div class="mt-2" style="font-size:0.72rem;color:#34d399;"><i class="bi bi-patch-check-fill me-1"></i>Verified by <strong>${p.verifiedByName}</strong> on ${formatDate(p.verifiedAt)}</div>`;
      } else if (p.status === 'rejected') {
        verifyInfo = `<div class="mt-2" style="font-size:0.72rem;color:#f87171;"><i class="bi bi-x-octagon-fill me-1"></i>Rejected${p.rejectedByName ? ` by <strong>${p.rejectedByName}</strong>` : ''} ${p.rejectedAt ? `on ${formatDate(p.rejectedAt)}` : ''}</div>`;
        if (p.rejectReason) verifyInfo += `<div style="font-size:0.7rem;color:#94a3b8;margin-top:2px;">Reason: ${p.rejectReason}</div>`;
      }

      return `
        <div class="pay-card ${statusClass} p-3" data-pay-id="${p.id}">
          <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <!-- Left: Avatar + Info -->
            <div class="d-flex align-items-center gap-3">
              <img src="${avatarSrc}" alt="${p.userName || 'User'}" style="width:48px;height:48px;border-radius:12px;background:#131c31;border:1.5px solid rgba(255,255,255,0.1);flex-shrink:0;">
              <div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span style="font-weight:700;color:#fff;font-size:0.95rem;">${p.userName || '—'}</span>
                  ${p.userRole ? getRoleBadge(p.userRole) : ''}
                  ${isSelf ? `<span class="badge" style="background:rgba(255,85,0,0.15);border:1px solid rgba(255,85,0,0.4);color:#ff9d00;font-size:0.65rem;">You</span>` : ''}
                </div>
                <div style="font-size:0.75rem;color:#94a3b8;margin-top:2px;">
                  <span class="font-monospace">NIC: ${p.userNic || '—'}</span>
                  <span class="mx-2">•</span>
                  <i class="bi bi-calendar3 me-1 text-warning"></i>${formatMonth(p.month)}
                </div>
                <div class="mt-1 d-flex align-items-center flex-wrap gap-2" style="font-size:0.76rem;color:#cbd5e1;">
                  <span><i class="bi bi-credit-card me-1"></i>${p.method || '—'}</span>
                  <span>•</span>
                  <span class="font-monospace">${p.txRef || '—'}</span>
                  <span>•</span>
                  <span><i class="bi bi-calendar-event me-1"></i>${formatDate(p.paidDate)}</span>
                </div>
                ${p.notes ? `<div style="font-size:0.7rem;color:#64748b;margin-top:3px;"><i class="bi bi-chat-left-text me-1"></i>${p.notes}</div>` : ''}
                ${verifyInfo}
              </div>
            </div>

            <!-- Right: Amount + Status + Actions -->
            <div class="text-sm-end d-flex flex-sm-column align-items-center align-items-sm-end gap-2">
              <div style="font-family:var(--font-display);font-size:1.35rem;font-weight:800;color:#fff;">
                ${p.currency || 'Rs. '}${(p.amount || 0).toLocaleString()}
              </div>
              <div>${statusBadge}</div>
              ${actionBtns ? `<div class="d-flex align-items-center gap-1 mt-1">${actionBtns}</div>` : ''}
              <div style="font-size:0.68rem;color:#475569;margin-top:2px;">
                Submitted ${formatDate(p.submittedAt)} by ${p.submittedByName || p.submittedBy || '—'}
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Attach events
    document.querySelectorAll('.btn-action-verify').forEach(btn => {
      btn.addEventListener('click', () => verifyPayment(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.btn-action-reject').forEach(btn => {
      btn.addEventListener('click', () => openRejectModal(btn.getAttribute('data-id')));
    });
    document.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => deletePayment(btn.getAttribute('data-id')));
    });
  }

  // ── 4. Filter buttons ─────────────────────────────────────────────────────
  document.querySelectorAll('#filterBtns .filter-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#filterBtns .filter-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderPayments();

      const labels = { all: 'All Months', pending_verification: 'Pending', verified: 'Verified', rejected: 'Rejected' };
      if (filterMonthLabel) filterMonthLabel.innerHTML = `<i class="bi bi-calendar3 me-1 text-warning"></i>Showing: ${labels[currentFilter] || 'All'}`;
    });
  });

  // ── 5. Open Submit Payment Modal ──────────────────────────────────────────
  function openPayModal(adminMode = false) {
    isAdminMode = adminMode;
    if (payModalAlert) payModalAlert.innerHTML = '';
    if (formSubmitPayment) formSubmitPayment.reset();
    if (payAutoVerify) payAutoVerify.checked = false;

    // Set today's date
    if (payDate) {
      const today = new Date().toISOString().split('T')[0];
      payDate.value = today;
    }

    if (adminMode) {
      if (payModalTitle)       payModalTitle.textContent = 'Add Payment for Specialist';
      if (payModalSub)         payModalSub.textContent   = 'Record a payment on behalf of any squad member';
      if (payForMemberGroup)   payForMemberGroup.classList.remove('d-none');
      if (payAutoVerifyGroup)  payAutoVerifyGroup.classList.remove('d-none');
    } else {
      if (payModalTitle)       payModalTitle.textContent = 'Submit My Payment';
      if (payModalSub)         payModalSub.textContent   = 'Record your monthly pool contribution for verification';
      if (payForMemberGroup)   payForMemberGroup.classList.add('d-none');

      const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
      if (isAdmin && payAutoVerifyGroup) payAutoVerifyGroup.classList.remove('d-none');
      else if (payAutoVerifyGroup)       payAutoVerifyGroup.classList.add('d-none');
    }

    if (bsPayModal) bsPayModal.show();
  }

  if (btnOpenPayModal)    btnOpenPayModal.addEventListener('click',    () => openPayModal(false));
  if (btnAddPaymentAdmin) btnAddPaymentAdmin.addEventListener('click', () => openPayModal(true));
  if (sideBtnAddPayment)  sideBtnAddPayment.addEventListener('click',  () => openPayModal(true));

  // ── 6. Submit payment form ─────────────────────────────────────────────────
  if (formSubmitPayment) {
    formSubmitPayment.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (payModalAlert) payModalAlert.innerHTML = '';

      const methodVal = payMethod ? payMethod.value : '';
      const txRefVal  = payTxRef  ? payTxRef.value.trim()  : '';
      const amtVal    = payAmount ? Number(payAmount.value) : 100;

      if (!methodVal) {
        if (payModalAlert) payModalAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">Please select a payment method.</div>`;
        return;
      }
      if (!txRefVal) {
        if (payModalAlert) payModalAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">Transaction reference / slip ID is required.</div>`;
        return;
      }
      if (!amtVal || amtVal < 1) {
        if (payModalAlert) payModalAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">Amount must be greater than 0.</div>`;
        return;
      }

      const payload = {
        month:       payMonth      ? payMonth.value  : '2026-02',
        amount:      amtVal,
        method:      methodVal,
        txRef:       txRefVal,
        paidDate:    payDate       ? payDate.value   : new Date().toISOString().split('T')[0],
        notes:       payNotes      ? payNotes.value.trim() : '',
        autoVerify:  payAutoVerify ? payAutoVerify.checked : false
      };

      if (isAdminMode && payForMemberId && payForMemberId.value) {
        payload.userId = payForMemberId.value;
      }

      btnSubmitPay.disabled = true;
      btnSubmitPay.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Submitting...`;

      try {
        const r = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const d = await r.json();

        if (r.ok && d.success) {
          if (bsPayModal) bsPayModal.hide();
          showAlert(d.message, 'success');
          await loadPayments();
        } else {
          if (payModalAlert) payModalAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">${d.message || 'Submission failed'}</div>`;
        }
      } catch (err) {
        console.error('Submit error:', err);
        if (payModalAlert) payModalAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">Network error. Please try again.</div>`;
      } finally {
        btnSubmitPay.disabled = false;
        btnSubmitPay.innerHTML = `<i class="bi bi-send-fill"></i> Submit Payment`;
      }
    });
  }

  // ── 7. Verify payment ──────────────────────────────────────────────────────
  async function verifyPayment(paymentId) {
    try {
      const r = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const d = await r.json();

      if (r.ok && d.success) {
        showAlert(d.message, 'success');
        await loadPayments();
      } else {
        showAlert(d.message || 'Verification failed', 'danger');
      }
    } catch (err) {
      console.error('Verify error:', err);
      showAlert('Network error. Please try again.', 'danger');
    }
  }

  // ── 8. Reject payment modal ────────────────────────────────────────────────
  function openRejectModal(paymentId) {
    rejectTargetId = paymentId;
    if (rejectPayAlert) rejectPayAlert.innerHTML = '';
    if (rejectReason)   rejectReason.value = '';
    if (bsRejectModal) bsRejectModal.show();
  }

  if (btnConfirmReject) {
    btnConfirmReject.addEventListener('click', async () => {
      if (!rejectTargetId) return;
      const reason = rejectReason ? rejectReason.value.trim() : '';
      if (!reason) {
        if (rejectPayAlert) rejectPayAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">Please provide a reason for rejection.</div>`;
        return;
      }

      btnConfirmReject.disabled = true;
      btnConfirmReject.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Rejecting...`;

      try {
        const r = await fetch(`/api/payments/${rejectTargetId}/reject`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason })
        });
        const d = await r.json();

        if (r.ok && d.success) {
          if (bsRejectModal) bsRejectModal.hide();
          rejectTargetId = null;
          showAlert('Payment rejected and treasury updated.', 'warning');
          await loadPayments();
        } else {
          if (rejectPayAlert) rejectPayAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">${d.message || 'Rejection failed'}</div>`;
        }
      } catch (err) {
        console.error('Reject error:', err);
        if (rejectPayAlert) rejectPayAlert.innerHTML = `<div class="alert alert-danger py-2" style="font-size:0.78rem;">Network error.</div>`;
      } finally {
        btnConfirmReject.disabled = false;
        btnConfirmReject.innerHTML = `<i class="bi bi-x-circle-fill"></i> Confirm Reject`;
      }
    });
  }

  // ── 9. Delete payment (Super Admin only) ──────────────────────────────────
  async function deletePayment(paymentId) {
    const target = cachedPayments.find(p => p.id === paymentId);
    const name = target ? target.userName : 'this entry';
    if (!confirm(`Permanently delete payment record for ${name}? This action cannot be undone.`)) return;

    try {
      const r = await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
      const d = await r.json();
      if (r.ok && d.success) {
        showAlert('Payment record permanently removed from vault.', 'warning');
        await loadPayments();
      } else {
        showAlert(d.message || 'Delete failed', 'danger');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('Network error. Please try again.', 'danger');
    }
  }

  // ── 10. Logout ─────────────────────────────────────────────────────────────
  const executeLogout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    try {
      sessionStorage.clear();
      document.cookie = 'callisto_token=; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch {}
    if (window.triggerOrbitTransition) {
      window.triggerOrbitTransition('/login.html', 'SESSION TERMINATED • EXITING CLEARANCE...', 800);
    } else {
      window.location.replace('/login.html');
    }
  };
  if (sideLogoutBtn) sideLogoutBtn.addEventListener('click', executeLogout);

  // ── 11. Initialise ─────────────────────────────────────────────────────────
  if (portalLoader) {
    setTimeout(() => {
      portalLoader.style.opacity = '0';
      setTimeout(() => { portalLoader.style.display = 'none'; }, 500);
    }, 700);
  }

  await loadMembers();
  await loadPayments();
});
