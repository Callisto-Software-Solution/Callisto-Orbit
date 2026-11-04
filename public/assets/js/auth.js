/**
 * Callisto-Orbit Command Center Authentication
 * Multi-Mode Authentication:
 * 1. Member Access: Single-Field NIC Clearance
 * 2. Admin & Super Admin: Elevated Access with Master Key
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const nicInput = document.getElementById('nicInput');
  const adminIdentifier = document.getElementById('adminIdentifier');
  const adminPassword = document.getElementById('adminPassword');
  const memberFieldGroup = document.getElementById('memberFieldGroup');
  const adminFieldGroup = document.getElementById('adminFieldGroup');
  const btnModeMember = document.getElementById('btnModeMember');
  const btnModeAdmin = document.getElementById('btnModeAdmin');
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const alertContainer = document.getElementById('alertContainer');
  const rememberMeCheck = document.getElementById('rememberMe');
  const auditLogText = document.getElementById('auditLogText');

  let currentMode = 'member'; // 'member' | 'admin'

  // 1. Check if session already active
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        window.location.replace('/dashboard.html');
        return;
      }
    }
  } catch (err) {}

  // 2. Restore remembered NIC
  const savedNic = localStorage.getItem('callisto_remembered_nic');
  if (savedNic && nicInput) {
    nicInput.value = savedNic;
    if (rememberMeCheck) rememberMeCheck.checked = true;
  }

  function showAlert(message, type = 'danger') {
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert-glass-box ${type === 'danger' ? 'alert-glass-danger' : 'alert-glass-success'}">
        <i class="bi ${type === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-success'}"></i>
        <div class="flex-grow-1">${message}</div>
      </div>
    `;
  }

  function clearAlert() {
    if (!alertContainer) return;
    alertContainer.innerHTML = '';
  }

  // 3. Mode Switcher Event Handlers
  if (btnModeMember) {
    btnModeMember.addEventListener('click', () => {
      currentMode = 'member';
      btnModeMember.classList.add('active');
      if (btnModeAdmin) btnModeAdmin.classList.remove('active');
      if (memberFieldGroup) memberFieldGroup.classList.remove('d-none');
      if (adminFieldGroup) adminFieldGroup.classList.add('d-none');
      if (loginBtnText) loginBtnText.textContent = 'VERIFY NIC & ENTER ORBIT';
      if (auditLogText) {
        auditLogText.innerHTML = `<span style="color: var(--callisto-cyan);">Member Clearance:</span> Enter your registered Callisto NIC and press Verify`;
      }
      clearAlert();
      if (nicInput) nicInput.focus();
    });
  }

  if (btnModeAdmin) {
    btnModeAdmin.addEventListener('click', () => {
      currentMode = 'admin';
      btnModeAdmin.classList.add('active');
      if (btnModeMember) btnModeMember.classList.remove('active');
      if (adminFieldGroup) adminFieldGroup.classList.remove('d-none');
      if (memberFieldGroup) memberFieldGroup.classList.add('d-none');
      if (loginBtnText) loginBtnText.textContent = 'AUTHENTICATE ADMIN CONSOLE';
      if (auditLogText) {
        auditLogText.innerHTML = `<span style="color: #ff9d00;">Admin Clearance:</span> Enter your Admin NIC and Password`;
      }
      clearAlert();
      if (adminIdentifier) adminIdentifier.focus();
    });
  }

  // 4. Form Submission Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      let payload = {};

      if (currentMode === 'admin') {
        const idVal = adminIdentifier ? adminIdentifier.value.trim() : '';
        const pwVal = adminPassword ? adminPassword.value : '';

        if (!idVal) {
          showAlert('Please enter your Admin NIC number (e.g. 200213800593).');
          if (adminIdentifier) adminIdentifier.focus();
          return;
        }

        if (!pwVal) {
          showAlert('Please enter your Admin password (default: callisto123).');
          if (adminPassword) adminPassword.focus();
          return;
        }

        payload = {
          identifier: idVal,
          password: pwVal,
          mode: 'admin'
        };
      } else {
        const rawNic = nicInput ? nicInput.value : '';
        const nic = rawNic.trim();

        if (!nic || nic.length < 5) {
          showAlert('Please enter a valid Operator NIC number (e.g. 200213800593 or 199912345672).');
          if (nicInput) nicInput.focus();
          return;
        }

        payload = {
          nic: nic,
          identifier: nic,
          password: 'callisto123',
          mode: 'member'
        };
      }

      // UI state loading
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>${currentMode === 'admin' ? 'AUTHENTICATING PRIVILEGES...' : 'VERIFYING NIC CLEARANCE...'}</span>
        `;
      }

      if (auditLogText) {
        auditLogText.innerHTML = `<span style="color: var(--callisto-cyan);">Auditing Vault:</span> Querying zero-DB ledger for cryptographic clearance...`;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const roleDisplay = (result.user.role || 'member').replace('_', ' ').toUpperCase();
          showAlert(`Clearance Granted! Welcome ${result.user.name} [${roleDisplay}]. Entering Orbit...`, 'success');

          if (currentMode === 'member') {
            if (rememberMeCheck && rememberMeCheck.checked) {
              localStorage.setItem('callisto_remembered_nic', payload.nic);
            } else {
              localStorage.removeItem('callisto_remembered_nic');
            }
          }

          sessionStorage.setItem('callisto_active_user', JSON.stringify(result.user));

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #00f076;">Clearance Verified:</span> Welcome ${result.user.name} (${roleDisplay})!`;
          }

          if (window.triggerOrbitTransition) {
            window.triggerOrbitTransition('/dashboard.html', `CLEARANCE GRANTED • ENTERING ORBIT AS ${roleDisplay}...`, 1000);
          } else {
            setTimeout(() => {
              window.location.href = '/dashboard.html';
            }, 600);
          }
        } else {
          showAlert(result.message || 'Authentication failed. Please verify your credentials.');

          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = `
              <i class="bi bi-fingerprint fs-5"></i>
              <span id="loginBtnText">${currentMode === 'admin' ? 'AUTHENTICATE ADMIN CONSOLE' : 'VERIFY NIC & ENTER ORBIT'}</span>
              <i class="bi bi-arrow-right-short fs-4"></i>
            `;
          }

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #f87171;">Clearance Rejected:</span> ${result.message || 'Access Denied'}`;
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        showAlert('Network or gateway error. Please verify server status.');
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <i class="bi bi-fingerprint fs-5"></i>
            <span id="loginBtnText">${currentMode === 'admin' ? 'AUTHENTICATE ADMIN CONSOLE' : 'VERIFY NIC & ENTER ORBIT'}</span>
            <i class="bi bi-arrow-right-short fs-4"></i>
          `;
        }
      }
    });
  }
});
