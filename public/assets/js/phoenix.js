/**
 * Callisto Phoenix Rising Animation & Ember Canvas (Supercharged)
 * Features:
 * - 140+ real-time fire embers, golden sparks & flame dust particles with velocity tails
 * - Interactive cursor fire spark generator on mouse move & click
 * - 3D Parallax tilt on Phoenix stage
 * - Dynamic lighting and flame shimmer
 */

document.addEventListener('DOMContentLoaded', () => {
  initEmberCanvas();
  initPhoenixParallax();

  // =========================================================================
  // 1. HIGH-DENSITY FIRE EMBERS & SPARKS CANVAS ANIMATION
  // =========================================================================
  function initEmberCanvas() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let embers = [];
    const emberCount = window.innerWidth < 768 ? 65 : 140;

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
      '#ffffff'  // White-hot core spark
    ];

    class Ember {
      constructor(customX, customY, isBurst = false) {
        this.isBurst = isBurst;
        this.reset(true, customX, customY);
      }

      reset(initial = false, customX, customY) {
        if (customX !== undefined && customY !== undefined) {
          this.x = customX + (Math.random() - 0.5) * 20;
          this.y = customY + (Math.random() - 0.5) * 20;
          this.speedY = (Math.random() * 2.5 + 1.2) * (this.isBurst ? 1.8 : 1);
          this.speedX = (Math.random() - 0.5) * (this.isBurst ? 3.5 : 1.5);
          this.alpha = 1;
        } else {
          this.x = Math.random() * width;
          this.y = initial ? Math.random() * height : height + 15;
          this.speedY = Math.random() * 2.2 + 0.8;
          this.speedX = (Math.random() - 0.5) * 1.2;
          this.alpha = Math.random() * 0.85 + 0.25;
        }

        this.size = Math.random() * 3.2 + 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.fadeRate = Math.random() * 0.008 + 0.003;
        this.oscillation = Math.random() * 0.06 + 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.tailLength = Math.random() * 8 + 4;
      }

      update() {
        this.y -= this.speedY;
        this.angle += this.oscillation;
        this.x += Math.sin(this.angle) * 0.8 + this.speedX;
        this.alpha -= this.fadeRate;

        if (this.y < -20 || this.alpha <= 0) {
          if (this.isBurst) {
            // Remove burst particle once dead
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

        // Draw spark with trailing tail for high-speed fire sensation
        if (this.speedY > 1.4) {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.speedX * 2, this.y + this.tailLength);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = this.size * 0.7;
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

    // Interactive mouse trail sparks
    let lastSpawn = 0;
    window.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastSpawn > 40 && embers.length < emberCount + 40) {
        lastSpawn = now;
        embers.push(new Ember(e.clientX, e.clientY, true));
        embers.push(new Ember(e.clientX, e.clientY, true));
      }
    });

    // Click fire burst
    window.addEventListener('click', (e) => {
      for (let i = 0; i < 12; i++) {
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
    const bgImg = document.querySelector('.phoenix-bg-animated-img') || document.querySelector('.phoenix-img-container');
    if (!bgImg) return;

    window.addEventListener('mousemove', (e) => {
      const deltaX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const deltaY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      const rotateY = deltaX * 12;  // Responsive 3D tilt
      const rotateX = -deltaY * 10;

      bgImg.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    window.addEventListener('mouseleave', () => {
      bgImg.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }
});

  // =========================================================================
  // 3. CINEMATIC WEB AUDIO API PHOENIX SOUNDSCAPE
  // =========================================================================
  initPhoenixSoundscape();

  function initPhoenixSoundscape() {
    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let ambientNoiseNode = null;
    let droneOsc1 = null;
    let droneOsc2 = null;
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

      // A. Fiery Wind & Crackle Ambient Generator (Pink/Brown noise filter)
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

      ambientNoiseNode = audioCtx.createBufferSource();
      ambientNoiseNode.buffer = noiseBuffer;
      ambientNoiseNode.loop = true;

      const fireFilter = audioCtx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(280, audioCtx.currentTime);

      const fireGain = audioCtx.createGain();
      fireGain.gain.setValueAtTime(0.65, audioCtx.currentTime);

      // Low frequency modulation for fire roar gust
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

      // B. Mystical Warm Drone (D2 & A2 Harmonic Chords)
      droneOsc1 = audioCtx.createOscillator();
      droneOsc1.type = 'triangle';
      droneOsc1.frequency.setValueAtTime(73.42, audioCtx.currentTime); // D2

      droneOsc2 = audioCtx.createOscillator();
      droneOsc2.type = 'sine';
      droneOsc2.frequency.setValueAtTime(110.00, audioCtx.currentTime); // A2

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

      // C. Periodic Ethereal Phoenix Chime / Call
      function triggerPhoenixCall() {
        if (!isPlaying || !audioCtx) return;
        try {
          const callOsc = audioCtx.createOscillator();
          const callGain = audioCtx.createGain();
          const callFilter = audioCtx.createBiquadFilter();

          callOsc.type = 'sine';
          const now = audioCtx.currentTime;
          callOsc.frequency.setValueAtTime(587.33, now); // D5
          callOsc.frequency.exponentialRampToValueAtTime(880.00, now + 1.2); // Bend up to A5
          callOsc.frequency.exponentialRampToValueAtTime(440.00, now + 3.2); // Glide down

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
      if (!audioCtx) {
        createAudioEngine();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (masterGain) {
        masterGain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 1.5);
      }
      isPlaying = true;
      if (audioWaves) audioWaves.classList.add('audio-playing');
      if (audioBtnText) audioBtnText.textContent = 'SOUND: ON';
      if (toggleBtn) {
        toggleBtn.style.color = '#ff9d00';
        toggleBtn.style.borderColor = 'rgba(255, 85, 0, 0.5)';
      }
    }

    function stopSound() {
      if (masterGain && audioCtx) {
        masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
      }
      isPlaying = false;
      if (audioWaves) audioWaves.classList.remove('audio-playing');
      if (audioBtnText) audioBtnText.textContent = 'SOUND: MUTED';
      if (toggleBtn) {
        toggleBtn.style.color = '#64748b';
        toggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    }

    // Try starting audio on page load
    try {
      startSound();
    } catch (e) {}

    // First user click starts audio if browser autoplay policy blocked it
    const startOnFirstGesture = () => {
      if (!isPlaying) {
        startSound();
      }
      window.removeEventListener('click', startOnFirstGesture);
      window.removeEventListener('keydown', startOnFirstGesture);
    };
    window.addEventListener('click', startOnFirstGesture, { once: true });
    window.addEventListener('keydown', startOnFirstGesture, { once: true });

    // Toggle button handler
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPlaying) {
          stopSound();
        } else {
          startSound();
        }
      });
    }

    // Enter Portal Click Fire Blast SFX
    const portalBtn = document.querySelector('.btn-phoenix-main');
    if (portalBtn) {
      portalBtn.addEventListener('click', (e) => {
        if (audioCtx && audioCtx.state === 'running') {
          const blastOsc = audioCtx.createOscillator();
          const blastGain = audioCtx.createGain();
          blastOsc.type = 'sawtooth';
          const now = audioCtx.currentTime;
          blastOsc.frequency.setValueAtTime(220, now);
          blastOsc.frequency.exponentialRampToValueAtTime(60, now + 0.4);
          blastGain.gain.setValueAtTime(0.3, now);
          blastGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          blastOsc.connect(blastGain);
          blastGain.connect(masterGain);
          blastOsc.start(now);
          blastOsc.stop(now + 0.4);
        }
      });
    }
  }
