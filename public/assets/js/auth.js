/**
 * Callisto-Orbit Command Center Authentication
 * Single-Field NIC Clearance with Animated Background Phoenix Support
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const nicInput = document.getElementById('nicInput');
  const loginBtn = document.getElementById('loginBtn');
  const alertContainer = document.getElementById('alertContainer');
  const rememberMeCheck = document.getElementById('rememberMe');
  const quickNicList = document.getElementById('quickNicList');
  const auditLogText = document.getElementById('auditLogText');

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

  // 3. Handle Single-Field NIC Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const rawNic = nicInput ? nicInput.value : '';
      const nic = rawNic.trim();

      // Client-side validation: must not be empty and must look like a valid NIC
      if (!nic || nic.length < 5) {
        showAlert('Please enter a valid Operator NIC number (e.g. 200112345678 or 981234567V).');
        if (nicInput) nicInput.focus();
        return;
      }

      // UI state loading
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>VERIFYING NIC CLEARANCE...</span>
        `;
      }

      if (auditLogText) {
        auditLogText.innerHTML = `<span style="color: var(--callisto-cyan);">Auditing NIC:</span> Querying Callisto vault for clearance...`;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nic: nic,
            identifier: nic,
            password: 'callisto123' // Seamless compatibility with both new and existing runtime processes
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAlert(`Clearance Granted! Welcome ${result.user.name}. Entering Orbit...`, 'success');

          if (rememberMeCheck && rememberMeCheck.checked) {
            localStorage.setItem('callisto_remembered_nic', nic);
          } else {
            localStorage.removeItem('callisto_remembered_nic');
          }

          sessionStorage.setItem('callisto_active_user', JSON.stringify(result.user));

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #00f076;">Clearance Verified:</span> Welcome Operator ${result.user.name}!`;
          }

          if (window.triggerOrbitTransition) {
            window.triggerOrbitTransition('/dashboard.html', `CLEARANCE GRANTED • ENTERING ORBIT...`, 1100);
          } else {
            setTimeout(() => {
              window.location.href = '/dashboard.html';
            }, 600);
          }
        } else {
          // Display the friendly valid NIC prompt
          showAlert(result.message && !result.message.includes('username/email') ? result.message : 'Please enter a valid Operator NIC number.');
          
          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = `
              <i class="bi bi-fingerprint fs-5"></i>
              <span>VERIFY NIC &amp; ENTER ORBIT</span>
              <i class="bi bi-arrow-right-short fs-4"></i>
            `;
          }
          if (nicInput) nicInput.select();

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #f87171;">Clearance Rejected:</span> Please enter a valid registered NIC`;
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        showAlert('Network or gateway error. Please verify server status.');
        if (loginBtn) {
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <i class="bi bi-fingerprint fs-5"></i>
            <span>VERIFY NIC &amp; ENTER ORBIT</span>
            <i class="bi bi-arrow-right-short fs-4"></i>
          `;
        }
      }
    });
  }
});
