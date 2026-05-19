// File: assets/js/blog-post.js

(function () {
  'use strict';

  const CATEGORY_LABELS = {
    'product-update': 'Product Update',
    'member': 'Member',
    'event': 'Event'
  };

  async function loadPost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      showError('記事IDが指定されていません。');
      return;
    }

    try {
      const res = await fetch('assets/data/posts.json');
      const data = await res.json();
      const post = data.find(p => p.id === id);

      if (!post) {
        showError('記事が見つかりませんでした。');
        return;
      }

      renderPost(post);
      renderRelatedPosts(data, post);
      setupShareLinks(post);
    } catch (err) {
      console.error(err);
      showError('記事の読み込みに失敗しました。');
    }
  }

  function renderPost(post) {
    document.title = `${post.title} - 株式会社AlgorithM`;

    document.getElementById('post-category').textContent = CATEGORY_LABELS[post.category] || post.category;
    document.getElementById('post-date').textContent = formatDate(post.date);
    document.getElementById('post-date').setAttribute('datetime', post.date);
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('post-author').textContent = `by ${post.author || 'AlgorithM Team'}`;

    const tagsEl = document.getElementById('post-tags');
    tagsEl.innerHTML = (post.tags || [])
      .map(t => `<span class="blog-card-tag">#${escapeHtml(t)}</span>`)
      .join('');

    const thumbEl = document.getElementById('post-thumbnail');
    if (post.thumbnail) {
      thumbEl.innerHTML = `<img src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}">`;
    }

    const bodyEl = document.getElementById('post-body');
    bodyEl.innerHTML = renderBlocks(post.content || []);
    bindLightbox();
  }

  function renderBlocks(blocks) {
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${escapeHtml(block.text)}</p>`;

        case 'heading':
          const level = block.level || 2;
          return `<h${level}>${escapeHtml(block.text)}</h${level}>`;

        case 'image':
          return `
            <figure class="post-image">
              <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.caption || '')}" loading="lazy" data-lightbox-src="${escapeHtml(block.src)}">
              ${block.caption ? `<figcaption class="post-image-caption">${escapeHtml(block.caption)}</figcaption>` : ''}
            </figure>
          `;

        case 'image-gallery':
          const images = block.images || [];
          const count = images.length;
          const items = images.map(img => `
            <div class="gallery-item" data-lightbox-src="${escapeHtml(img.src)}">
              <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.caption || '')}" loading="lazy">
              ${img.caption ? `<div class="gallery-caption">${escapeHtml(img.caption)}</div>` : ''}
            </div>
          `).join('');
          return `<div class="image-gallery count-${count}">${items}</div>`;

        case 'quote':
          return `<blockquote>${escapeHtml(block.text)}</blockquote>`;

        default:
          return '';
      }
    }).join('');
  }

  function bindLightbox() {
    let lightbox = document.querySelector('.lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="閉じる">×</button>
        <img src="" alt="">
      `;
      document.body.appendChild(lightbox);

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
          lightbox.classList.remove('active');
        }
      });
    }

    document.querySelectorAll('[data-lightbox-src]').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.dataset.lightboxSrc;
        lightbox.querySelector('img').src = src;
        lightbox.classList.add('active');
      });
    });
  }

  function renderRelatedPosts(allPosts, currentPost) {
    const related = allPosts
      .filter(p => p.id !== currentPost.id)
      .filter(p =>
        p.category === currentPost.category ||
        (p.tags || []).some(t => (currentPost.tags || []).includes(t))
      )
      .slice(0, 3);

    const grid = document.getElementById('related-grid');
    if (!grid) return;

    if (related.length === 0) {
      grid.parentElement.parentElement.style.display = 'none';
      return;
    }

    grid.innerHTML = related.map(post => {
      const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
      const thumbHtml = post.thumbnail
        ? `<img src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}" loading="lazy">`
        : '';
      return `
        <a href="blog-post.html?id=${encodeURIComponent(post.id)}" class="blog-card">
          <div class="blog-card-thumb">${thumbHtml}</div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span class="blog-card-category">${escapeHtml(categoryLabel)}</span>
              <span>${formatDate(post.date)}</span>
            </div>
            <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
          </div>
        </a>
      `;
    }).join('');
  }

  function setupShareLinks(post) {
    const url = window.location.href;
    const text = post.title;

    const shareX = document.getElementById('share-x');
    if (shareX) {
      shareX.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }

    const shareLi = document.getElementById('share-linkedin');
    if (shareLi) {
      shareLi.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
  }

  function showError(message) {
    const main = document.querySelector('.blog-post-page');
    if (main) {
      main.innerHTML = `
        <div class="container" style="padding: 160px 0; text-align: center;">
          <h1>Error</h1>
          <p style="color: var(--color-text-sub); margin: 16px 0 32px;">${escapeHtml(message)}</p>
          <a href="blog.html" style="color: var(--color-accent);">← Blog一覧に戻る</a>
        </div>
      `;
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', loadPost);
})();
