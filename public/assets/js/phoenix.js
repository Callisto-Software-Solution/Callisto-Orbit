/**
 * Callisto Phoenix Landing Page Engine (Clean Luxury Edition)
 * Features:
 * - High-speed luxury fire cursor aura follower (Zero clutter, silky smooth)
 * - Delicate rising fire embers & sparks
 * - 3D Parallax & Flight Breathing on Background Phoenix
 * - Web Audio API Ambient Soundscape
 */

document.addEventListener('DOMContentLoaded', () => {
  initEmberCanvas();
  initPhoenixParallax();
  initLuxuryCursorAura();
  initPhoenixSoundscape();

  // =========================================================================
  // 1. CLEAN & DELICATE FIRE EMBERS CANVAS ANIMATION
  // =========================================================================
  function initEmberCanvas() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let embers = [];
    const emberCount = window.innerWidth < 768 ? 40 : 90;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const colors = [
      '#ff4500', // Fiery Orange
      '#ff8c00', // Amber
      '#ffa200', // Gold
      '#ffd700', // Warm Spark
      '#ff2200'  // Crimson
    ];

    class Ember {
      constructor(customX, customY, isBurst = false) {
        this.isBurst = isBurst;
        this.reset(true, customX, customY);
      }

      reset(initial = false, customX, customY) {
        if (customX !== undefined && customY !== undefined) {
          this.x = customX + (Math.random() - 0.5) * 12;
          this.y = customY + (Math.random() - 0.5) * 12;
          this.speedY = Math.random() * 2.0 + 0.8;
          this.speedX = (Math.random() - 0.5) * 1.6;
          this.alpha = 0.9;
        } else {
          this.x = Math.random() * width;
          this.y = initial ? Math.random() * height : height + 10;
          this.speedY = Math.random() * 1.8 + 0.7;
          this.speedX = (Math.random() - 0.5) * 0.9;
          this.alpha = Math.random() * 0.7 + 0.25;
        }

        this.size = Math.random() * 2.6 + 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.fadeRate = Math.random() * 0.007 + 0.003;
        this.oscillation = Math.random() * 0.05 + 0.015;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        this.y -= this.speedY;
        this.angle += this.oscillation;
        this.x += Math.sin(this.angle) * 0.6 + this.speedX;
        this.alpha -= this.fadeRate;

        if (this.y < -15 || this.alpha <= 0) {
          if (this.isBurst) {
            const idx = embers.indexOf(this);
            if (idx > -1) embers.splice(idx, 1);
          } else {
            this.reset();
          }
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < emberCount; i++) {
      embers.push(new Ember());
    }

    // Gentle, delicate spark trail on mouse movement
    let lastSpawn = 0;
    window.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastSpawn > 60 && embers.length < emberCount + 25) {
        lastSpawn = now;
        embers.push(new Ember(e.clientX, e.clientY, true));
      }
    });

    // Soft click sparkle
    window.addEventListener('click', (e) => {
      for (let i = 0; i < 8; i++) {
        embers.push(new Ember(e.clientX, e.clientY, true));
      }
    });

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

  // =========================================================================
  // 2. 3D PARALLAX INTERACTION ON PHOENIX
  // =========================================================================
  function initPhoenixParallax() {
    const bgImg = document.querySelector('.phoenix-bg-animated-img');
    if (!bgImg) return;

    window.addEventListener('mousemove', (e) => {
      const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      const rotateY = deltaX * 12;
      const rotateX = -deltaY * 9;

      bgImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    window.addEventListener('mouseleave', () => {
      bgImg.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });

    // Mobile touch parallax
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const deltaX = (touch.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        const deltaY = (touch.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        bgImg.style.transform = `rotateX(${-deltaY * 7}deg) rotateY(${deltaX * 9}deg)`;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      bgImg.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });

    // Mobile device tilt (gyroscope)
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          const tiltX = Math.max(-14, Math.min(14, e.gamma * 0.35));
          const tiltY = Math.max(-10, Math.min(10, (e.beta - 40) * 0.25));
          bgImg.style.transform = `rotateX(${-tiltY}deg) rotateY(${tiltX}deg)`;
        }
      }, { passive: true });
    }
  }

  // =========================================================================
  // 3. SILKY MINIMALIST FIRE AURA FOLLOWER (Zero Clutter, Pure Elegance)
  // =========================================================================
  function initLuxuryCursorAura() {
    const aura = document.getElementById('cursorFireAura');
    if (!aura) return;

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

    // Elegant hover expansion on links and buttons
    const interactives = 'a, button, input, [role="button"], .glass-subcard, .btn';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => aura.classList.add('aura-hover'));
      el.addEventListener('mouseleave', () => aura.classList.remove('aura-hover'));
    });

    window.addEventListener('mousedown', () => aura.classList.add('aura-click'));
    window.addEventListener('mouseup', () => aura.classList.remove('aura-click'));

    // Smooth spring physics loop
    function updateAura() {
      currentX += (mouseX - currentX) * 0.28;
      currentY += (mouseY - currentY) * 0.28;

      const halfW = aura.offsetWidth / 2;
      const halfH = aura.offsetHeight / 2;
      aura.style.transform = `translate3d(${currentX - halfW}px, ${currentY - halfH}px, 0)`;

      requestAnimationFrame(updateAura);
    }
    requestAnimationFrame(updateAura);
  }

  // =========================================================================
  // 4. CINEMATIC AMBIENT AUDIO ENGINE
  // =========================================================================
  function initPhoenixSoundscape() {
    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let intervalCry = null;

    const toggleBtn = document.getElementById('toggleAudioBtn');
    const audioWaves = document.getElementById('audioWaves');
    const audioBtnText = document.getElementById('audioBtnText');

    function createAudioEngine() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      audioCtx = new AudioContext();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);

      // Pink noise flame wind
      const bufferSize = audioCtx.sampleRate * 2;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const ambientNoiseNode = audioCtx.createBufferSource();
      ambientNoiseNode.buffer = noiseBuffer;
      ambientNoiseNode.loop = true;

      const fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(280, audioCtx.currentTime);

      const fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(0.65, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.22, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(80, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(fireFilter.frequency);
      lfo.start();

      ambientNoiseNode.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      ambientNoiseNode.start();

      // D2 / A2 Harmonic drone
      const droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'triangle';
      droneOsc1.frequency.setValueAtTime(73.42, audioCtx.currentTime);

      const droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(110.00, audioCtx.currentTime);

      const droneFilter = audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(160, audioCtx.currentTime);

      const droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.18, audioCtx.currentTime);

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();

      // Periodic ethereal Phoenix call
      function triggerPhoenixCall() {
        if (!isPlaying || !audioCtx) return;
        try {
          const callOsc = audioCtx.createOscillator();
          const callGain = audioCtx.createGain();
          const callFilter = audioCtx.createBiquadFilter();

          callOsc.type = 'sine';
          const now = audioCtx.currentTime;
          callOsc.frequency.setValueAtTime(587.33, now);
          callOsc.frequency.exponentialRampToValueAtTime(880.00, now + 1.2);
          callOsc.frequency.exponentialRampToValueAtTime(440.00, now + 3.2);

          callFilter.type = 'bandpass';
          callFilter.frequency.setValueAtTime(750, now);
          callFilter.Q.setValueAtTime(4.0, now);

          callGain.gain.setValueAtTime(0.001, now);
          callGain.gain.linearRampToValueAtTime(0.12, now + 0.8);
          callGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          callOsc.connect(callFilter);
          callFilter.connect(callGain);
          callGain.connect(masterGain);

          callOsc.start(now);
          callOsc.stop(now + 4.0);
        } catch (e) {}
      }

      intervalCry = setInterval(triggerPhoenixCall, 14000);
      return true;
    }

    function startSound() {
      if (!audioCtx) createAudioEngine();
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (masterGain) masterGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 1.5);

      isPlaying = true;
      if (audioWaves) audioWaves.classList.add('audio-playing');
      if (audioBtnText) audioBtnText.textContent = 'SOUND: ON';
      if (toggleBtn) {
        toggleBtn.style.color = '#ff9d00';
        toggleBtn.style.borderColor = 'rgba(255, 85, 0, 0.5)';
      }
    }

    function stopSound() {
      if (masterGain && audioCtx) masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);

      isPlaying = false;
      if (audioWaves) audioWaves.classList.remove('audio-playing');
      if (audioBtnText) audioBtnText.textContent = 'SOUND: MUTED';
      if (toggleBtn) {
        toggleBtn.style.color = '#64748b';
        toggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    }

    try { startSound(); } catch (e) {}

    const startOnFirstGesture = () => {
      if (!isPlaying) startSound();
      window.removeEventListener('click', startOnFirstGesture);
      window.removeEventListener('keydown', startOnFirstGesture);
    };
    window.addEventListener('click', startOnFirstGesture, { once: true });
    window.addEventListener('keydown', startOnFirstGesture, { once: true });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) stopSound();
        else startSound();
      });
    }

    // Portal button click: Cinematic Portal Loading Animation Sequence
    const portalBtn = document.getElementById('btnLaunchOrbit');
    if (portalBtn) {
      let isLaunching = false;

      portalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLaunching) return;
        isLaunching = true;

        // Button feedback
        portalBtn.style.pointerEvents = 'none';
        portalBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          <span>LAUNCHING ORBIT...</span>
        `;

        const loader = document.getElementById('phoenixPortalLoader');
        const statusElem = document.getElementById('portalLoaderStatus');
        const progressBar = document.getElementById('portalProgressBar');

        // 1. Activate Portal Loader Overlay
        if (loader) {
          loader.classList.add('active');
        }

        // 2. Play Audio Charging SFX
        if (audioCtx) {
          try {
            if (audioCtx.state !== 'running') audioCtx.resume();
            const now = audioCtx.currentTime;

            // Power-up ascending warp tone
            const chargeOsc = audioCtx.createOscillator();
            const chargeGain = audioCtx.createGain();
            chargeOsc.type = 'sawtooth';
            chargeOsc.frequency.setValueAtTime(120, now);
            chargeOsc.frequency.exponentialRampToValueAtTime(750, now + 1.2);

            chargeGain.gain.setValueAtTime(0.25, now);
            chargeGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

            chargeOsc.connect(chargeGain);
            chargeGain.connect(masterGain || audioCtx.destination);
            chargeOsc.start(now);
            chargeOsc.stop(now + 1.4);
          } catch (err) {}
        }

        // 3. Multi-Step Cyber Security Loading Progression
        // Step 1: 0ms
        if (progressBar) progressBar.style.width = '25%';
        if (statusElem) statusElem.textContent = 'INITIALIZING ORBIT GATEWAY...';

        // Step 2: 450ms
        setTimeout(() => {
          if (progressBar) progressBar.style.width = '58%';
          if (statusElem) statusElem.textContent = 'SYNCHRONIZING ZERO-DB ENCRYPTED VAULT...';
        }, 450);

        // Step 3: 950ms
        setTimeout(() => {
          if (progressBar) progressBar.style.width = '88%';
          if (statusElem) statusElem.textContent = 'ESTABLISHING OPERATOR CLEARANCE MATRIX...';
        }, 950);

        // Step 4: 1400ms (Granted)
        setTimeout(() => {
          if (progressBar) progressBar.style.width = '100%';
          if (statusElem) {
            statusElem.style.color = '#00f076';
            statusElem.textContent = 'ACCESS GRANTED • ENTERING ORBIT...';
          }

          // Chime on success
          if (audioCtx) {
            try {
              const now = audioCtx.currentTime;
              const chime = audioCtx.createOscillator();
              const chimeGain = audioCtx.createGain();
              chime.type = 'sine';
              chime.frequency.setValueAtTime(587.33, now); // D5
              chime.frequency.setValueAtTime(880, now + 0.1); // A5
              chimeGain.gain.setValueAtTime(0.3, now);
              chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
              chime.connect(chimeGain);
              chimeGain.connect(masterGain || audioCtx.destination);
              chime.start(now);
              chime.stop(now + 0.35);
            } catch (err) {}
          }
        }, 1400);

        // Step 5: 1750ms -> Navigate to Login
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1750);
      });
    }
  }
});
