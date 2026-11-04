/**
 * Callisto-Orbit Command Center Authentication
 * Image 2 Layout Integration with Real-Time Zone Tree Dispatcher
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const identifierInput = document.getElementById('identifier');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  const loginBtn = document.getElementById('loginBtn');
  const alertContainer = document.getElementById('alertContainer');
  const rememberMeCheck = document.getElementById('rememberMe');
  const memberPillsContainer = document.getElementById('memberPills');
  const auditLogText = document.getElementById('auditLogText');

  // Check if session already active
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

  // Restore remembered operator
  const savedUser = localStorage.getItem('callisto_remembered_user');
  if (savedUser && identifierInput) {
    identifierInput.value = savedUser;
    if (rememberMeCheck) rememberMeCheck.checked = true;
  }

  // Toggle Password Visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordIcon.className = isPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
    });
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
    if (alertContainer) alertContainer.innerHTML = '';
  }

  // Populate 6 Squad Members in the Interactive Zone Tree
  async function loadTeamMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        renderSquadRows(data.members);
      }
    } catch (e) {
      console.warn('Squad member fetch error:', e);
    }
  }

  function renderSquadRows(members) {
    if (!memberPillsContainer) return;
    memberPillsContainer.innerHTML = members.map(m => `
      <div class="squad-member-row" data-username="${m.username}">
        <div class="d-flex align-items-center gap-3">
          <div class="member-avatar-box">
            <img src="${m.avatar}" alt="${m.name}">
          </div>
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="member-meta-title">${m.name}</span>
              ${m.role === 'admin' 
                ? '<span class="badge" style="background: rgba(255, 85, 0, 0.2); color: #ff8c00; font-size: 0.65rem;">LEAD</span>' 
                : '<span class="badge" style="background: rgba(255, 255, 255, 0.08); color: #94a3b8; font-size: 0.65rem;">SQUAD</span>'}
            </div>
            <div class="member-meta-role">${m.title || 'Specialist'}</div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-sm-block">
            <div style="font-family: var(--font-display); font-weight: 700; color: #fff; font-size: 0.88rem;">$100.0 USD</div>
            <div style="font-size: 0.68rem; color: #00f076;">● Active Pool</div>
          </div>
          <button type="button" class="member-action-pill select-op-btn" data-username="${m.username}">
            <i class="bi bi-person-check-fill me-1"></i> Target
          </button>
        </div>
      </div>
    `).join('');

    // Attach click triggers to each row and button
    memberPillsContainer.querySelectorAll('.squad-member-row').forEach(row => {
      row.addEventListener('click', () => {
        memberPillsContainer.querySelectorAll('.squad-member-row').forEach(r => r.classList.remove('selected-row'));
        row.classList.add('selected-row');

        const username = row.getAttribute('data-username');
        const member = members.find(m => m.username === username);

        identifierInput.value = username;
        passwordInput.value = 'callisto123';
        clearAlert();

        if (auditLogText) {
          auditLogText.innerHTML = `<span style="color: #00f076;">Operator Selected:</span> ${member ? member.name : username} &bull; Credentials armed`;
        }
      });
    });
  }

  loadTeamMembers();

  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const identifier = identifierInput.value.trim();
      const password = passwordInput.value;

      if (!identifier || !password) {
        showAlert('Please enter both operator identifier and secret token.');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span>DISPATCHING AUTHORIZATION...</span>
      `;

      if (auditLogText) {
        auditLogText.innerHTML = `<span style="color: #ff9d00;">Handshaking with Orbit...</span> Verifying identity [${identifier}]`;
      }

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAlert(`Authorization Granted! Welcome ${result.user.name}. Redirecting...`, 'success');

          if (rememberMeCheck && rememberMeCheck.checked) {
            localStorage.setItem('callisto_remembered_user', identifier);
          } else {
            localStorage.removeItem('callisto_remembered_user');
          }

          sessionStorage.setItem('callisto_active_user', JSON.stringify(result.user));

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #00f076;">Authorized:</span> Redirecting to Orbit Dashboard...`;
          }

          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 650);
        } else {
          showAlert(result.message || 'Access Denied: Invalid operator credentials.');
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <i class="bi bi-send-fill"></i>
            <span>DISPATCH AUTHORIZATION TO ORBIT</span>
          `;
          passwordInput.select();

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #f87171;">Authorization Failed:</span> Invalid credentials for ${identifier}`;
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        showAlert('Network or gateway error. Please verify server status.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
          <i class="bi bi-send-fill"></i>
          <span>DISPATCH AUTHORIZATION TO ORBIT</span>
        `;
      }
    });
  }

  // =========================================================================
  // LIVING PHOENIX SENTINEL 3D WINGS & ARRIVAL CONTROLLER
  // =========================================================================
  const sentinel = document.getElementById('loginPhoenixSentinel');
  if (sentinel) {
    const urlParams = new URLSearchParams(window.location.search);
    const flyIn = urlParams.get('flyIn') === 'true';

    if (flyIn) {
      sentinel.classList.remove('fly-in-active');
      void sentinel.offsetWidth; // Trigger reflow for fresh animation
      sentinel.classList.add('fly-in-active');
    }

    // Gentle swoop audio tone upon arrival
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const actx = new AudioCtx();
        const now = actx.currentTime;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.6);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      }
    } catch (e) {}

    // Interactive Wing Burst upon click/tap
    sentinel.addEventListener('click', () => {
      const badge = sentinel.querySelector('.phoenix-sentinel-badge span:last-child');
      if (badge) {
        badge.textContent = 'PHOENIX: WING FLAP ACCELERATED!';
        setTimeout(() => {
          badge.textContent = 'PHOENIX GUARDIAN • ACTIVE';
        }, 1600);
      }
    });
  }
});
