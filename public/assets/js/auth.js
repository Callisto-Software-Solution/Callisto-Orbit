/**
 * Callisto-Orbit Authentication Client
 * Handles login, session detection, password visibility, and quick member fill
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

  // Check if user is already logged in
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        window.location.replace('/dashboard.html');
        return;
      }
    }
  } catch (err) {
    // Server might be initializing, continue
  }

  // Restore saved username if available
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

  // Show Toast / Alert message
  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="alert-callisto ${type === 'danger' ? 'alert-danger-glass' : 'alert-success-glass'}">
        <i class="bi ${type === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-success'} fs-5"></i>
        <div class="flex-grow-1">${message}</div>
      </div>
    `;
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearAlert() {
    alertContainer.innerHTML = '';
  }

  // Populate Quick Fill Member Buttons
  async function loadTeamMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        renderMemberPills(data.members);
      }
    } catch (e) {
      console.warn('Failed loading member list:', e);
    }
  }

  function renderMemberPills(members) {
    if (!memberPillsContainer) return;
    memberPillsContainer.innerHTML = members.map(m => `
      <button type="button" class="member-pill-btn" data-username="${m.username}">
        <img src="${m.avatar}" alt="${m.name}" class="member-pill-avatar">
        <div class="d-flex flex-column" style="min-width: 0;">
          <span class="member-pill-name">${m.name}</span>
          <span class="member-pill-role">${m.role === 'admin' ? '⭐ Admin' : m.title}</span>
        </div>
      </button>
    `).join('');

    // Attach click handlers to quickly fill credentials
    memberPillsContainer.querySelectorAll('.member-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username');
        identifierInput.value = username;
        passwordInput.value = 'callisto123';
        clearAlert();
        passwordInput.focus();

        // Brief highlight effect
        btn.style.borderColor = '#ff5500';
        btn.style.background = 'rgba(255, 85, 0, 0.25)';
        setTimeout(() => {
          btn.style.borderColor = '';
          btn.style.background = '';
        }, 300);
      });
    });
  }

  loadTeamMembers();

  // Handle Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const identifier = identifierInput.value.trim();
      const password = passwordInput.value;

      if (!identifier || !password) {
        showAlert('Please enter both username/email and password.');
        return;
      }

      // UI Loading state
      loginBtn.disabled = true;
      loginBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span>Authenticating with Orbit...</span>
      `;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ identifier, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAlert(result.message || 'Access Granted! Redirecting...', 'success');

          // Remember Me logic
          if (rememberMeCheck && rememberMeCheck.checked) {
            localStorage.setItem('callisto_remembered_user', identifier);
          } else {
            localStorage.removeItem('callisto_remembered_user');
          }

          // Store auth info in sessionStorage
          sessionStorage.setItem('callisto_active_user', JSON.stringify(result.user));

          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 800);
        } else {
          showAlert(result.message || 'Authentication failed. Please check credentials.');
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <span>Access Orbit</span>
            <i class="bi bi-arrow-right-short fs-4"></i>
          `;
          passwordInput.select();
        }
      } catch (err) {
        console.error('Login error:', err);
        showAlert('Network error or server unreachable. Please verify server is running.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
          <span>Access Orbit</span>
          <i class="bi bi-arrow-right-short fs-4"></i>
        `;
      }
    });
  }
});
