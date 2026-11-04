/**
 * Callisto-Orbit Command Center Authentication
 * Redesigned Single-Field NIC Clearance & Large Left 3D Fire Bird Stage
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('loginForm');
  const nicInput = document.getElementById('nicInput');
  const loginBtn = document.getElementById('loginBtn');
  const alertContainer = document.getElementById('alertContainer');
  const rememberMeCheck = document.getElementById('rememberMe');
  const quickNicList = document.getElementById('quickNicList');
  const auditLogText = document.getElementById('auditLogText');
  const largePhoenixStage = document.getElementById('largePhoenixStage');

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

  // 3. Handle Fly-In Animation
  const urlParams = new URLSearchParams(window.location.search);
  const flyIn = urlParams.get('flyIn') === 'true';
  if (largePhoenixStage && flyIn) {
    largePhoenixStage.classList.add('fly-in-active');
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

  // 4. Load Squad Members to Render Quick 1-Click NIC Pills
  async function loadTeamMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        renderQuickNicPills(data.members);
      }
    } catch (e) {
      console.warn('Squad member fetch error:', e);
    }
  }

  function renderQuickNicPills(members) {
    if (!quickNicList) return;
    quickNicList.innerHTML = members.map(m => `
      <div class="col-6 col-sm-4">
        <div class="quick-nic-pill" data-nic="${m.nic || ''}" data-name="${m.name}" title="Click to fill NIC for ${m.name}">
          <img src="${m.avatar}" alt="${m.name}" style="width: 24px; height: 24px; border-radius: 50%; background: #0c1222;">
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <div style="font-weight: 700; font-size: 0.72rem; color: #fff;">${m.name.split(' ')[0]}</div>
            <div style="font-size: 0.65rem; color: var(--callisto-amber); font-family: monospace;">${m.nic || 'NIC'}</div>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click handlers
    document.querySelectorAll('.quick-nic-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const nic = pill.getAttribute('data-nic');
        const name = pill.getAttribute('data-name');
        if (nicInput && nic) {
          nicInput.value = nic;
          nicInput.focus();
          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #ff9d00;">Selected:</span> ${name} (${nic}) &bull; Ready for verification`;
          }
          // Highlight dispatch button
          if (loginBtn) {
            loginBtn.classList.add('glow-pulse');
            setTimeout(() => loginBtn.classList.remove('glow-pulse'), 1000);
          }
        }
      });
    });
  }

  loadTeamMembers();

  // 5. Handle Single-Field Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const nic = nicInput ? nicInput.value.trim() : '';
      if (!nic) {
        showAlert('Please enter your Operator NIC number.');
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
          body: JSON.stringify({ nic })
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

          // Accelerate Phoenix wings on login success
          const leftWing = document.querySelector('.wing-left-large');
          const rightWing = document.querySelector('.wing-right-large');
          if (leftWing) leftWing.style.animationDuration = '0.35s';
          if (rightWing) rightWing.style.animationDuration = '0.35s';

          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 650);
        } else {
          showAlert(result.message || 'Access Denied: Unrecognized or inactive Operator NIC.');
          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = `
              <i class="bi bi-fingerprint fs-5"></i>
              <span>VERIFY NIC &amp; ENTER ORBIT</span>
            `;
          }
          if (nicInput) nicInput.select();

          if (auditLogText) {
            auditLogText.innerHTML = `<span style="color: #f87171;">Clearance Rejected:</span> NIC not found in Callisto squad vault`;
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
          `;
        }
      }
    });
  }

  // 6. Background Embers Canvas for Login Page
  function initLoginEmberCanvas() {
    const canvas = document.getElementById('loginEmberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const embers = [];
    const emberCount = Math.min(45, Math.floor(window.innerWidth / 30));

    class Ember {
      constructor() { this.reset(true); }
      reset(randomY = false) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : height + 10;
        this.radius = Math.random() * 2 + 0.8;
        this.vy = -(Math.random() * 1.5 + 0.5);
        this.vx = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.6 + 0.3;
        this.color = Math.random() > 0.4 ? '#ff5500' : '#ffb700';
      }
      update() {
        this.y += this.vy;
        this.x += this.vx;
        this.opacity -= 0.002;
        if (this.y < -10 || this.opacity <= 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < emberCount; i++) {
      embers.push(new Ember());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < embers.length; i++) {
        embers[i].update();
        embers[i].draw();
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  initLoginEmberCanvas();

  // 7. Fire Cursor Aura Follower
  const aura = document.getElementById('cursorFireAura');
  if (aura) {
    let mouseX = -100, mouseY = -100;
    let currentX = -100, currentY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      aura.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      aura.style.opacity = '0';
    });

    const interactives = 'a, button, input, [role="button"], .quick-nic-pill, .btn';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => aura.classList.add('aura-hover'));
      el.addEventListener('mouseleave', () => aura.classList.remove('aura-hover'));
    });

    function loopAura() {
      currentX += (mouseX - currentX) * 0.22;
      currentY += (mouseY - currentY) * 0.22;
      aura.style.transform = `translate3d(${currentX - 11}px, ${currentY - 11}px, 0)`;
      requestAnimationFrame(loopAura);
    }
    loopAura();
  }
});
