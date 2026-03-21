/* ── RoboTun Blog Engine v3 — Embedded & Systems ── */

const CATEGORIES = {
  linux:  { label: 'Embedded Linux', tags: ['linux','embedded-linux','kernel','driver','device-tree','buildroot','yocto','uboot','u-boot','rootfs','dts','dtb','busybox','systemd','cross-compile'] },
  mcu:    { label: 'Embedded MCU',   tags: ['mcu','stm32','esp32','arduino','avr','arm','cortex','rtos','freertos','hal','bare-metal','gpio','uart','spi','i2c','adc','pwm','interrupt','dma','firmware'] },
  fpga:   { label: 'FPGA',           tags: ['fpga','vhdl','verilog','systemverilog','vivado','quartus','xilinx','altera','ip-core','rtl','synthesis','timing','hdl','pynq'] },
  'fpga/verilog': { label: 'FPGA/Verilog', tags: ['verilog','systemverilog','vivado','xilinx','ip-core','rtl','synthesis','timing','hdl'] },
  'fpga/vhdl':    { label: 'FPGA/VHDL',   tags: ['vhdl','quartus','altera','rtl','synthesis','timing','hdl'] },
  'fpga/board/cyclone-v': { label: 'FPGA/Board/Cyclone-V', tags: ['cyclone','altera','quartus','fpga','rtl','hdl'] },
  'fpga/board/zynq-7':    { label: 'FPGA/Board/Zynq-Z7-10', tags: ['zynq','xilinx','vivado','fpga','rtl','hdl','arm'] },
  robot:  { label: 'Robot',          tags: ['robot','ros','ros2','robotics','kinematics','slam','path-planning','sensor-fusion','lidar','motor','servo','pid','navigation','gazebo'] },
  algo:   { label: 'Algorithm',      tags: ['algorithm','algo','data-structure','sorting','graph','dynamic-programming','bit-manipulation','complexity','leetcode','dsa'] },
  python: { label: 'Python',         tags: ['python','numpy','opencv','serial','automation','script','matplotlib','pandas','ctypes','pyserial','flask','raspberry-pi'] },
  make:   { label: 'Makefile',       tags: ['makefile','make','cmake','build','toolchain','linker','ld','gcc','arm-gcc','cross-compile','build-system','cmake','ninja'] },
  debug:  { label: 'Debug Tool',     tags: ['debug','gdb','openocd','jtag','swd','j-link','st-link','logic-analyzer','oscilloscope','valgrind','strace','ltrace','coredump','gdbserver'] },
};

// Category color mapping (matches CSS vars)
const CAT_COLORS = {
  linux: '--c-linux', mcu: '--c-mcu', fpga: '--c-fpga', 'fpga/verilog': '--c-fpga', 'fpga/vhdl': '--c-fpga',
  'fpga/board': '--c-fpga', 'fpga/board/cyclone-v': '--c-fpga', 'fpga/board/zynq-7': '--c-fpga',
  robot: '--c-robot', algo: '--c-algo', python: '--c-python', make: '--c-make', debug: '--c-debug',
};

let allPosts = [];
let prevPage = 'home';
let prevListingState = null;

