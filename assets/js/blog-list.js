// File: assets/js/blog-list.js

(function () {
  'use strict';

  const STATE = {
    posts: [],
    activeCategory: 'all',
    activeTag: null
  };

  const CATEGORY_LABELS = {
    'product-update': 'Product Update',
    'member': 'Member',
    'event': 'Event'
  };

  async function loadPosts() {
    try {
      const res = await fetch('assets/data/posts.json');
      const data = await res.json();
      STATE.posts = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      renderTagCloud();
      renderPosts();
    } catch (err) {
      console.error('記事データの読み込みに失敗しました:', err);
    }
  }

  function renderTagCloud() {
    const tagCloud = document.getElementById('tag-cloud');
    if (!tagCloud) return;

    const allTags = new Set();
    STATE.posts.forEach(post => {
      (post.tags || []).forEach(tag => allTags.add(tag));
    });

    tagCloud.innerHTML = Array.from(allTags)
      .map(tag => `<button class="tag-chip" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`)
      .join('');

    tagCloud.querySelectorAll('.tag-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        if (STATE.activeTag === tag) {
          STATE.activeTag = null;
          chip.classList.remove('active');
        } else {
          tagCloud.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          STATE.activeTag = tag;
        }
        renderPosts();
      });
    });
  }

  function renderPosts() {
    const grid = document.getElementById('blog-grid');
    const emptyState = document.getElementById('empty-state');
    if (!grid) return;

    let filtered = STATE.posts;

    if (STATE.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === STATE.activeCategory);
    }

    if (STATE.activeTag) {
      filtered = filtered.filter(p => (p.tags || []).includes(STATE.activeTag));
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    grid.innerHTML = filtered.map(post => createCard(post)).join('');
  }

  function createCard(post) {
    const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
    const formattedDate = formatDate(post.date);
    const tagsHtml = (post.tags || [])
      .slice(0, 3)
      .map(t => `<span class="blog-card-tag">#${escapeHtml(t)}</span>`)
      .join('');

    const thumbHtml = post.thumbnail
      ? `<img src="${escapeHtml(post.thumbnail)}" alt="${escapeHtml(post.title)}" loading="lazy">`
      : '';

    return `
      <a href="blog-post.html?id=${encodeURIComponent(post.id)}" class="blog-card">
        <div class="blog-card-thumb">${thumbHtml}</div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span class="blog-card-category">${escapeHtml(categoryLabel)}</span>
            <span>${formattedDate}</span>
          </div>
          <h2 class="blog-card-title">${escapeHtml(post.title)}</h2>
          <p class="blog-card-excerpt">${escapeHtml(post.excerpt || '')}</p>
          <div class="blog-card-tags">${tagsHtml}</div>
        </div>
      </a>
    `;
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

  function bindFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.activeCategory = btn.dataset.filter;
        renderPosts();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindFilters();
    loadPosts();
  });
})();
