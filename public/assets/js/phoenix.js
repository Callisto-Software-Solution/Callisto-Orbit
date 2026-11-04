/**
 * Callisto Phoenix Rising Animation & Ember Canvas
 * Features:
 * - Real-time fire embers, golden sparks & flame dust particles
 * - 3D Parallax tilt on Phoenix stage
 * - Smooth scroll & dynamic metrics
 */

document.addEventListener('DOMContentLoaded', () => {
  initEmberCanvas();
  initPhoenixParallax();

  // =========================================================================
  // 1. FIRE EMBERS & SPARKS CANVAS ANIMATION
  // =========================================================================
  function initEmberCanvas() {
    const canvas = document.getElementById('emberCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let embers = [];
    const emberCount = window.innerWidth < 768 ? 40 : 85;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const colors = [
      '#ff4500', // Orange Red
      '#ff8c00', // Dark Orange
      '#ffa500', // Orange
      '#ffd700', // Gold
      '#ff2200'  // Fiery Crimson
    ];

    class Ember {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.8 + 0.8;
        this.speedY = Math.random() * 1.5 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.8 + 0.2;
        this.fadeRate = Math.random() * 0.006 + 0.002;
        this.oscillation = Math.random() * 0.05 + 0.01;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        this.y -= this.speedY;
        this.angle += this.oscillation;
        this.x += Math.sin(this.angle) * 0.6 + this.speedX;
        this.alpha -= this.fadeRate;

        if (this.y < -10 || this.alpha <= 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < emberCount; i++) {
      embers.push(new Ember());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      embers.forEach(ember => {
        ember.update();
        ember.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  // =========================================================================
  // 2. 3D PARALLAX INTERACTION ON PHOENIX
  // =========================================================================
  function initPhoenixParallax() {
    const stage = document.querySelector('.phoenix-stage-wrap');
    const container = document.querySelector('.phoenix-img-container');
    if (!stage || !container) return;

    window.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      const rotateY = deltaX * 14;  // Max 14 deg
      const rotateX = -deltaY * 12; // Max 12 deg

      container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    window.addEventListener('mouseleave', () => {
      container.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          targetElem.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});

