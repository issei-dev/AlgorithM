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
// File: assets/js/main.js （末尾に追記）

// ============================================
// Lightbox Gallery
// ============================================
(() => {
  const galleryItems = document.querySelectorAll('.gallery__item');
  if (galleryItems.length === 0) return;

  // ライトボックスHTMLを動的に生成
  const lightboxHTML = `
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="lightbox__counter">
        <span id="lightbox-current">1</span> / <span id="lightbox-total">1</span>
      </div>
      <button class="lightbox__close" id="lightbox-close" aria-label="閉じる">✕</button>
      <button class="lightbox__prev" id="lightbox-prev" aria-label="前の画像">‹</button>
      <button class="lightbox__next" id="lightbox-next" aria-label="次の画像">›</button>
      <div class="lightbox__container">
        <img class="lightbox__image" id="lightbox-image" src="" alt="">
        <p class="lightbox__caption" id="lightbox-caption"></p>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', lightboxHTML);

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCurrent = document.getElementById('lightbox-current');
  const lightboxTotal = document.getElementById('lightbox-total');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  // 画像情報を配列化（画像が存在するもののみ）
  const images = [];
  galleryItems.forEach((item) => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery__caption');
    if (img && img.src && !img.src.includes('placeholder')) {
      images.push({
        src: img.src,
        alt: img.alt || '',
        caption: caption ? caption.textContent.trim() : ''
      });
    }
  });

  lightboxTotal.textContent = images.length;
  let currentIndex = 0;

  const openLightbox = (index) => {
    if (images.length === 0) return;
    currentIndex = index;
    updateImage();
    lightbox.classList.add('is-active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  };

  const updateImage = () => {
    const current = images[currentIndex];
    lightboxImage.style.opacity = '0';
    setTimeout(() => {
      lightboxImage.src = current.src;
      lightboxImage.alt = current.alt;
      lightboxCaption.textContent = current.caption;
      lightboxCurrent.textContent = currentIndex + 1;
      lightboxImage.style.opacity = '1';
    }, 200);
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  };

  // ギャラリー画像クリックでオープン
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    if (img && img.src && !img.src.includes('placeholder')) {
      const imageIndex = images.findIndex(i => i.src === img.src);
      if (imageIndex !== -1) {
        item.style.cursor = 'zoom-in';
        item.addEventListener('click', () => openLightbox(imageIndex));
      }
    }
  });

  // クローズ・ナビゲーション
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // 背景クリックでクローズ
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // キーボード操作
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // スワイプ操作（モバイル）
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) showPrev();
      else showNext();
    }
  });
})();
// File: assets/js/main.js （末尾に追記）

// ============================================
// Feature Tabs
// ============================================
(() => {
  const tabsNavs = document.querySelectorAll('.feature-tabs');
  tabsNavs.forEach((tabs) => {
    const buttons = tabs.querySelectorAll('.feature-tabs__tab');
    const panels = tabs.querySelectorAll('.feature-tabs__panel');

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        buttons.forEach((b) => b.classList.remove('is-active'));
        panels.forEach((p) => p.classList.remove('is-active'));

        btn.classList.add('is-active');
        const targetPanel = tabs.querySelector(`[data-panel="${target}"]`);
        if (targetPanel) targetPanel.classList.add('is-active');
      });
    });
  });
})();

// ============================================
// FAQ Accordion
// ============================================
(() => {
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // 他のFAQを閉じる（アコーディオン挙動）
      faqItems.forEach((other) => other.classList.remove('is-open'));

      // 自分を開閉
      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });
})();

// ============================================
// Screen Tour Image Lightbox統合
// ============================================
(() => {
  const tourImages = document.querySelectorAll('.screen-tour__image, .feature-tabs__image');
  tourImages.forEach((img) => {
    img.addEventListener('click', () => {
      const imgEl = img.querySelector('img');
      if (!imgEl || !imgEl.src) return;

      // 既存のライトボックスを起動
      const lightbox = document.getElementById('lightbox');
      if (lightbox) {
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxCaption = document.getElementById('lightbox-caption');
        lightboxImage.src = imgEl.src;
        lightboxImage.alt = imgEl.alt || '';
        if (lightboxCaption) lightboxCaption.textContent = imgEl.alt || '';
        lightbox.classList.add('is-active');
        document.body.classList.add('lightbox-open');
      }
    });
  });
})();