// ── Load posts from POSTS_DATA ─────────────────────────────
function loadPosts() {
  if (typeof window.POSTS_DATA === 'undefined' || !window.POSTS_DATA.length) {
    document.getElementById('latestList').innerHTML =
      '<p style="color:var(--text3);padding:2rem 0;font-size:.85rem">No posts yet. Add posts to <code>posts/posts.js</code>.</p>';
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
      el.textContent = getByCategory(cat).length + ' article';
    });
  });
  const tot = document.getElementById('totalCount');
  if (tot) tot.textContent = allPosts.length + ' article';
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
    document.title = 'RoboTun — Embedded & Systems';
    history.pushState({}, '', location.pathname);
  } else if (type === 'all') {
    prevListingState = { type: 'all' };
    showListing('All Posts', allPosts, null);
    history.pushState({ type: 'all' }, '', '#all');
  } else if (type === 'category') {
    const posts = getByCategory(value);
    let label = CATEGORIES[value]?.label || value;
    // Format fpga-verilog → fpga/verilog
    // if (value.includes('-')) {
    //   label = value.replace('-', '/');
    // }
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
  document.getElementById('listingCount').textContent = posts.length + ' posts';
  document.title = title + ' — RoboTun';

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
    grid.innerHTML = '<div class="empty"><span>🔍</span><p>No posts found.</p></div>';
    return;
  }
  grid.innerHTML = posts.map((p, i) => `
    <div class="post-card" onclick="openPost('${p.id}','listing')" style="animation-delay:${i * 45}ms">
      <div class="pc-tags">${(p.tags || []).slice(0, 4).map(t => `<span class="pc-tag">${t}</span>`).join('')}</div>
      <div class="pc-title">${p.title}</div>
      <div class="pc-excerpt">${p.excerpt || ''}</div>
      <div class="pc-meta">
        <span>${fmtDate(p.date)} · ${readTime(p.content)} min read</span>
        <span class="pc-read">Read →</span>
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
        <span>⏱ ${readTime(post.content)} min read</span>
        ${post.author ? `<span>✍️ ${post.author}</span>` : ''}
      </div>
    </header>
    <div class="art-body">${mdToHtml(post.content)}</div>`;

  document.getElementById('articleBack').onclick = goBackFromArticle;
  document.title = post.title + ' — RoboTun';
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
  
  // FIRST: Process images BEFORE links (because images contain ! prefix)
  // Handle both ![alt](url) and ![alt](data:image/...)
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // Protect image tags by wrapping in a marker
    return `__IMG_TAG__alt="${alt}"src="${src}"__END_IMG__`;
  });
  
  // Now process regular markdown
  md = md
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
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .split(/\n{2,}/)
    .map(b => {
      b = b.trim();
      if (!b) return '';
      // Check for image tags, code blocks, headings, etc
      if (/^<(h[123]|ul|ol|blockquote|pre|hr|img)|^__IMG_TAG__/.test(b)) return b;
      return `<p>${b.replace(/\n/g, ' ')}</p>`;
    }).join('\n');
  
  // LAST: Convert protected image markers back to actual img tags
  md = md.replace(/__IMG_TAG__alt="([^"]*)"src="([^"]*)"__END_IMG__/g, 
    '<img src="$2" alt="$1">');
  
  return md;
}
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// ── Helpers ────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return d; }
}
function readTime(t) { return Math.max(1, Math.ceil((t || '').split(/\s+/).length / 200)); }

// ── Search ────────────────────────────────────────────────
function handleSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultEl = document.getElementById('searchResults');
  
  if (!query) {
    resultEl.classList.remove('active');
    resultEl.innerHTML = '';
    return;
  }
  
  const results = allPosts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.excerpt.toLowerCase().includes(query) ||
    (post.tags || []).some(t => t.toLowerCase().includes(query))
  ).slice(0, 8);
  
  if (results.length === 0) {
    resultEl.classList.remove('active');
    resultEl.innerHTML = '';
    return;
  }
  
  resultEl.classList.add('active');
  resultEl.innerHTML = results.map(post => `
    <div class="search-result-item" onclick="openPost('${post.id}','home'); document.getElementById('searchInput').value = ''; document.getElementById('searchResults').classList.remove('active')">
      <span class="search-result-title">${post.title}</span>
      <span class="search-result-excerpt">${post.excerpt || ''}</span>
    </div>
  `).join('');
}

// Click outside search to close
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-search')) {
    document.getElementById('searchResults').classList.remove('active');
  }
});

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

// ── Change password in here ─────────────────────────────────
const ADMIN_PASSWORD = '123';

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
    err.textContent = '✕ Incorrect password';
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
  document.title = 'Admin — RoboTun';

  // Reset images for new article
  uploadedImages = {};
  imageRegistry = {};
  console.log('Image registry reset for new article');

  // Set today's date
  document.getElementById('fDate').value = new Date().toISOString().slice(0, 10);

  // Build tag presets
  const presetsEl = document.getElementById('tagPresets');
  presetsEl.innerHTML = Object.entries(TAG_SUGGESTIONS).map(([group, tags]) =>
    `<span class="tag-preset-group">${tags.map(t =>
      `<button class="tag-preset" onclick="addTag('${t}')">${t}</button>`
    ).join('')}</span>`
  ).join('');

  updument.title = 'RoboTun — Embedded & Systems';
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

// ── Auto-slug from title ────────────────────────────────────
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

