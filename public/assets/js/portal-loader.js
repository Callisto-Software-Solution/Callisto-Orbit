/**
 * Callisto-Orbit Universal Portal Transition Engine
 * Displays the high-tech Cyber-Fire Portal Loading Animation across all page redirects
 */

(function () {
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    return audioCtx;
  }

  // Ensure Portal Loader Markup exists in DOM
  function ensureLoaderDOM() {
    let loader = document.getElementById('phoenixPortalLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'phoenixPortalLoader';
      loader.className = 'portal-loader-overlay';
      loader.setAttribute('aria-hidden', 'true');
      loader.innerHTML = `
        <div class="portal-loader-card">
          <!-- Rotating Fire Energy Rings -->
          <div class="portal-ring-stage">
            <div class="portal-ring ring-outer"></div>
            <div class="portal-ring ring-middle"></div>
            <div class="portal-ring ring-inner"></div>
            <div class="portal-core-bird">
              <img src="/assets/images/callisto-logo.jpg" alt="Callisto Core">
            </div>
          </div>

          <!-- Cyber Brand & Status -->
          <div class="portal-loader-brand">
            CALLISTO<span style="color: var(--callisto-orange);">-ORBIT</span>
          </div>

          <div class="portal-status-ticker" id="portalLoaderStatus">
            INITIALIZING GATEWAY...
          </div>

          <!-- Glowing Progress Bar -->
          <div class="portal-progress-track">
            <div class="portal-progress-bar" id="portalProgressBar"></div>
          </div>

          <!-- Security Subtext -->
          <div class="portal-loader-sub">
            <i class="bi bi-shield-check text-success me-1"></i>
            <span>ZERO-DB ENCRYPTION &bull; SHA-256 VAULT</span>
          </div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    return loader;
  }

  // Play High-Tech Warp & Chime Audio Synthesis
  function playWarpSound(isFast = false) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state !== 'running') ctx.resume();

      const now = ctx.currentTime;
      const duration = isFast ? 0.6 : 0.9;

      // Charge Oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + duration * 0.75);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // Chime Tone
      setTimeout(() => {
        try {
          const chimeCtx = getAudioContext();
          if (!chimeCtx) return;
          const chimeNow = chimeCtx.currentTime;
          const chime = chimeCtx.createOscillator();
          const chimeGain = chimeCtx.createGain();
          chime.type = 'sine';
          chime.frequency.setValueAtTime(659.25, chimeNow); // E5
          chime.frequency.setValueAtTime(987.77, chimeNow + 0.08); // B5
          chimeGain.gain.setValueAtTime(0.25, chimeNow);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, chimeNow + 0.3);
          chime.connect(chimeGain);
          chimeGain.connect(chimeCtx.destination);
          chime.start(chimeNow);
          chime.stop(chimeNow + 0.3);
        } catch (e) {}
      }, isFast ? 420 : 650);
    } catch (err) {}
  }

  /**
   * Main Universal Transition Trigger
   * @param {string} targetUrl The destination URL
   * @param {string} customStatus Custom status text to display
   * @param {number} delay Total animation duration before navigation
   */
  window.triggerOrbitTransition = function (targetUrl, customStatus = 'INITIALIZING GATEWAY...', delay = 900) {
    const loader = ensureLoaderDOM();
    const statusElem = document.getElementById('portalLoaderStatus');
    const progressBar = document.getElementById('portalProgressBar');

    if (!loader) {
      window.location.href = targetUrl;
      return;
    }

    loader.classList.add('active');
    playWarpSound(delay < 1000);

    // Initial state
    if (progressBar) progressBar.style.width = '20%';
    if (statusElem) {
      statusElem.style.color = '#ff9d00';
      statusElem.textContent = customStatus;
    }

    // Step 2 (Midway)
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '65%';
    }, delay * 0.4);

    // Step 3 (Complete)
    setTimeout(() => {
      if (progressBar) progressBar.style.width = '100%';
      if (statusElem) {
        statusElem.style.color = '#00f076';
        statusElem.textContent = 'ACCESS GRANTED • CONNECTING...';
      }
    }, delay * 0.75);

    // Step 4 (Navigate)
    setTimeout(() => {
      window.location.href = targetUrl;
    }, delay);
  };

  // =========================================================================
  // TACTILE CYBER AUDIO ENGINE: MOUSE CLICKS & TYPING KEYSTROKES
  // =========================================================================

  /**
   * Play crisp sci-fi mechanical click sound on mouse/pointer down
   * @param {boolean} isInteractive Whether clicking on a button, link, or input
   */
  function playCyberClick(isInteractive = false) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state !== 'running') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Triangle for punchy mechanical click, Sine for soft ambient glass tap
      osc.type = isInteractive ? 'triangle' : 'sine';
      const startFreq = isInteractive ? 1480 : 1050;
      const endFreq = isInteractive ? 340 : 420;
      const duration = isInteractive ? 0.038 : 0.026;
      const volume = isInteractive ? 0.12 : 0.045;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.005);
    } catch (e) {}
  }

  /**
   * Play organic cyber mechanical switch keystroke sound when typing
   * @param {string} key The keyboard key pressed
   */
  function playCyberKey(key) {
    // Ignore lone modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state !== 'running') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch variation per key to feel organic & mechanical
      let baseFreq = 1620 + (Math.random() * 240 - 120);
      let duration = 0.032;
      let volume = 0.075;

      if (key === 'Enter') {
        baseFreq = 860;
        duration = 0.065;
        volume = 0.15;
      } else if (key === 'Backspace' || key === 'Delete') {
        baseFreq = 1120;
        duration = 0.042;
        volume = 0.09;
      } else if (key === ' ') {
        baseFreq = 1380;
        duration = 0.045;
        volume = 0.085;
      }

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.42, now + duration);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.005);
    } catch (e) {}
  }

  // Bind Universal Global Mouse Click & Typing Audio Listeners
  window.addEventListener('pointerdown', (e) => {
    // Determine if target is interactive (button, input, link, pill, etc.)
    const isInteractive = Boolean(
      e.target.closest('a, button, input, textarea, select, [role="button"], .btn, .glass-subcard, .quick-nic-pill, .member-card')
    );
    playCyberClick(isInteractive);
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    playCyberKey(e.key);
  }, { passive: true });

  // Auto-hook internal navigation links on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    ensureLoaderDOM();

    document.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore anchor jumps (#), javascript:, external links, or downloads
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('http') && !href.includes(window.location.host)) return;

      // Determine if it's an internal page link
      const isInternalPage = href === '/' || href.includes('.html') || href.startsWith('/api') === false;

      if (isInternalPage) {
        link.addEventListener('click', (e) => {
          // If middle click or ctrl/cmd click (new tab), allow default
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

          e.preventDefault();

          let msg = 'SYNCHRONIZING ORBIT GATEWAY...';
          let duration = 900;

          if (href === '/' || href === '/index.html') {
            msg = 'RETURNING TO PHOENIX SANCTUARY...';
          } else if (href.includes('login.html')) {
            msg = 'LAUNCHING SECURITY CLEARANCE...';
            // Landing page button gets the grand 1.5s sequence
            if (link.id === 'btnLaunchOrbit') {
              duration = 1450;
              msg = 'INITIALIZING ORBIT GATEWAY...';
            }
          } else if (href.includes('dashboard.html')) {
            msg = 'ACCESSING ORBIT TREASURY DASHBOARD...';
          }

          window.triggerOrbitTransition(href, msg, duration);
        });
      }
    });
  });
})();

