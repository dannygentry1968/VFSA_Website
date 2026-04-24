// VFSA — News page renderer
// Loads data/news.json and renders the featured card, grid, and archive views.

(function () {
  'use strict';

  const NEWS_URL = 'data/news.json';

  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseDate(str) {
    // Accepts YYYY-MM-DD or ISO strings
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDateShort(str) {
    const d = parseDate(str);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatUpdated(str) {
    const d = parseDate(str);
    if (!d) return '';
    const now = new Date();
    const diffH = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffH < 1) return 'Updated just now';
    if (diffH < 24) return 'Updated ' + diffH + ' hour' + (diffH === 1 ? '' : 's') + ' ago';
    const days = Math.floor(diffH / 24);
    if (days < 7) return 'Updated ' + days + ' day' + (days === 1 ? '' : 's') + ' ago';
    return 'Updated ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function fallbackMarkup(article) {
    const source = article.source || 'VFSA';
    return (
      '<div class="news-card__image-fallback">' +
        '<div class="news-card__fallback-badge">V</div>' +
        '<div class="news-card__fallback-source">' + escapeHtml(source) + '</div>' +
      '</div>'
    );
  }

  function imageBlock(article) {
    if (article.image) {
      return (
        '<img src="' + escapeHtml(article.image) + '" alt="' + escapeHtml(article.image_alt || article.headline || '') +
        '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        fallbackMarkup(article).replace('class="news-card__image-fallback"', 'class="news-card__image-fallback" style="display:none;"')
      );
    }
    return fallbackMarkup(article);
  }

  function categoryClass(cat) {
    if (!cat) return '';
    const c = cat.toLowerCase();
    if (c.indexOf('incident') !== -1 || c.indexOf('attack') !== -1 || c.indexOf('assault') !== -1) return 'news-card__category--incident';
    if (c.indexOf('policy') !== -1 || c.indexOf('legislat') !== -1 || c.indexOf('bill') !== -1) return 'news-card__category--policy';
    if (c.indexOf('response') !== -1 || c.indexOf('union') !== -1 || c.indexOf('advocacy') !== -1) return 'news-card__category--response';
    if (c.indexOf('analysis') !== -1 || c.indexOf('editorial') !== -1 || c.indexOf('opinion') !== -1) return 'news-card__category--analysis';
    return '';
  }

  function renderFeatured(article) {
    if (!article) return '';
    const cat = article.category || 'Featured';
    const catClass = categoryClass(cat);
    return (
      '<article class="news-featured">' +
        '<div class="news-featured__image">' +
          '<div class="news-featured__badge">' + escapeHtml(cat) + '</div>' +
          imageBlock(article) +
        '</div>' +
        '<div class="news-featured__body">' +
          '<div class="news-card__meta">' +
            '<span class="news-card__source">' + escapeHtml(article.source || '') + '</span>' +
            '<span class="news-card__sep"></span>' +
            '<span>' + escapeHtml(formatDateShort(article.date)) + '</span>' +
            (article.state ? '<span class="news-card__sep"></span><span>' + escapeHtml(article.state) + '</span>' : '') +
          '</div>' +
          '<h2><a href="' + escapeHtml(article.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(article.headline) + '</a></h2>' +
          '<p class="news-featured__excerpt">' + escapeHtml(article.excerpt || '') + '</p>' +
          '<a href="' + escapeHtml(article.url) + '" class="news-card__link" target="_blank" rel="noopener noreferrer">Read at ' + escapeHtml(article.source || 'source') + '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderCard(article) {
    const cat = article.category || '';
    const catClass = categoryClass(cat);
    return (
      '<article class="news-card">' +
        '<a href="' + escapeHtml(article.url) + '" target="_blank" rel="noopener noreferrer" class="news-card__image" aria-label="' + escapeHtml(article.headline) + '">' +
          imageBlock(article) +
        '</a>' +
        '<div class="news-card__body">' +
          '<div class="news-card__meta">' +
            '<span class="news-card__source">' + escapeHtml(article.source || '') + '</span>' +
            '<span class="news-card__sep"></span>' +
            '<span>' + escapeHtml(formatDateShort(article.date)) + '</span>' +
            (cat ? '<span class="news-card__category ' + catClass + '">' + escapeHtml(cat) + '</span>' : '') +
          '</div>' +
          '<h3><a href="' + escapeHtml(article.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(article.headline) + '</a></h3>' +
          '<p class="news-card__excerpt">' + escapeHtml(article.excerpt || '') + '</p>' +
          '<a href="' + escapeHtml(article.url) + '" class="news-card__link" target="_blank" rel="noopener noreferrer">Read at ' + escapeHtml(article.source || 'source') + '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderArchiveItem(article) {
    return (
      '<article class="news-archive-item">' +
        '<a href="' + escapeHtml(article.url) + '" target="_blank" rel="noopener noreferrer" class="news-archive-item__image">' +
          imageBlock(article) +
        '</a>' +
        '<div class="news-archive-item__body">' +
          '<h3><a href="' + escapeHtml(article.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(article.headline) + '</a></h3>' +
          '<div class="news-archive-item__meta">' +
            '<span class="news-archive-item__source">' + escapeHtml(article.source || '') + '</span>' +
            ' &middot; ' + escapeHtml(formatDateShort(article.date)) +
            (article.state ? ' &middot; ' + escapeHtml(article.state) : '') +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  function groupByWeek(articles) {
    const groups = {};
    articles.forEach(function (a) {
      const d = parseDate(a.date);
      if (!d) return;
      // Week key: year + ISO week number (approx — use Sunday-anchored week start)
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay()); // Sunday
      weekStart.setHours(0, 0, 0, 0);
      const key = weekStart.toISOString().slice(0, 10);
      if (!groups[key]) groups[key] = { label: weekStart, items: [] };
      groups[key].items.push(a);
    });
    return Object.keys(groups).sort().reverse().map(function (k) { return groups[k]; });
  }

  function weekLabel(date) {
    const end = new Date(date);
    end.setDate(date.getDate() + 6);
    const fmt = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
    return 'Week of ' + fmt(date) + ' – ' + fmt(end);
  }

  function emptyState(message) {
    return (
      '<div class="news-empty">' +
        '<h3>No coverage published yet</h3>' +
        '<p>' + escapeHtml(message || 'New stories are curated daily. Check back soon for the latest coverage of school violence in America.') + '</p>' +
      '</div>'
    );
  }

  function renderNewsPage(data, container) {
    const articles = (data.articles || []).slice().sort(function (a, b) {
      return (parseDate(b.date) || 0) - (parseDate(a.date) || 0);
    });
    if (!articles.length) {
      container.innerHTML = emptyState();
      return;
    }

    // Pick featured: first article flagged featured, else the most recent
    let featuredIdx = articles.findIndex(function (a) { return a.featured; });
    if (featuredIdx < 0) featuredIdx = 0;
    const featured = articles[featuredIdx];
    const rest = articles.filter(function (_, i) { return i !== featuredIdx; }).slice(0, 9);

    let html = renderFeatured(featured);
    if (rest.length) {
      html += '<div class="news-section-header"><h2>More Coverage</h2><span class="news-section-header__line"></span></div>';
      html += '<div class="news-grid">' + rest.map(renderCard).join('') + '</div>';
    }
    container.innerHTML = html;
  }

  function renderArchivePage(data, container) {
    const all = (data.archive || []).concat(
      // Also include articles older than 10 days from the main list
      (data.articles || []).filter(function (a) {
        const d = parseDate(a.date);
        if (!d) return false;
        const ageDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
        return ageDays > 10;
      })
    );
    // De-dupe by URL
    const seen = {};
    const articles = all.filter(function (a) {
      if (!a.url || seen[a.url]) return false;
      seen[a.url] = true;
      return true;
    }).sort(function (a, b) {
      return (parseDate(b.date) || 0) - (parseDate(a.date) || 0);
    });

    if (!articles.length) {
      container.innerHTML = emptyState('The archive is empty so far. As daily coverage rolls off the main news page, it will appear here.');
      return;
    }

    const groups = groupByWeek(articles);
    let html = '';
    groups.forEach(function (g) {
      html += '<div class="news-archive-group-header">' + escapeHtml(weekLabel(g.label)) + '</div>';
      html += '<div class="news-archive-list">' + g.items.map(renderArchiveItem).join('') + '</div>';
    });
    container.innerHTML = html;
  }

  function updateTimestamp(data) {
    const el = document.getElementById('news-updated');
    if (!el) return;
    const ts = data.updated || (data.articles && data.articles[0] && data.articles[0].date);
    const count = (data.articles || []).length;
    el.textContent = formatUpdated(ts) + ' · ' + count + ' ' + (count === 1 ? 'story' : 'stories') + ' tracked';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const mainContainer = document.getElementById('news-container');
    const archiveContainer = document.getElementById('news-archive-container');
    if (!mainContainer && !archiveContainer && !document.querySelector('.news-preview-grid')) return;

    fetch(NEWS_URL, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('Failed to load news data: ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (mainContainer) {
          renderNewsPage(data, mainContainer);
          updateTimestamp(data);
        }
        if (archiveContainer) {
          renderArchivePage(data, archiveContainer);
        }
        // Homepage preview: render the 3 most recent cards
        const preview = document.querySelector('.news-preview-grid');
        if (preview) {
          const items = (data.articles || []).slice().sort(function (a, b) {
            return (parseDate(b.date) || 0) - (parseDate(a.date) || 0);
          }).slice(0, 3);
          if (items.length) {
            preview.innerHTML = items.map(renderCard).join('');
          } else {
            preview.innerHTML = emptyState('Daily coverage begins soon.');
          }
        }
      })
      .catch(function (err) {
        console.error('[VFSA News] Could not load news data:', err);
        if (mainContainer) mainContainer.innerHTML = emptyState('News data is temporarily unavailable. Please refresh in a moment.');
        if (archiveContainer) archiveContainer.innerHTML = emptyState('News data is temporarily unavailable. Please refresh in a moment.');
      });
  });
})();