// ── Insert markdown with toolbar ────────────────────────
function insertMarkdown(openTag, closeTag = '') {
  const textarea = document.getElementById('fContent');
  if (!textarea) return;
  
  textarea.focus();
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);
  
  // If text is selected, wrap it; otherwise insert tags
  if (selectedText) {
    textarea.value = beforeText + openTag + selectedText + closeTag + afterText;
    textarea.selectionStart = start + openTag.length;
    textarea.selectionEnd = start + openTag.length + selectedText.length;
  } else {
    // Insert placeholder text
    let placeholder = 'text';
    if (openTag.includes('#')) placeholder = 'Heading';
    if (openTag.includes('**')) placeholder = 'bold text';
    if (openTag.includes('*') && !openTag.includes('**')) placeholder = 'italic text';
    if (openTag.includes('```')) placeholder = 'code';
    if (openTag.includes('[')) placeholder = 'Link text';
    if (openTag.includes('![')) placeholder = 'alt text';
    if (openTag.includes('>')) placeholder = 'quote text';
    if (openTag.includes('-')) placeholder = 'list item';
    
    const fullText = openTag + placeholder + closeTag;
    textarea.value = beforeText + fullText + afterText;
    
    // Select the placeholder text
    const placeholderStart = start + openTag.length;
    textarea.selectionStart = placeholderStart;
    textarea.selectionEnd = placeholderStart + placeholder.length;
  }
  
  // Trigger preview update
  syncPreview();
}

function syncPreview() {
  // Only update preview if preview tab is active
  const previewEl = document.getElementById('fPreview');
  if (!previewEl.classList.contains('hidden')) {
    previewEl.innerHTML = mdToHtml(document.getElementById('fContent').value);
  }
  updateAdminHint();
}

// ── Image upload helpers ───────────────────────────────────
let uploadedImages = {};

function handleImageDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'copy';
  const uploadArea = document.getElementById('imageUploadArea');
  if (uploadArea) {
    uploadArea.classList.remove('dragover');
  }
  
  const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
  console.log(`Drop: ${files.length} image(s)`);
  processImages(files);
}

function handleImageSelect(e) {
  const files = Array.from(e.target.files || []);
  console.log(`Select: ${files.length} file(s)`);
  processImages(files);
}

// ── Image modal functions ──────────────────────────────
function openImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.remove('modal-hidden');
    setupImageUpload();
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.add('modal-hidden');
  }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeImageModal();
      }
    });
  }
});

// Setup image upload events when DOM is ready
function setupImageUpload() {
  const uploadArea = document.getElementById('imageUploadArea');
  const imageInput = document.getElementById('imageInput');
  
  if (!uploadArea || !imageInput) {
    console.warn('Image upload elements not found');
    return;
  }
  
  // Drag over
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
  });

  // Drag leave
  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
  });

  // Drop
  uploadArea.addEventListener('drop', handleImageDrop);

  // Click to select
  uploadArea.addEventListener('click', () => {
    imageInput.click();
  });

  // File input change
  imageInput.addEventListener('change', handleImageSelect);
  
  console.log('Image upload events setup complete');
}

function processImages(files) {
  if (!files || files.length === 0) {
    console.warn('No files to process');
    return;
  }
  
  console.log(`Processing ${files.length} file(s)...`);
  
  files.forEach(file => {
    // Check if file is image
    if (!file.type.startsWith('image/')) {
      console.warn(`Skipped non-image: ${file.name} (type: ${file.type})`);
      return;
    }
    
    // Check file size (max 5MB to avoid huge base64 strings)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.warn(`File too large: ${file.name} (${sizeMB}MB, max 5MB)`);
      alert(`⚠ Image too large: ${file.name}\nMax size: 5MB`);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const base64 = event.target.result;
        const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        uploadedImages[imageId] = { base64, name: file.name };
        console.log(`✓ Loaded: ${file.name} (${file.size} bytes → ${base64.length} chars in base64)`);
        renderImagePreview();
      } catch (error) {
        console.error(`Error loading ${file.name}:`, error);
      }
    };
    
    reader.onerror = () => {
      console.error(`FileReader error for ${file.name}`);
    };
    
    reader.readAsDataURL(file);
  });
}

function renderImagePreview() {
  const previewList = document.getElementById('imagePreviewList');
  const insertBtn = document.getElementById('insertImagesBtn');
  
  if (!previewList) {
    console.error('Image preview list element not found');
    return;
  }
  
  const imageCount = Object.keys(uploadedImages).length;
  console.log(`Rendering ${imageCount} image preview(s)`);
  
  previewList.innerHTML = Object.entries(uploadedImages).map(([id, img]) => `
    <div class="image-preview-item" title="${img.name}">
      <img src="${img.base64}" alt="${img.name}">
      <button class="image-preview-remove" onclick="removeImage('${id}')">✕</button>
    </div>
  `).join('');
  
  // Show/hide insert button
  if (insertBtn) {
    insertBtn.style.display = imageCount > 0 ? 'block' : 'none';
    console.log(`Insert button: ${imageCount > 0 ? 'visible' : 'hidden'}`);
  } else {
    console.warn('Insert images button not found');
  }
}

