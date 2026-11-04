/**
 * Callisto-Orbit Authentication Client
 * Features:
 * - Dynamic Interactive Cyber Canvas (Particle & Circuit Mesh for Glass Refraction)
 * - Holographic Orbit Ring Revolving Animation
 * - 1-Click Fast Squad Biometric Fill
 * - Tamper-Proof Session Authentication
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

  // =========================================================================
  // 1. INTERACTIVE CYBER BACKGROUND CANVAS
  // Produces floating glowing particles & connecting laser circuits so the
  // frosted glass box has vivid optical elements to blur & refract.
  // =========================================================================
  initCyberCanvas();

  function initCyberCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 35 : 75;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Mouse interactive coords
    let mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    const colors = [
      'rgba(255, 85, 0, ',    // Callisto Orange
      'rgba(255, 157, 0, ',   // Amber
      'rgba(230, 32, 32, ',   // Fire Red
      'rgba(0, 229, 255, '    // Cyan Laser
    ];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.9;
        this.vy = (Math.random() - 0.5) * 0.9;
        this.radius = Math.random() * 2.2 + 1;
        this.baseColor = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.6 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse gentle interaction
        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 3;
            this.y -= (dy / dist) * force * 3;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor + this.alpha + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.baseColor + '0.8)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Connect particles with glowing circuit lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 85, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // 2. HOLOGRAPHIC REVOLVING ORBIT NODES ANIMATION
  // =========================================================================
  initOrbitVisualizer();

  function initOrbitVisualizer() {
    let angle = 0;
    const nodes = [
      document.getElementById('node0'),
      document.getElementById('node1'),
      document.getElementById('node2'),
      document.getElementById('node3'),
      document.getElementById('node4'),
      document.getElementById('node5')
    ].filter(Boolean);

    if (nodes.length === 0) return;

    function renderOrbit() {
      angle += 0.015;
      const rx = 125;
      const ry = 50;
      const cx = 150;
      const cy = 80;

      nodes.forEach((node, idx) => {
        const offset = (idx * (Math.PI * 2 / nodes.length));
        const theta = angle + offset;
        const x = cx + rx * Math.cos(theta);
        const y = cy + ry * Math.sin(theta);
        node.setAttribute('cx', x);
        node.setAttribute('cy', y);

        // Scale by depth perspective
        const depth = (Math.sin(theta) + 1) / 2; // 0 to 1
        const r = 3 + depth * 3.5;
        node.setAttribute('r', r);
        node.setAttribute('opacity', 0.4 + depth * 0.6);
      });

      requestAnimationFrame(renderOrbit);
    }
    renderOrbit();
  }

  // =========================================================================
  // 3. SESSION DETECTION & RECOVERY
  // =========================================================================
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

  // Toast / Alert Notification
  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="cyber-alert ${type === 'danger' ? 'cyber-alert-danger' : 'cyber-alert-success'}">
        <i class="bi ${type === 'danger' ? 'bi-shield-exclamation text-danger fs-5' : 'bi-shield-check text-success fs-5'}"></i>
        <div class="flex-grow-1">${message}</div>
      </div>
    `;
  }

  function clearAlert() {
    alertContainer.innerHTML = '';
  }

  // =========================================================================
  // 4. LOAD 6 SQUAD MEMBERS & BIOMETRIC QUICK ACCESS
  // =========================================================================
  async function loadTeamMembers() {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && Array.isArray(data.members)) {
        renderSquadChips(data.members);
      }
    } catch (e) {
      console.warn('Squad member fetch error:', e);
    }
  }

  function renderSquadChips(members) {
    if (!memberPillsContainer) return;
    memberPillsContainer.innerHTML = members.map(m => `
      <button type="button" class="squad-chip" data-username="${m.username}">
        <img src="${m.avatar}" alt="${m.name}" class="squad-chip-avatar">
        <div class="d-flex flex-column" style="min-width: 0; line-height: 1.15;">
          <span class="squad-chip-name">${m.name}</span>
          <span class="squad-chip-role">${m.role === 'admin' ? '⭐ Admin' : m.title}</span>
        </div>
      </button>
    `).join('');

    memberPillsContainer.querySelectorAll('.squad-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        // Remove active class from others
        memberPillsContainer.querySelectorAll('.squad-chip').forEach(c => c.classList.remove('active-chip'));
        chip.classList.add('active-chip');

        const username = chip.getAttribute('data-username');
        identifierInput.value = username;
        passwordInput.value = 'callisto123';
        clearAlert();

        // Focus and animate
        passwordInput.classList.add('border-warning');
        setTimeout(() => passwordInput.classList.remove('border-warning'), 400);
      });
    });
  }

  loadTeamMembers();

  // =========================================================================
  // 5. LOGIN SUBMISSION
  // =========================================================================
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearAlert();

      const identifier = identifierInput.value.trim();
      const password = passwordInput.value;

      if (!identifier || !password) {
        showAlert('Operator identification and secret key required.');
        return;
      }

      loginBtn.disabled = true;
      loginBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span>Decrypting Credentials &amp; Handshaking...</span>
      `;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showAlert(`Access Granted. Welcome Operator ${result.user.name}! Redirecting to Orbit...`, 'success');

          if (rememberMeCheck && rememberMeCheck.checked) {
            localStorage.setItem('callisto_remembered_user', identifier);
          } else {
            localStorage.removeItem('callisto_remembered_user');
          }

          sessionStorage.setItem('callisto_active_user', JSON.stringify(result.user));

          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 700);
        } else {
          showAlert(result.message || 'Access Denied: Invalid credentials or unverified identity.');
          loginBtn.disabled = false;
          loginBtn.innerHTML = `
            <span>Authorize &amp; Launch Orbit</span>
            <i class="bi bi-arrow-right-circle-fill fs-5"></i>
          `;
          passwordInput.select();
        }
      } catch (err) {
        console.error('Login error:', err);
        showAlert('Security gateway unreachable. Verify Orbit server status.');
        loginBtn.disabled = false;
        loginBtn.innerHTML = `
          <span>Authorize &amp; Launch Orbit</span>
          <i class="bi bi-arrow-right-circle-fill fs-5"></i>
        `;
      }
    });
  }
});
