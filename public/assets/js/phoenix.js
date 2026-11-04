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