function removeImage(id) {
  delete uploadedImages[id];
  renderImagePreview();
}

function insertImageToContent() {
  if (Object.keys(uploadedImages).length === 0) {
    console.warn('No images to insert');
    return;
  }
  
  const contentEl = document.getElementById('fContent');
  if (!contentEl) {
    console.error('Content element not found');
    return;
  }
  
  let markdown = '\n\n';
  
  Object.values(uploadedImages).forEach((img, index) => {
    markdown += `![${img.name}](${img.base64})\n\n`;
    console.log(`Added image ${index + 1}: ${img.name}`);
  });
  
  contentEl.value += markdown;
  console.log(`Inserted ${Object.keys(uploadedImages).length} image(s)`);
  
  uploadedImages = {};
  renderImagePreview();
  syncPreview();
  
  console.log('Image preview cleared');
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
  if (!title)   missing.push('Title');
  if (!excerpt) missing.push('Short Description');
  if (!tagsRaw) missing.push('Tags');
  if (!content) missing.push('Content');

  if (missing.length) {
    alert('⚠ Please fill in: ' + missing.join(', '));
    return;
  }

  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const filename = `${id}.js`;

  // Escape backticks and backslashes in content
  const escapedContent = content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  // Generate images object - data for copy
  let imagesCode = '';
  let imagesDisplay = '';
  if (Object.keys(imageRegistry).length > 0) {
    imagesCode = `\n\n// Images data (referenced in markdown)\nconst POST_IMAGES = {\n`;
    imagesDisplay = `\n\n// Images: ${Object.keys(imageRegistry).length} image(s) embedded\n// (Full base64 data included when copied)\nconst POST_IMAGES = {\n`;
    
    Object.entries(imageRegistry).forEach(([imgId, imgData]) => {
      const base64Str = imgData.base64;
      const base64Preview = base64Str.substring(0, 50) + '...[' + Math.round(base64Str.length / 1024) + 'KB]';
      imagesCode += `  "${imgId}": { name: "${imgData.name.replace(/"/g, '\\"')}", base64: \`${base64Str}\` },\n`;
      imagesDisplay += `  "${imgId}": { name: "${imgData.name.replace(/"/g, '\\"')}", base64: \`${base64Preview}\` },\n`;
    });
    imagesCode += `};\n`;
    imagesDisplay += `};\n`;
  }

  // Generate file content - FULL VERSION for copy
  const fileContent =
`POSTS_DATA.push({
  id: "${id}",
  title: "${title.replace(/"/g, '\\"')}",
  excerpt: "${excerpt.replace(/"/g, '\\"')}",
  date: "${date}",
  author: "${author}",
  tags: [${tags.map(t => `"${t}"`).join(', ')}],
  content: \`${escapedContent}\`
});${imagesCode}`;

  // Generate display version - TRUNCATED for UI
  const fileContentDisplay =
`POSTS_DATA.push({
  id: "${id}",
  title: "${title.replace(/"/g, '\\"')}",
  excerpt: "${excerpt.replace(/"/g, '\\"')}",
  date: "${date}",
  author: "${author}",
  tags: [${tags.map(t => `"${t}"`).join(', ')}],
  content: \`${escapedContent}\`
});${imagesDisplay}`;

  // Store full content for copy, but display truncated version
  document.getElementById('outputCode').dataset.fullContent = fileContent;
  document.getElementById('outputCode').textContent = fileContentDisplay;
  document.getElementById('outFilenameLabel').textContent = filename;
  document.getElementById('outFilename').textContent = `posts/${filename}`;
  document.getElementById('outputBox').classList.add('hidden');
  document.getElementById('outputReady').classList.remove('hidden');

  // Update manifest snippet
  document.getElementById('outScriptTag').innerHTML =
    `<code>&lt;script src="posts/${filename}"&gt;&lt;/script&gt;</code>`;
}

// ── Copy output ────────────────────────────────────────────
function copyOutput() {
  // Use full content from dataset, not the truncated display version
  const code = document.getElementById('outputCode').dataset.fullContent || 
               document.getElementById('outputCode').textContent;
  const btn = document.getElementById('copyBtn');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = '✓ Copied!';
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
  } else {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  }
}

// ── Admin logout ───────────────────────────────────────────
function adminLogout() {
  showPage('pageHome');
  document.title = 'RoboTun — Embedded & Systems';
}

// Initialize image registry
let imageRegistry = {};