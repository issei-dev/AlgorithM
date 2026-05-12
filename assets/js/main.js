// File: assets/js/main.js

// ============================================
// Header Scroll Behavior
// ============================================
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 100) {
    header?.classList.add('is-hidden');
  } else {
    header?.classList.remove('is-hidden');
  }

  lastScroll = currentScroll;
});

// ============================================
// Mobile Menu Toggle
// ============================================
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuToggle?.addEventListener('click', () => {
  nav?.classList.toggle('is-open');
  menuToggle.textContent = nav?.classList.contains('is-open') ? '✕' : '☰';
});

// ============================================
// Fade-in on Scroll (Intersection Observer)
// ============================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach((el) => {
  observer.observe(el);
});

// ============================================
// Count-up Animation for Stats
// ============================================
const animateValue = (el, start, end, duration) => {
  const startTimestamp = performance.now();
  const step = (timestamp) => {
    const elapsed = timestamp - startTimestamp;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * easeOut);
    el.textContent = current + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateValue(el, 0, target, 1800);
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach((el) => {
  statObserver.observe(el);
});

// ============================================
// Hero Particle Canvas
// ============================================
const canvas = document.querySelector('.hero__canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.radius = Math.random() * 1.5 + 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = [];
    const count = Math.min(80, Math.floor(canvas.width / 20));
    for (let i = 0; i < count; i++) particles.push(new Particle());
  };

  const connectParticles = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    connectParticles();
    animationId = requestAnimationFrame(animate);
  };

  init();
  animate();
  window.addEventListener('resize', init);
}

// ============================================
// Easter Egg
// ============================================
console.log('%cHello, fellow developer.', 'font-size: 20px; color: #00E5FF; font-weight: bold;');
console.log('%cWe are hiring. → /careers.html', 'font-size: 14px; color: #7C3AED;');
