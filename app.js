/* ── DevNotes Blog Engine v3 — Embedded & Systems ── */

const CATEGORIES = {
  linux:  { label: 'Embedded Linux', tags: ['linux','embedded-linux','kernel','driver','device-tree','buildroot','yocto','uboot','u-boot','rootfs','dts','dtb','busybox','systemd','cross-compile'] },
  mcu:    { label: 'Embedded MCU',   tags: ['mcu','stm32','esp32','arduino','avr','arm','cortex','rtos','freertos','hal','bare-metal','gpio','uart','spi','i2c','adc','pwm','interrupt','dma','firmware'] },
  fpga:   { label: 'FPGA',           tags: ['fpga','vhdl','verilog','systemverilog','vivado','quartus','xilinx','altera','ip-core','rtl','synthesis','timing','hdl','pynq'] },
  robot:  { label: 'Robot',          tags: ['robot','ros','ros2','robotics','kinematics','slam','path-planning','sensor-fusion','lidar','motor','servo','pid','navigation','gazebo'] },
  algo:   { label: 'Algorithm',      tags: ['algorithm','algo','data-structure','sorting','graph','dynamic-programming','bit-manipulation','complexity','leetcode','dsa'] },
  python: { label: 'Python',         tags: ['python','numpy','opencv','serial','automation','script','matplotlib','pandas','ctypes','pyserial','flask','raspberry-pi'] },
  make:   { label: 'Makefile',       tags: ['makefile','make','cmake','build','toolchain','linker','ld','gcc','arm-gcc','cross-compile','build-system','cmake','ninja'] },
  debug:  { label: 'Debug Tool',     tags: ['debug','gdb','openocd','jtag','swd','j-link','st-link','logic-analyzer','oscilloscope','valgrind','strace','ltrace','coredump','gdbserver'] },
};

// Category color mapping (matches CSS vars)
const CAT_COLORS = {
  linux: '--c-linux', mcu: '--c-mcu', fpga: '--c-fpga', robot: '--c-robot',
  algo: '--c-algo', python: '--c-python', make: '--c-make', debug: '--c-debug',
};

let allPosts = [];
let prevPage = 'home';
let prevListingState = null;

// ── Load posts from POSTS_DATA ─────────────────────────────
function loadPosts() {
  if (typeof window.POSTS_DATA === 'undefined' || !window.POSTS_DATA.length) {
    document.getElementById('latestList').innerHTML =
      '<p style="color:var(--text3);padding:2rem 0;font-size:.85rem">Chưa có bài viết. Thêm bài vào <code>posts/posts.js</code>.</p>';
    return;
  }
  allPosts = [...window.POSTS_DATA].sort((a, b) => new Date(b.date) - new Date(a.date));
  updateCounts();
  renderLatest();
}

// ── Update counts on category cards ───────────────────────
function updateCounts() {
  Object.keys(CATEGORIES).forEach(cat => {
    document.querySelectorAll(`.cat-cnt[data-cat="${cat}"]`).forEach(el => {
      el.textContent = getByCategory(cat).length + ' bài viết';
    });
  });
  const tot = document.getElementById('totalCount');
  if (tot) tot.textContent = allPosts.length + ' bài viết';
}

function getByCategory(cat) {
  if (cat === 'all') return allPosts;
  const catTags = CATEGORIES[cat]?.tags || [];
  return allPosts.filter(p =>
    (p.tags || []).some(t => catTags.includes(t.toLowerCase())) ||
    (p.category || '').toLowerCase() === cat
  );
}

// ── Render latest list on home ─────────────────────────────
function renderLatest() {
  const el = document.getElementById('latestList');
  const posts = allPosts.slice(0, 8);
  if (!posts.length) { el.innerHTML = ''; return; }
  el.innerHTML = posts.map((p, i) => `
    <div class="latest-item" onclick="openPost('${p.id}','home')" style="animation-delay:${i * 45}ms">
      <span class="li-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="li-meta">
        <div class="li-tags">${(p.tags || []).slice(0, 4).map(t => `<span class="li-tag">${t}</span>`).join('')}</div>
        <div class="li-title">${p.title}</div>
        <div class="li-excerpt">${p.excerpt || ''}</div>
      </div>
      <span class="li-date">${fmtDate(p.date)}</span>
    </div>`).join('');
}

