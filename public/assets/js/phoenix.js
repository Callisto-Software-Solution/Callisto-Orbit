/**
 * Callisto Phoenix NEXT-LEVEL Cinematic Animation Engine
 * Features:
 * - Fluid Molten Plasma Comet Ribbon Tail trailing the cursor
 * - High-Energy Phoenix Sonic Shockwaves on Click & Rapid Movement
 * - Cyber Circuit Electric Arc Lightning
 * - Real-Time Aerodynamic Web Audio API Sound (Wind modulates with hand speed)
 * - 3D Parallax & Reactive Solar Flare on Background Phoenix
 * - 150+ High-Density Fire Embers & Velocity Sparks
 */

document.addEventListener('DOMContentLoaded', () => {
  let globalMouseSpeed = 0;
  let updateAudioSpeed = null;

  initEmberCanvas();
  initPhoenixParallax();
  initAnimatedPhoenixCursor();
  initPhoenixSoundscape();

  // =========================================================================
  // 1. ADVANCED PARTICLE, SHOCKWAVE & COMET RIBBON CANVAS
  // =========================================================================
  function initEmberCanvas() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let embers = [];
    let shockwaves = [];
    let electricArcs = [];
    let ribbonTrail = [];
    const maxTrailLength = 26;
    const emberCount = window.innerWidth < 768 ? 70 : 150;

    let cursorX = null;
    let cursorY = null;
    let lastX = null;
    let lastY = null;
    let rayAngle = 0;
    let burstRays = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const colors = [
      '#ff3b00', // Intense Orange Red
      '#ff7700', // Vivid Amber
      '#ffa200', // Gold Fire
      '#ffd000', // Bright Golden Spark
      '#ff1a1a', // Crimson Flame
      '#ffffff'  // White-hot core
    ];

    class Ember {
      constructor(customX, customY, isBurst = false) {
        this.isBurst = isBurst;
        this.reset(true, customX, customY);
      }

      reset(initial = false, customX, customY) {
        if (customX !== undefined && customY !== undefined) {
          this.x = customX + (Math.random() - 0.5) * 16;
          this.y = customY + (Math.random() - 0.5) * 16;
          this.speedY = (Math.random() * 2.8 + 1.2) * (this.isBurst ? 1.9 : 1);
          this.speedX = (Math.random() - 0.5) * (this.isBurst ? 3.8 : 1.6);
          this.alpha = 1;
        } else {
          this.x = Math.random() * width;
          this.y = initial ? Math.random() * height : height + 15;
          this.speedY = Math.random() * 2.4 + 0.8;
          this.speedX = (Math.random() - 0.5) * 1.3;
          this.alpha = Math.random() * 0.85 + 0.25;
        }

        this.size = Math.random() * 3.4 + 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.fadeRate = Math.random() * 0.008 + 0.003;
        this.oscillation = Math.random() * 0.06 + 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.tailLength = Math.random() * 9 + 4;
      }

      update() {
        this.y -= this.speedY;
        this.angle += this.oscillation;
        this.x += Math.sin(this.angle) * 0.8 + this.speedX;
        this.alpha -= this.fadeRate;

        if (this.y < -25 || this.alpha <= 0) {
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

        if (this.speedY > 1.3) {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.speedX * 2.2, this.y + this.tailLength);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size * 0.75;
          ctx.lineCap = 'round';
          ctx.shadowBlur = this.size * 5;
          ctx.shadowColor = this.color;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = this.size * 6;
          ctx.shadowColor = this.color;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < emberCount; i++) {
      embers.push(new Ember());
    }

    // Trigger Sonic Shockwave function
    function createShockwave(x, y) {
      shockwaves.push({
        x,
        y,
        radius: 8,
        maxRadius: Math.min(width, height) * 0.35,
        alpha: 1.0,
        speed: 14
      });

      // Displace embers outward
      embers.forEach(e => {
        const dx = e.x - x;
        const dy = e.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          e.x += (dx / dist) * 25;
          e.y += (dy / dist) * 25;
        }
      });
    }

    // Trigger Cyber Circuit Lightning Arcs
    function createElectricArc(startX, startY) {
      const branches = [];
      let curX = startX;
      let curY = startY;
      const steps = Math.floor(Math.random() * 6 + 5);

      for (let i = 0; i < steps; i++) {
        const nextX = curX + (Math.random() - 0.5) * 60;
        const nextY = curY + (Math.random() - 0.5) * 60;
        branches.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
        curX = nextX;
        curY = nextY;
      }

      electricArcs.push({
        branches,
        alpha: 1.0,
        color: Math.random() > 0.5 ? '#00f0ff' : '#ffaa00'
      });
    }

    // Mouse listener with Speed calculation & Comet ribbon
    let lastMoveTime = Date.now();
    window.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;

      const now = Date.now();
      const dt = Math.max(1, now - lastMoveTime);
      lastMoveTime = now;

      if (lastX !== null && lastY !== null) {
        const dist = Math.hypot(cursorX - lastX, cursorY - lastY);
        globalMouseSpeed = dist / dt; // pixels per millisecond

        if (updateAudioSpeed) {
          updateAudioSpeed(globalMouseSpeed);
        }

        // Fast flick triggers high-energy shockwave
        if (globalMouseSpeed > 2.8 && shockwaves.length < 3) {
          createShockwave(cursorX, cursorY);
        }

        // Occasional lightning arc on movement
        if (Math.random() < 0.12 && electricArcs.length < 4) {
          createElectricArc(cursorX, cursorY);
        }
      }

      lastX = cursorX;
      lastY = cursorY;

      // Add point to Molten Comet Ribbon Trail
      ribbonTrail.unshift({ x: cursorX, y: cursorY, time: now });
      if (ribbonTrail.length > maxTrailLength) {
        ribbonTrail.pop();
      }

      // Add trailing embers
      if (Math.random() < 0.8 && embers.length < emberCount + 50) {
        embers.push(new Ember(cursorX, cursorY, true));
      }
    });

    window.addEventListener('mouseleave', () => {
      cursorX = null;
      cursorY = null;
      lastX = null;
      lastY = null;
      ribbonTrail = [];
    });

    // Click triggers massive Phoenix Sonic Shockwave & Fire Blast
    window.addEventListener('click', (e) => {
      burstRays = 1.2;
      createShockwave(e.clientX, e.clientY);
      createElectricArc(e.clientX, e.clientY);

      for (let i = 0; i < 22; i++) {
        embers.push(new Ember(e.clientX, e.clientY, true));
      }
    });

    // Animation Loop
    function animate() {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Embers
      for (let i = 0; i < embers.length; i++) {
        embers[i].update();
        embers[i].draw();
      }

      // 2. Draw Dynamic Expanding Phoenix Sonic Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha -= 0.024;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 120, 0, ${sw.alpha * 0.85})`;
        ctx.lineWidth = 3.5 * sw.alpha;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff5500';
        ctx.stroke();

        // Inner chromatic ring
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, Math.max(0, sw.radius - 8), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${sw.alpha * 0.6})`;
        ctx.lineWidth = 1.8 * sw.alpha;
        ctx.stroke();

        ctx.restore();
      }

      // 3. Draw Cyber Circuit Electric Lightning Arcs
      for (let i = electricArcs.length - 1; i >= 0; i--) {
        const arc = electricArcs[i];
        arc.alpha -= 0.06;

        if (arc.alpha <= 0) {
          electricArcs.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, arc.alpha);
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = arc.color;
        ctx.beginPath();

        arc.branches.forEach((b, idx) => {
          if (idx === 0) ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(b.x2, b.y2);
        });

        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Molten Plasma Comet Ribbon Tail behind Cursor
      if (ribbonTrail.length > 2) {
        ctx.save();
        for (let i = 0; i < ribbonTrail.length - 1; i++) {
          const p1 = ribbonTrail[i];
          const p2 = ribbonTrail[i + 1];
          const progress = i / ribbonTrail.length; // 0 (near cursor) to 1 (tail tip)
          const ribbonWidth = (1 - progress) * 14;
          const alpha = (1 - progress) * 0.85;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          // Molten gradient from white-hot to flame red
          let col = '#ffffff';
          if (progress > 0.15) col = '#ffd700';
          if (progress > 0.45) col = '#ff5500';
          if (progress > 0.75) col = '#d61818';

          ctx.strokeStyle = col;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = Math.max(1, ribbonWidth);
          ctx.lineCap = 'round';
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#ff6600';
          ctx.stroke();
        }
        ctx.restore();
      }

      // 5. Draw 360-Degree Radiant Solar Rays Around Cursor
      if (cursorX !== null && cursorY !== null) {
        rayAngle += 0.024;
        if (burstRays > 0) burstRays *= 0.92;

        ctx.save();
        ctx.translate(cursorX, cursorY);

        // Outer Rotating Flame Rays
        ctx.rotate(rayAngle);
        const rayCount = 14;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i * Math.PI * 2) / rayCount;
          const rayLen = 45 + Math.sin(rayAngle * 3.5 + i) * 18 + burstRays * 55;
          const ex = Math.cos(angle) * rayLen;
          const ey = Math.sin(angle) * rayLen;

          const rayGrad = ctx.createLinearGradient(0, 0, ex, ey);
          rayGrad.addColorStop(0, 'rgba(255, 255, 210, 0.95)');
          rayGrad.addColorStop(0.3, 'rgba(255, 150, 0, 0.7)');
          rayGrad.addColorStop(0.7, 'rgba(255, 60, 0, 0.35)');
          rayGrad.addColorStop(1, 'rgba(230, 20, 0, 0)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(ex, ey);
          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = (i % 2 === 0) ? 3.5 : 2.0;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#ff6600';
          ctx.stroke();
        }

        // Inner Counter-Rotating Starburst
        ctx.rotate(-rayAngle * 2.3);
        const innerCount = 8;
        for (let j = 0; j < innerCount; j++) {
          const angle2 = (j * Math.PI * 2) / innerCount;
          const len2 = 30 + Math.cos(rayAngle * 4.5 + j) * 10 + burstRays * 30;
          const rx = Math.cos(angle2) * len2;
          const ry = Math.sin(angle2) * len2;

          const innerGrad = ctx.createLinearGradient(0, 0, rx, ry);
          innerGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          innerGrad.addColorStop(0.45, 'rgba(255, 210, 50, 0.85)');
          innerGrad.addColorStop(1, 'rgba(255, 80, 0, 0)');

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = innerGrad;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Central Fire Corona Core
        const haloGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 34 + burstRays * 25);
        haloGrad.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
        haloGrad.addColorStop(0.3, 'rgba(255, 150, 0, 0.65)');
        haloGrad.addColorStop(0.7, 'rgba(230, 40, 20, 0.3)');
        haloGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(0, 0, 34 + burstRays * 25, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad;
        ctx.fill();

        ctx.restore();
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // 2. 3D PARALLAX & DYNAMIC REACTIVE LIGHTING ON PHOENIX
  // =========================================================================
  function initPhoenixParallax() {
    const bgImg = document.querySelector('.phoenix-bg-animated-img');
    if (!bgImg) return;

    window.addEventListener('mousemove', (e) => {
      const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      const rotateY = deltaX * 14;
      const rotateX = -deltaY * 11;
      const speedGlow = Math.min(1.2, 1 + globalMouseSpeed * 0.2);

      bgImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${speedGlow})`;
    });

    window.addEventListener('mouseleave', () => {
      bgImg.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  // =========================================================================
  // 3. LIVING FLAPPING PHOENIX CURSOR FOLLOWER
  // =========================================================================
  function initAnimatedPhoenixCursor() {
    const cursorEl = document.getElementById('animatedPhoenixCursor');
    if (!cursorEl) return;

    let targetX = -100, targetY = -100;
    let currentX = -100, currentY = -100;
    let prevX = -100;
    let tilt = 0;

    window.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorEl.style.opacity = '1';

      // Flight banking when moving fast left or right
      const vx = targetX - prevX;
      prevX = targetX;
      tilt = Math.max(-28, Math.min(28, vx * 1.8));
    });

    document.addEventListener('mouseleave', () => {
      cursorEl.style.opacity = '0';
    });

    // Hover acceleration & click burst
    const interactives = 'a, button, input, [role="button"], .glass-subcard, .btn';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => cursorEl.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => cursorEl.classList.remove('cursor-hover'));
    });

    window.addEventListener('mousedown', () => cursorEl.classList.add('cursor-click'));
    window.addEventListener('mouseup', () => cursorEl.classList.remove('cursor-click'));

    // Smooth tracking loop
    function updateCursor() {
      currentX += (targetX - currentX) * 0.48;
      currentY += (targetY - currentY) * 0.48;
      tilt *= 0.88;

      cursorEl.style.transform = `translate3d(${currentX - 20}px, ${currentY - 2}px, 0) rotate(${tilt}deg)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  // =========================================================================
  // 4. AERODYNAMIC SOUND ENGINE (SOUND RESPONDS TO MOVEMENT SPEED)
  // =========================================================================
  function initPhoenixSoundscape() {
    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let fireFilter = null;
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

      fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(280, audioCtx.currentTime);

      const fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(0.65, audioCtx.currentTime);

      const lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.25, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(90, audioCtx.currentTime);
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
      droneGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();

      // Hook aerodynamic speed to filter frequency
      updateAudioSpeed = (speed) => {
        if (!fireFilter || !audioCtx) return;
        const targetFreq = 260 + Math.min(650, speed * 220);
        fireFilter.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.08);
      };

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
