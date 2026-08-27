const loadingEl = document.getElementById('loading');
const contentEl = document.getElementById('content');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

async function loadHome() {
    loadingEl.style.display = 'block';
    contentEl.style.display = 'none';
    try {
        const res = await fetch('/api/home');
        if (!res.ok) throw new Error('Server returned ' + res.status);
        const data = await res.json();
        renderFeatured(data.featured);
        renderExclusive(data.exclusive);
        renderLive(data.live);
        loadingEl.style.display = 'none';
        contentEl.style.display = 'grid';
    } catch (err) {
        loadingEl.innerHTML = `<div class="error-msg">Failed to load news: ${err.message}</div>`;
    }
}

function renderFeatured(items) {
    const el = document.getElementById('featured');
    el.innerHTML = items.map(item => `
        <div class="card" data-url="${encodeURIComponent(item.url)}">
            ${item.image ? `<img src="${item.image}" alt="">` : ''}
            <div class="body">
                ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
                <h3>${escapeHtml(item.title)}</h3>
            </div>
        </div>
    `).join('');
    attachClicks(el);
}

function renderExclusive(items) {
    const el = document.getElementById('exclusive');
    el.innerHTML = items.map(item => `
        <div class="card" data-url="${encodeURIComponent(item.url)}">
            ${item.image ? `<img src="${item.image}" alt="">` : ''}
            <div class="body">
                <span class="tag">Exclusive</span>
                <h3>${escapeHtml(item.title)}</h3>
            </div>
        </div>
    `).join('');
    attachClicks(el);
}

function renderLive(items) {
    const el = document.getElementById('live');
    el.innerHTML = items.map(item => `
        <div class="live-item" ${item.url ? `data-url="${encodeURIComponent(item.url)}"` : 'style="cursor:default"'}>
            <div class="time">${escapeHtml(item.time || '')}</div>
            <div class="title">${escapeHtml(item.title)}</div>
            ${item.url ? '<span class="clickable-icon" title="Read more">&#8250;</span>' : ''}
        </div>
    `).join('');
    attachClicks(el);
}

function attachClicks(container) {
    container.querySelectorAll('[data-url]').forEach(node => {
        node.addEventListener('click', () => openArticle(decodeURIComponent(node.dataset.url)));
    });
}

async function openArticle(url) {
    modal.classList.remove('hidden');
    modalBody.innerHTML = '<div class="loading">Loading article…</div>';
    try {
        const res = await fetch('/api/article?url=' + encodeURIComponent(url));
        if (!res.ok) throw new Error('Server returned ' + res.status);
        const data = await res.json();
        modalBody.innerHTML = `
            <h2 class="article-title">${escapeHtml(data.title)}</h2>
            <div class="article-meta">
                ${(data.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
                ${data.date ? escapeHtml(data.date) : ''}
            </div>
            ${data.image ? `<img class="article-image" src="${data.image}" alt="">` : ''}
            <div class="article-body">${escapeHtml(data.body)}</div>
            <p><a href="${url}" target="_blank" rel="noopener">View original on tayyar.org</a></p>
        `;
    } catch (err) {
        modalBody.innerHTML = `<div class="error-msg">Failed to load article: ${err.message}</div>`;
    }
}

modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modal.querySelector('.modal-backdrop').addEventListener('click', () => modal.classList.add('hidden'));
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
    }
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

loadHome();