// ── Navigation ─────────────────────────────────────────────
function navigate(type, value) {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (type === 'home') {
    showPage('pageHome');
    document.title = 'DevNotes — Embedded & Systems';
    history.pushState({}, '', location.pathname);
  } else if (type === 'all') {
    prevListingState = { type: 'all' };
    showListing('Tất cả bài viết', allPosts, null);
    history.pushState({ type: 'all' }, '', '#all');
  } else if (type === 'category') {
    const posts = getByCategory(value);
    const label = CATEGORIES[value]?.label || value;
    prevListingState = { type: 'category', value };
    showListing(label, posts, value);
    history.pushState({ type: 'category', value }, '', '#cat/' + value);
  } else if (type === 'tag') {
    const byTag = allPosts.filter(p => (p.tags || []).map(t => t.toLowerCase()).includes(value.toLowerCase()));
    prevListingState = { type: 'tag', value };
    showListing('#' + value, byTag, null);
    history.pushState({ type: 'tag', value }, '', '#tag/' + value);
  }
  return false;
}

// ── Listing page ───────────────────────────────────────────
function showListing(title, posts, activeCat) {
  prevPage = 'listing';
  document.getElementById('listingTitle').textContent = title;
  document.getElementById('listingCount').textContent = posts.length + ' bài';
  document.title = title + ' — DevNotes';

  // Tag chips
  const chipsEl = document.getElementById('tagChips');
  if (activeCat && CATEGORIES[activeCat]) {
    const usedTags = [...new Set(posts.flatMap(p => p.tags || []))].sort();
    chipsEl.innerHTML = usedTags.map(t =>
      `<button class="tag-chip" onclick="filterListing('${activeCat}','${t}',this)">${t}</button>`
    ).join('');
  } else {
    chipsEl.innerHTML = '';
  }

  document.getElementById('listingBack').onclick = () => navigate('home');
  renderCards(posts);
  showPage('pageListing');
}

function filterListing(cat, tag, btn) {
  document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
  btn.classList.toggle('active', true);
  // toggle off if same
  if (btn.dataset.active === 'true') {
    btn.dataset.active = 'false'; btn.classList.remove('active');
    renderCards(getByCategory(cat)); return;
  }
  document.querySelectorAll('.tag-chip').forEach(c => c.dataset.active = 'false');
  btn.dataset.active = 'true';
  const base = getByCategory(cat);
  renderCards(base.filter(p => (p.tags || []).map(t => t.toLowerCase()).includes(tag.toLowerCase())));
}

function renderCards(posts) {
  const grid = document.getElementById('cardsGrid');
  if (!posts.length) {
    grid.innerHTML = '<div class="empty"><span>🔍</span><p>Không có bài viết nào.</p></div>';
    return;
  }
  grid.innerHTML = posts.map((p, i) => `
    <div class="post-card" onclick="openPost('${p.id}','listing')" style="animation-delay:${i * 45}ms">
      <div class="pc-tags">${(p.tags || []).slice(0, 4).map(t => `<span class="pc-tag">${t}</span>`).join('')}</div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-excerpt">${p.excerpt || ''}</div>
      <div class="pc-meta">
        <span>${fmtDate(p.date)} · ${readTime(p.content)} phút đọc</span>
        <span class="pc-read">Đọc →</span>
      </div>
    </div>`).join('');
}

