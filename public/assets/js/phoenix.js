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
  // 4. CINEMATIC AMBIENT AUDIO ENGINE (IMMEDIATE ON-LOAD AUTOPLAY)
  // =========================================================================
  function initPhoenixSoundscape() {
    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let intervalCry = null;
    let hasPlayedInitialCry = false;

    const toggleBtn = document.getElementById('toggleAudioBtn');
    const audioWaves = document.getElementById('audioWaves');
    const audioBtnText = document.getElementById('audioBtnText');

    function createAudioEngine() {
      if (audioCtx) return true;
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
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
      }

      const ambientNoiseNode = audioCtx.createBufferSource();
      ambientNoiseNode.buffer = noiseBuffer;
      ambientNoiseNode.loop = true;

      const fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(320, audioCtx.currentTime);

      const fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.24, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(95, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(fireFilter.frequency);
      lfo.start();

      ambientNoiseNode.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(masterGain);
      ambientNoiseNode.start();

      // Deep harmonic foundation drone
      const droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'triangle';
      droneOsc1.frequency.setValueAtTime(73.42, audioCtx.currentTime);

      const droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(110.00, audioCtx.currentTime);

      const droneFilter = audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(180, audioCtx.currentTime);

      const droneGain = audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.22, audioCtx.currentTime);

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();

      if (intervalCry) clearInterval(intervalCry);
      intervalCry = setInterval(() => {
        if (isPlaying && audioCtx && audioCtx.state === 'running') {
          triggerPhoenixCall(false);
        }
      }, 12000);

      return true;
    }

    // Fiery Phoenix Cry & Wing Flap Whoosh Effect
    function triggerPhoenixCall(isInitial = false) {
      if (!audioCtx || audioCtx.state !== 'running') return;
      try {
        const now = audioCtx.currentTime;

        // 1. Fiery Wing-Flap Flame Whoosh (Filtered Noise Burst)
        const whooshBuffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 1.6), audioCtx.sampleRate);
        const whooshData = whooshBuffer.getChannelData(0);
        for (let i = 0; i < whooshData.length; i++) {
          whooshData[i] = (Math.random() * 2 - 1) * 0.75;
        }
        const whooshSource = audioCtx.createBufferSource();
        whooshSource.buffer = whooshBuffer;

        const whooshFilter = audioCtx.createBiquadFilter();
        whooshFilter.type = 'bandpass';
        whooshFilter.Q.setValueAtTime(2.2, now);
        whooshFilter.frequency.setValueAtTime(240, now);
        whooshFilter.frequency.exponentialRampToValueAtTime(1750, now + 0.45);
        whooshFilter.frequency.exponentialRampToValueAtTime(320, now + 1.5);

        const whooshGain = audioCtx.createGain();
        whooshGain.gain.setValueAtTime(0.001, now);
        whooshGain.gain.linearRampToValueAtTime(isInitial ? 0.38 : 0.25, now + 0.4);
        whooshGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

        whooshSource.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(masterGain);
        whooshSource.start(now);
        whooshSource.stop(now + 1.6);

        // 2. Majestic Soaring Phoenix Call (Harmonic Sawtooth + Sine)
        const cryOsc1 = audioCtx.createOscillator();
        const cryOsc2 = audioCtx.createOscillator();
        const cryFilter = audioCtx.createBiquadFilter();
        const cryGain = audioCtx.createGain();

        // Subtle flight vibrato
        const vibrato = audioCtx.createOscillator();
        const vibratoGain = audioCtx.createGain();
        vibrato.frequency.setValueAtTime(5.8, now);
        vibratoGain.gain.setValueAtTime(22, now);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(cryOsc1.frequency);
        vibratoGain.connect(cryOsc2.frequency);
        vibrato.start(now);
        vibrato.stop(now + 3.2);

        cryOsc1.type = 'sawtooth';
        cryOsc2.type = 'sine';

        const startFreq = isInitial ? 520 : 560;
        const peakFreq = isInitial ? 1120 : 1020;
        const endFreq = 440;

        cryOsc1.frequency.setValueAtTime(startFreq, now + 0.08);
        cryOsc1.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.85);
        cryOsc1.frequency.exponentialRampToValueAtTime(endFreq, now + 2.7);

        cryOsc2.frequency.setValueAtTime(startFreq * 1.5, now + 0.08);
        cryOsc2.frequency.exponentialRampToValueAtTime(peakFreq * 1.5, now + 0.85);
        cryOsc2.frequency.exponentialRampToValueAtTime(endFreq * 1.5, now + 2.7);

        cryFilter.type = 'bandpass';
        cryFilter.frequency.setValueAtTime(750, now);
        cryFilter.frequency.exponentialRampToValueAtTime(1450, now + 0.85);
        cryFilter.frequency.exponentialRampToValueAtTime(650, now + 2.7);
        cryFilter.Q.setValueAtTime(3.6, now);

        cryGain.gain.setValueAtTime(0.001, now);
        cryGain.gain.linearRampToValueAtTime(isInitial ? 0.32 : 0.22, now + 0.55);
        cryGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);

        cryOsc1.connect(cryFilter);
        cryOsc2.connect(cryFilter);
        cryFilter.connect(cryGain);
        cryGain.connect(masterGain);

        cryOsc1.start(now + 0.08);
        cryOsc2.start(now + 0.08);
        cryOsc1.stop(now + 3.0);
        cryOsc2.stop(now + 3.0);

      } catch (e) {
        console.warn('Phoenix audio playback error:', e);
      }
    }

    function playInitialCryOnce() {
      if (!hasPlayedInitialCry && audioCtx && audioCtx.state === 'running') {
        hasPlayedInitialCry = true;
        setTimeout(() => {
          triggerPhoenixCall(true);
        }, 150);
      }
    }

    function startSound() {
      if (!audioCtx) createAudioEngine();
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
          if (audioCtx.state === 'running') playInitialCryOnce();
        }).catch(() => {});
      } else if (audioCtx.state === 'running') {
        playInitialCryOnce();
      }

      if (masterGain) {
        masterGain.gain.linearRampToValueAtTime(0.75, audioCtx.currentTime + 0.8);
      }

      isPlaying = true;
      if (audioWaves) audioWaves.classList.add('audio-playing');
      if (audioBtnText) audioBtnText.textContent = 'PHOENIX SOUND ON';
      if (toggleBtn) {
        toggleBtn.style.color = '#ff9d00';
        toggleBtn.style.borderColor = 'rgba(255, 85, 0, 0.5)';
      }
    }

    function stopSound() {
      if (masterGain && audioCtx) {
        masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      }

      isPlaying = false;
      if (audioWaves) audioWaves.classList.remove('audio-playing');
      if (audioBtnText) audioBtnText.textContent = 'SOUND: MUTED';
      if (toggleBtn) {
        toggleBtn.style.color = '#64748b';
        toggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    }

    // 1. Attempt immediate playback on script load
    try {
      startSound();
    } catch (e) {}

    // 2. Also attempt on window 'load'
    window.addEventListener('load', () => {
      try { startSound(); } catch (e) {}
    }, { once: true });

    // 3. Ultra-responsive wake-up: Browser policy allows audio on the earliest user interaction.
    // The instant the mouse moves even 1px across the window or anything touches the page, wake audio immediately!
    const wakeEvents = ['pointermove', 'mousemove', 'pointerdown', 'touchstart', 'mousedown', 'keydown', 'wheel', 'focus'];
    const wakeAudioOnFirstTouch = () => {
      if (!audioCtx || audioCtx.state !== 'running') {
        startSound();
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => {
            playInitialCryOnce();
          }).catch(() => {});
        }
      } else if (!hasPlayedInitialCry) {
        playInitialCryOnce();
      }

      if (audioCtx && audioCtx.state === 'running' && hasPlayedInitialCry) {
        wakeEvents.forEach(evt => window.removeEventListener(evt, wakeAudioOnFirstTouch));
      }
    };

    wakeEvents.forEach(evt => {
      window.addEventListener(evt, wakeAudioOnFirstTouch, { passive: true });
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying && masterGain && masterGain.gain.value > 0.05) {
          stopSound();
        } else {
          startSound();
          triggerPhoenixCall(false);
        }
      });
    }

    // Portal button click fire blast
    const portalBtn = document.querySelector('.btn-phoenix-main');
    if (portalBtn) {
      portalBtn.addEventListener('click', () => {
        if (audioCtx && audioCtx.state === 'running') {
          const blastOsc = audioCtx.createOscillator();
          const blastGain = audioCtx.createGain();
          blastOsc.type = 'sawtooth';
          const now = audioCtx.currentTime;
          blastOsc.frequency.setValueAtTime(240, now);
          blastOsc.frequency.exponentialRampToValueAtTime(55, now + 0.45);
          blastGain.gain.setValueAtTime(0.35, now);
          blastGain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
          blastOsc.connect(blastGain);
          blastGain.connect(masterGain);
          blastOsc.start(now);
          blastOsc.stop(now + 0.45);
        }
      });
    }
  }
});