// ── Open article ───────────────────────────────────────────
function openPost(id, from) {
  const post = allPosts.find(p => p.id === id);
  if (!post) return;
  prevPage = from || prevPage;

  const tags = (post.tags || []).map(t => `<span class="art-tag">${t}</span>`).join('');
  document.getElementById('articleContent').innerHTML = `
    <header class="art-header">
      <div class="art-tags">${tags}</div>
      <h1 class="art-title">${post.title}</h1>
      ${post.excerpt ? `<p class="art-sub">${post.excerpt}</p>` : ''}
      <div class="art-meta">
        <span>📅 ${fmtDate(post.date)}</span>
        <span>⏱ ${readTime(post.content)} phút đọc</span>
        ${post.author ? `<span>✍️ ${post.author}</span>` : ''}
      </div>
    </header>
    <div class="art-body">${mdToHtml(post.content)}</div>`;

  document.getElementById('articleBack').onclick = goBackFromArticle;
  document.title = post.title + ' — DevNotes';
  history.pushState({ type: 'post', id }, '', '#post/' + id);
  showPage('pageArticle');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBackFromArticle() {
  if (prevPage === 'listing' && prevListingState) {
    const s = prevListingState;
    if (s.type === 'all') navigate('all');
    else if (s.type === 'category') navigate('category', s.value);
    else if (s.type === 'tag') navigate('tag', s.value);
  } else {
    navigate('home');
  }
}

// ── Page switching ─────────────────────────────────────────
function showPage(id) {
  ['pageHome', 'pageListing', 'pageArticle', 'pageAdmin'].forEach(p => {
    const el = document.getElementById(p);
    if (!el) return;
    el.style.display = p === id ? '' : 'none';
    el.classList.toggle('page-off', p !== id);
  });
}

// ── Markdown renderer ──────────────────────────────────────
function mdToHtml(md) {
  if (!md) return '';
  return md
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, l, c) =>
      `<pre><code class="lang-${l || 'text'}">${esc(c.trim())}</code></pre>`)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^---$/gm, '<hr>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .split(/\n{2,}/)
    .map(b => {
      b = b.trim();
      if (!b) return '';
      if (/^<(h[123]|ul|ol|blockquote|pre|hr|img)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, ' ')}</p>`;
    }).join('\n');
}
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ── Helpers ────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return d; }
}
function readTime(t) { return Math.max(1, Math.ceil((t || '').split(/\s+/).length / 200)); }

// ── Theme ──────────────────────────────────────────────────
(function () {
  const saved = localStorage.getItem('theme') ||
    (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
})();

document.getElementById('themeBtn').addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeBtn(next);
});
function updateThemeBtn(t) { document.getElementById('themeBtn').textContent = t === 'dark' ? '☀' : '🌙'; }

// ── Popstate ───────────────────────────────────────────────
window.addEventListener('popstate', () => {
  const h = location.hash;
  if (!h || h === '#') { navigate('home'); return; }
  if (h === '#all') { navigate('all'); return; }
  if (h.startsWith('#cat/')) { navigate('category', h.slice(5)); return; }
  if (h.startsWith('#tag/')) { navigate('tag', h.slice(5)); return; }
  if (h.startsWith('#post/')) {
    const p = allPosts.find(x => x.id === h.slice(6));
    if (p) { openPost(p.id); return; }
  }
  navigate('home');
});

// ── Handle initial hash ────────────────────────────────────
function handleRoute() {
  const h = location.hash;
  if (!h) return;
  if (h === '#all') { navigate('all'); return; }
  if (h.startsWith('#cat/')) { navigate('category', h.slice(5)); return; }
  if (h.startsWith('#tag/')) { navigate('tag', h.slice(5)); return; }
  if (h.startsWith('#post/')) {
    const p = allPosts.find(x => x.id === h.slice(6));
    if (p) openPost(p.id, 'home');
  }
}

// ── Boot ───────────────────────────────────────────────────
showPage('pageHome');
loadPosts();
handleRoute();

/* ══════════════════════════════════════════════════════════
   ADMIN PANEL
   ══════════════════════════════════════════════════════════ */

// ── Đổi password tại đây ─────────────────────────────────
const ADMIN_PASSWORD = 'devnotes2024';

// Tag gợi ý theo chuyên mục
const TAG_SUGGESTIONS = {
  'Embedded Linux': ['linux','kernel','driver','device-tree','buildroot','yocto','u-boot','rootfs','cross-compile','dts'],
  'MCU':            ['stm32','esp32','avr','rtos','freertos','hal','uart','spi','i2c','dma','gpio','interrupt','firmware'],
  'FPGA':           ['fpga','vhdl','verilog','vivado','quartus','rtl','hdl','synthesis','timing'],
  'Robot':          ['ros','ros2','slam','kinematics','pid','gazebo','lidar','sensor-fusion','navigation'],
  'Algorithm':      ['algorithm','data-structure','sorting','graph','dp','bit-manipulation','complexity'],
  'Python':         ['python','numpy','opencv','pyserial','automation','matplotlib','script','flask'],
  'Makefile':       ['makefile','cmake','toolchain','gcc','linker','arm-gcc','build-system','ninja'],
  'Debug':          ['gdb','openocd','jtag','swd','j-link','st-link','valgrind','strace','gdbserver'],
};

// ── Modal ─────────────────────────────────────────────────
function openAdminModal() {
  document.getElementById('adminModal').classList.remove('modal-hidden');
  document.getElementById('adminPassInput').value = '';
  document.getElementById('modalError').textContent = '';
  setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.add('modal-hidden');
}

function checkAdminPass() {
  const val = document.getElementById('adminPassInput').value;
  if (val === ADMIN_PASSWORD) {
    closeAdminModal();
    openAdminPage();
  } else {
    const err = document.getElementById('modalError');
    err.textContent = '✕ Mật khẩu không đúng';
    document.getElementById('adminPassInput').value = '';
    document.getElementById('adminPassInput').focus();
    // shake animation
    const input = document.getElementById('adminPassInput');
    input.style.borderColor = '#f07070';
    setTimeout(() => input.style.borderColor = '', 1500);
  }
}

// Close modal khi click ra ngoài
document.getElementById('adminModal').addEventListener('click', function(e) {
  if (e.target === this) closeAdminModal();
});

// ── Admin page ────────────────────────────────────────────
function openAdminPage() {
  showPage('pageAdmin');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.title = 'Admin — DevNotes';

  // Set today's date
  document.getElementById('fDate').value = new Date().toISOString().slice(0, 10);

  // Build tag presets
  const presetsEl = document.getElementById('tagPresets');
  presetsEl.innerHTML = Object.entries(TAG_SUGGESTIONS).map(([group, tags]) =>
    `<span class="tag-preset-group">${tags.map(t =>
      `<button class="tag-preset" onclick="addTag('${t}')">${t}</button>`
    ).join('')}</span>`
  ).join('');

  updateAdminHint();
}

function adminLogout() {
  navigate('home');
  document.title = 'DevNotes — Embedded & Systems';
}

function updateAdminHint() {
  const id = (document.getElementById('fId')?.value || '').trim();
  document.getElementById('adminHint').textContent =
    id ? `📄 posts/${id}.js` : '';
}

// ── Tag helpers ───────────────────────────────────────────
function addTag(tag) {
  const input = document.getElementById('fTags');
  const current = input.value.split(',').map(t => t.trim()).filter(Boolean);
  if (!current.includes(tag)) {
    input.value = [...current, tag].join(', ');
    syncPreview();
  }
}

// ── Auto-slug từ title ────────────────────────────────────
function autoSlug() {
  updateAdminHint();
}

// ── Tab switch ────────────────────────────────────────────
function switchTab(tab) {
  const writeEl   = document.getElementById('fContent');
  const previewEl = document.getElementById('fPreview');
  const tabW = document.getElementById('tabWrite');
  const tabP = document.getElementById('tabPreview');

  if (tab === 'write') {
    writeEl.classList.remove('hidden');
    previewEl.classList.add('hidden');
    tabW.classList.add('active');
    tabP.classList.remove('active');
  } else {
    previewEl.innerHTML = mdToHtml(writeEl.value);
    writeEl.classList.add('hidden');
    previewEl.classList.remove('hidden');
    tabW.classList.remove('active');
    tabP.classList.add('active');
  }
}

function syncPreview() {
  // Only update preview if preview tab is active
  const previewEl = document.getElementById('fPreview');
  if (!previewEl.classList.contains('hidden')) {
    previewEl.innerHTML = mdToHtml(document.getElementById('fContent').value);
  }
  updateAdminHint();
}

// ── Generate file ─────────────────────────────────────────
function generateFile() {
  const id      = document.getElementById('fId').value.trim();
  const title   = document.getElementById('fTitle').value.trim();
  const excerpt = document.getElementById('fExcerpt').value.trim();
  const date    = document.getElementById('fDate').value;
  const author  = document.getElementById('fAuthor').value.trim() || 'Author';
  const tagsRaw = document.getElementById('fTags').value;
  const content = document.getElementById('fContent').value;

  // Validate
  const missing = [];
  if (!id)      missing.push('ID');
  if (!title)   missing.push('Tiêu đề');
  if (!excerpt) missing.push('Mô tả ngắn');
  if (!tagsRaw) missing.push('Tags');
  if (!content) missing.push('Nội dung');

  if (missing.length) {
    alert('⚠ Vui lòng điền đầy đủ: ' + missing.join(', '));
    return;
  }

  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const filename = `${id}.js`;

  // Escape backticks and backslashes in content
  const escapedContent = content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  // Generate file content
  const fileContent =
`POSTS_DATA.push({
  id: "${id}",
  title: "${title.replace(/"/g, '\\"')}",
  excerpt: "${excerpt.replace(/"/g, '\\"')}",
  date: "${date}",
  author: "${author}",
  tags: [${tags.map(t => `"${t}"`).join(', ')}],
  content: \`${escapedContent}\`
});`;

  const scriptTag = `  <script src="posts/${filename}"></script>`;

  // Show output
  document.getElementById('outputBox').classList.add('hidden');
  document.getElementById('outputReady').classList.remove('hidden');
  document.getElementById('outFilename').textContent = `posts/${filename}`;
  document.getElementById('outFilenameLabel').textContent = `posts/${filename}`;
  document.getElementById('outScriptTag').textContent = scriptTag;
  document.getElementById('outputCode').textContent = fileContent;

  // Scroll to output on mobile
  document.getElementById('outputReady').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Copy output ───────────────────────────────────────────
function copyOutput() {
  const code = document.getElementById('outputCode').textContent;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = '✓ Đã copy!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
}