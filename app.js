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
/** Giữ hash #post/id khi bấm anchor nội bộ (Table of Contents / link trong bài) */
let articleScrollRouteId = null;
/** ID bài đang được edit (null = đang tạo mới) */
let editingPostId = null;

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

// ── Anchor in article: scroll smooth, do not change hash to section (avoid breaking-spa)
function onArticleInpageNav(e) {
  const root = document.getElementById('articleContent');
  const a = e.target.closest('a[href^="#"]');
  if (!a || !root.contains(a)) return;
  const href = a.getAttribute('href');
  if (!href || href === '#') return;
  if (href.startsWith('#post/') || href.startsWith('#cat/') || href.startsWith('#tag/') || href === '#all') return;
  const elId = href.slice(1);
  const target = document.getElementById(elId);
  if (!target || !root.contains(target)) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (articleScrollRouteId) {
    history.replaceState(history.state, '', '#post/' + articleScrollRouteId);
  }
}

// ── Open article ───────────────────────────────────────────
function openPost(id, from) {
  const post = allPosts.find(p => p.id === id);
  if (!post) return;
  prevPage = from || prevPage;
  articleScrollRouteId = id;

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
        <button class="art-edit-btn" onclick="openEditPost('${post.id}')" title="Edit this post">✏ Edit</button>
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
  articleScrollRouteId = null;
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
  const footer = document.querySelector('.site-footer');
  if (footer) footer.style.display = id === 'pageAdmin' ? 'none' : '';
}

// ── Markdown renderer ──────────────────────────────────────
function stripHeadingPlain(raw) {
  return String(raw)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function slugifyHeadingId(raw, usedIds) {
  let base = stripHeadingPlain(raw)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!base) base = 'muc';
  let id = base;
  let n = 1;
  while (usedIds.has(id)) id = `${base}-${++n}`;
  usedIds.add(id);
  return id;
}

function mdToHtml(md) {
  if (!md) return '';

  const headingIds = new Set();
  const toc = [];

  function headingTag(level, innerMd) {
    const id = slugifyHeadingId(innerMd, headingIds);
    toc.push({ level, id, plain: stripHeadingPlain(innerMd) });
    return `<h${level} id="${id}">${innerMd}</h${level}>`;
  }

  // FIRST: Process images BEFORE links (because images contain ! prefix)
  md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    return `__IMG_TAG__alt="${alt}"src="${src}"__END_IMG__`;
  });

  // Process Markdown tables
  function parseTable(block) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) return null;
    // Check separator line (second line must be |---|---|)
    if (!/^\|?\s*[-:]+[\s\|:-]*$/.test(lines[1])) return null;

    const parseRow = (line) =>
      line.replace(/^\||\|$/g, '').split('|').map(c => c.trim());

    const alignments = parseRow(lines[1]).map(c => {
      if (/^:-+:$/.test(c)) return 'center';
      if (/^-+:$/.test(c))  return 'right';
      return 'left';
    });

    const headers = parseRow(lines[0]);
    const headHtml = '<thead><tr>' +
      headers.map((h, i) =>
        `<th style="text-align:${alignments[i]||'left'}">${inlineMarkdown(h)}</th>`
      ).join('') + '</tr></thead>';

    const bodyRows = lines.slice(2).filter(l => l.trim());
    const bodyHtml = '<tbody>' +
      bodyRows.map(row =>
        '<tr>' + parseRow(row).map((c, i) =>
          `<td style="text-align:${alignments[i]||'left'}">${inlineMarkdown(c)}</td>`
        ).join('') + '</tr>'
      ).join('') + '</tbody>';

    return `<div class="md-table-wrap"><table class="md-table">${headHtml}${bodyHtml}</table></div>`;
  }

  function inlineMarkdown(s) {
    return s
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // Replace code blocks first (protect from further processing)
  const codeBlocks = [];
  md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, l, c) => {
    const lang = l || 'text';
    const escaped = esc(c.trim());
    const html = `<div class="code-block-wrap"><button class="code-copy-btn" onclick="copyCodeBlock(this)" title="Copy code">Copy</button><pre><code class="lang-${lang}">${escaped}</code></pre></div>`;
    const idx = codeBlocks.length;
    codeBlocks.push(html);
    return `__CODE_BLOCK_${idx}__`;
  });

  md = md
    .replace(/^### (.+)$/gm, (_, t) => headingTag(3, t))
    .replace(/^## (.+)$/gm, (_, t) => headingTag(2, t))
    .replace(/^# (.+)$/gm, (_, t) => headingTag(2, t))
    .replace(/^---$/gm, '<hr>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((#[^)#]+)\)/g, (_, label, href) =>
      `<a href="${escAttr(href)}">${esc(label)}</a>`)
    .replace(/\[(.+?)\]\((.+?)\)/g, (_, label, href) =>
      `<a href="${escAttr(href)}" target="_blank" rel="noopener">${esc(label)}</a>`)
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]+?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Process blocks (split by double newline)
  md = md.split(/\n{2,}/)
    .map(b => {
      b = b.trim();
      if (!b) return '';
      if (/^__CODE_BLOCK_\d+__$/.test(b)) return b;
      if (/^<(h[123]|ul|ol|blockquote|pre|hr|img|div)|^__IMG_TAG__/.test(b)) return b;
      // Try table parse
      if (b.includes('|') && b.includes('\n')) {
        const tbl = parseTable(b);
        if (tbl) return tbl;
      }
      return `<p>${b.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');

  // Restore code blocks
  codeBlocks.forEach((html, idx) => {
    md = md.replace(`__CODE_BLOCK_${idx}__`, html);
  });

  md = md.replace(/__IMG_TAG__alt="([^"]*)"src="([^"]*)"__END_IMG__/g,
    '<img src="$2" alt="$1">');

  if (toc.length > 0) {
    const items = toc
      .map(
        ({ level, id, plain }) =>
          `<li class="art-toc-item art-toc-level-${level}"><a href="#${id}">${esc(plain)}</a></li>`
      )
      .join('');
    md = `<nav class="art-toc" aria-label="Table of Contents"><p class="art-toc-head">Table of Contents</p><ul class="art-toc-list">${items}</ul></nav>${md}`;
  }

  return md;
}
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ── Copy code block ────────────────────────────────────────
function copyCodeBlock(btn) {
  const code = btn.nextElementSibling?.querySelector('code');
  if (!code) return;
  const text = code.textContent;
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  });
}

// ── Insert Markdown table template ────────────────────────
function insertTable() {
  const template =
`| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Cell 1 | Cell 2 | Cell 3 |
| Cell 4 | Cell 5 | Cell 6 |`;
  const el = document.getElementById('fContent');
  if (!el) return;
  el.focus();
  const sel = window.getSelection();
  let r = sel.rangeCount ? sel.getRangeAt(0) : null;
  if (!r || !el.contains(r.commonAncestorContainer)) {
    r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
    r = sel.getRangeAt(0);
  }
  r.deleteContents();
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createTextNode('\n\n'));
  const lines = template.split('\n');
  lines.forEach((line, i) => {
    const d = document.createElement('div');
    d.textContent = line;
    frag.appendChild(d);
  });
  frag.appendChild(document.createTextNode('\n\n'));
  r.insertNode(frag);
  syncPreview();
}

// ── Admin markdown editor (contenteditable + inline images) ─
function appendPlainAsBlocks(frag, text) {
  if (!text) return;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const d = document.createElement('div');
    if (lines[i].length) d.textContent = lines[i];
    else d.appendChild(document.createElement('br'));
    frag.appendChild(d);
  }
}

function markdownToEditorFragment(md) {
  const frag = document.createDocumentFragment();
  const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) appendPlainAsBlocks(frag, md.slice(last, m.index));
    const wrap = document.createElement('span');
    wrap.className = 'md-embed-img';
    wrap.contentEditable = 'false';
    const img = document.createElement('img');
    img.src = m[2];
    img.alt = String(m[1] || '').replace(/[\[\]]/g, '');
    img.loading = 'lazy';
    wrap.appendChild(img);
    frag.appendChild(wrap);
    last = m.lastIndex;
  }
  if (last < md.length) appendPlainAsBlocks(frag, md.slice(last));
  return frag;
}

function editorToMarkdown(el) {
  let out = '';
  function walkEmbed(node) {
    const img = node.querySelector('img');
    if (img) {
      const alt = (img.getAttribute('alt') || '').replace(/[\[\]]/g, '');
      out += `![${alt}](${img.getAttribute('src') || ''})`;
    }
  }
  function walkInline(node) {
    for (const c of node.childNodes) {
      if (c.nodeType === Node.TEXT_NODE) {
        out += c.textContent;
        continue;
      }
      if (c.nodeType !== Node.ELEMENT_NODE) continue;
      if (c.classList && c.classList.contains('md-embed-img')) {
        walkEmbed(c);
        continue;
      }
      if (c.tagName === 'BR') {
        out += '\n';
        continue;
      }
      walkInline(c);
    }
  }
  function walkBlocks(container) {
    for (const n of container.childNodes) {
      if (n.nodeType === Node.TEXT_NODE) {
        out += n.textContent;
        continue;
      }
      if (n.nodeType !== Node.ELEMENT_NODE) continue;
      if (n.classList && n.classList.contains('md-embed-img')) {
        walkEmbed(n);
        continue;
      }
      const tag = n.tagName;
      if (tag === 'DIV' || tag === 'P') {
        walkInline(n);
        out += '\n';
      } else {
        walkInline(n);
      }
    }
  }
  walkBlocks(el);
  return out.replace(/\n+$/, '');
}

function getEditorMarkdown() {
  const el = document.getElementById('fContent');
  if (!el) return '';
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return el.value;
  return editorToMarkdown(el);
}

function setEditorMarkdown(md) {
  const el = document.getElementById('fContent');
  if (!el) return;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    el.value = md;
    return;
  }
  el.innerHTML = '';
  const raw = md || '';
  if (!raw.trim()) {
    const d = document.createElement('div');
    d.appendChild(document.createElement('br'));
    el.appendChild(d);
    updateContentEditorEmptyAttr();
    return;
  }
  el.appendChild(markdownToEditorFragment(raw));
  updateContentEditorEmptyAttr();
}

function updateContentEditorEmptyAttr() {
  const el = document.getElementById('fContent');
  if (!el || el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return;
  el.setAttribute('data-empty', getEditorMarkdown().trim() === '' ? '1' : '');
}

function ceInsertImageEmbed(el, base64, name) {
  const safeAlt = String(name || 'image').replace(/[\[\]]/g, '');
  el.focus();
  const sel = window.getSelection();
  let r = sel.rangeCount ? sel.getRangeAt(0) : null;
  if (!r || !el.contains(r.commonAncestorContainer)) {
    r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
    r = sel.getRangeAt(0);
  }
  r.deleteContents();
  const wrap = document.createElement('span');
  wrap.className = 'md-embed-img';
  wrap.contentEditable = 'false';
  const img = document.createElement('img');
  img.src = base64;
  img.alt = safeAlt;
  wrap.appendChild(img);
  const after = document.createTextNode('\n\n');
  const frag = document.createDocumentFragment();
  frag.appendChild(document.createTextNode('\n\n'));
  frag.appendChild(wrap);
  frag.appendChild(after);
  r.insertNode(frag);
  const nr = document.createRange();
  nr.setStart(after, after.length);
  nr.collapse(true);
  sel.removeAllRanges();
  sel.addRange(nr);
}

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
document.getElementById('articleContent').addEventListener('click', onArticleInpageNav);

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
    const pendingId = document.getElementById('adminPassInput').dataset.pendingEditId;
    if (pendingId) {
      document.getElementById('adminPassInput').dataset.pendingEditId = '';
      const post = allPosts.find(p => p.id === pendingId);
      if (post) { loadPostIntoEditor(post); return; }
    }
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

  // Reset edit mode
  editingPostId = null;
  updateAdminEditMode(false);

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
}

// ── Edit existing post ────────────────────────────────────
function openEditPost(id) {
  const post = allPosts.find(p => p.id === id);
  if (!post) return;

  // Check admin password first
  document.getElementById('adminModal').classList.remove('modal-hidden');
  document.getElementById('adminPassInput').value = '';
  document.getElementById('modalError').textContent = '';
  // Store pending edit id
  document.getElementById('adminPassInput').dataset.pendingEditId = id;
  setTimeout(() => document.getElementById('adminPassInput').focus(), 100);
}

function loadPostIntoEditor(post) {
  editingPostId = post.id;

  showPage('pageAdmin');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.title = 'Edit: ' + post.title + ' — RoboTun';

  // Reset images
  uploadedImages = {};
  imageRegistry = {};

  // Fill fields
  document.getElementById('fId').value     = post.id;
  document.getElementById('fTitle').value  = post.title;
  document.getElementById('fExcerpt').value = post.excerpt || '';
  document.getElementById('fDate').value   = post.date || '';
  document.getElementById('fAuthor').value = post.author || '';
  document.getElementById('fTags').value   = (post.tags || []).join(', ');

  // Fill content editor
  setEditorMarkdown(post.content || '');
  syncPreview();
  updateAdminHint();

  // Build tag presets
  const presetsEl = document.getElementById('tagPresets');
  presetsEl.innerHTML = Object.entries(TAG_SUGGESTIONS).map(([group, tags]) =>
    `<span class="tag-preset-group">${tags.map(t =>
      `<button class="tag-preset" onclick="addTag('${t}')">${t}</button>`
    ).join('')}</span>`
  ).join('');

  updateAdminEditMode(true);
}

function updateAdminEditMode(isEdit) {
  const badge   = document.getElementById('adminEditBadge');
  const genBtn  = document.getElementById('adminGenerateBtn');
  const resetBtn = document.getElementById('adminResetBtn');
  const title   = document.getElementById('adminPanelTitle');

  if (isEdit) {
    badge.classList.remove('hidden');
    resetBtn.classList.remove('hidden');
    title.textContent = '✏ Edit Article';
    genBtn.innerHTML  = '<span>⬇ Generate updated file</span>';
  } else {
    badge.classList.add('hidden');
    resetBtn.classList.add('hidden');
    title.textContent = '✚ New Article';
    genBtn.innerHTML  = '<span>⬇ Generate file & guide to add to blog</span>';
  }
}

function resetToNewPost() {
  editingPostId = null;
  updateAdminEditMode(false);

  // Clear all fields
  document.getElementById('fId').value = '';
  document.getElementById('fTitle').value = '';
  document.getElementById('fExcerpt').value = '';
  document.getElementById('fDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('fAuthor').value = '';
  document.getElementById('fTags').value = '';
  setEditorMarkdown('');

  // Reset output
  document.getElementById('outputBox').classList.remove('hidden');
  document.getElementById('outputReady').classList.add('hidden');

  uploadedImages = {};
  imageRegistry = {};
  updateAdminHint();
  syncPreview();
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
    previewEl.innerHTML = mdToHtml(getEditorMarkdown());
    writeEl.classList.add('hidden');
    previewEl.classList.remove('hidden');
    tabW.classList.remove('active');
    tabP.classList.add('active');
  }
}

// ── Insert markdown with toolbar ────────────────────────
function insertMarkdown(openTag, closeTag = '') {
  const el = document.getElementById('fContent');
  if (!el) return;

  el.focus();
  const sel = window.getSelection();
  let r = sel.rangeCount ? sel.getRangeAt(0) : null;
  if (!r || !el.contains(r.commonAncestorContainer)) {
    r = document.createRange();
    r.selectNodeContents(el);
    r.collapse(false);
    sel.removeAllRanges();
    sel.addRange(r);
    r = sel.getRangeAt(0);
  }

  const selectedText = r.toString();

  let insert;
  let selStart;
  let selEnd;
  if (selectedText) {
    insert = openTag + selectedText + closeTag;
    selStart = openTag.length;
    selEnd = openTag.length + selectedText.length;
  } else {
    let placeholder = 'text';
    if (openTag.includes('#')) placeholder = 'Heading';
    if (openTag.includes('**')) placeholder = 'bold text';
    if (openTag.includes('*') && !openTag.includes('**')) placeholder = 'italic text';
    if (openTag.includes('```')) placeholder = 'code';
    if (openTag.includes('[')) placeholder = 'Link text';
    if (openTag.includes('![')) placeholder = 'alt text';
    if (openTag.includes('>')) placeholder = 'quote text';
    if (openTag.includes('-')) placeholder = 'list item';
    insert = openTag + placeholder + closeTag;
    selStart = openTag.length;
    selEnd = openTag.length + placeholder.length;
  }

  r.deleteContents();
  const tn = document.createTextNode(insert);
  r.insertNode(tn);
  const nr = document.createRange();
  nr.setStart(tn, selStart);
  nr.setEnd(tn, selEnd);
  sel.removeAllRanges();
  sel.addRange(nr);

  syncPreview();
}

function syncPreview() {
  const previewEl = document.getElementById('fPreview');
  if (!previewEl.classList.contains('hidden')) {
    previewEl.innerHTML = mdToHtml(getEditorMarkdown());
  }
  updateAdminHint();
  updateContentEditorEmptyAttr();
}

// ── Image upload helpers ───────────────────────────────────
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
let uploadedImages = {};

function fileToDataUrlImage(file, onOk, onFail) {
  if (!file || file.size === 0) {
    if (onFail) onFail('not-image');
    return;
  }
  const mime = (file.type || '').toLowerCase();
  // Pasted clipboard files often have an empty type even when bytes are PNG/JPEG
  if (mime && !mime.startsWith('image/')) {
    if (onFail) onFail('not-image');
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    if (onFail) onFail('too-large');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => onOk(reader.result, file.name || 'image');
  reader.onerror = () => onFail && onFail('read');
  reader.readAsDataURL(file);
}

function clipboardDefaultName(mime) {
  const m = (mime || '').toLowerCase();
  if (m.includes('jpeg')) return 'paste.jpg';
  if (m.includes('gif')) return 'paste.gif';
  if (m.includes('webp')) return 'paste.webp';
  return 'paste.png';
}

/** Pasted images: prefer files list (Chromium), then items; fix empty File.type from item.type */
function clipboardImageFileFromPasteEvent(e) {
  const cd = e.clipboardData;
  if (!cd) return null;

  if (cd.files && cd.files.length) {
    for (let i = 0; i < cd.files.length; i++) {
      const f = cd.files[i];
      if (!f || !f.size) continue;
      const t = (f.type || '').toLowerCase();
      if (t.startsWith('image/')) return f;
    }
  }

  const items = cd.items;
  if (!items) return null;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.kind !== 'file') continue;
    const blob = it.getAsFile();
    if (!blob || !blob.size) continue;
    const itemType = (it.type || '').toLowerCase();
    const blobType = (blob.type || '').toLowerCase();
    if (blobType.startsWith('image/')) return blob;
    if (itemType.startsWith('image/')) {
      return new File([blob], clipboardDefaultName(itemType), { type: it.type || 'image/png' });
    }
  }
  return null;
}

function handleImageSelect(e) {
  const files = Array.from(e.target.files || []);
  processImages(files);
}

// ── Image modal functions ──────────────────────────────
function openImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.remove('modal-hidden');
  }
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.add('modal-hidden');
  }
}

let imageUploadEventsBound = false;

function setupImageUpload() {
  if (imageUploadEventsBound) return;
  const uploadArea = document.getElementById('imageUploadArea');
  const imageInput = document.getElementById('imageInput');
  if (!uploadArea || !imageInput) return;

  let dragDepth = 0;

  uploadArea.addEventListener('click', (ev) => {
    if (ev.target.closest && ev.target.closest('.image-preview-remove')) return;
    imageInput.click();
  });

  uploadArea.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth++;
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth = 0;
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    processImages(files);
  });

  imageInput.addEventListener('change', (e) => {
    handleImageSelect(e);
    e.target.value = '';
  });

  imageUploadEventsBound = true;
}

let contentPasteBound = false;

function setupContentImagePaste() {
  if (contentPasteBound) return;
  contentPasteBound = true;
  // Capture on document so paste is handled even if the textarea does not get the event first (some browsers / embed cases)
  document.addEventListener(
    'paste',
    (e) => {
      const ta = document.getElementById('fContent');
      if (!ta || document.activeElement !== ta) return;
      const file = clipboardImageFileFromPasteEvent(e);
      if (file) {
        e.preventDefault();
        e.stopPropagation();
        fileToDataUrlImage(
          file,
          (base64, name) => {
            ceInsertImageEmbed(ta, base64, name);
            syncPreview();
          },
          (reason) => {
            if (reason === 'too-large') {
              const sizeMB = (file.size / 1024 / 1024).toFixed(2);
              alert(`⚠ Image too large (${sizeMB}MB). Max 5MB.`);
            }
          }
        );
        return;
      }
      const text = e.clipboardData && e.clipboardData.getData('text/plain');
      if (text && /!\[[^\]]*\]\(data:/.test(text)) {
        const t = text.trim();
        const m = t.match(/^!\[([^\]]*)\]\((data:[^)]+)\)$/);
        if (m) {
          e.preventDefault();
          e.stopPropagation();
          ceInsertImageEmbed(ta, m[2], m[1] || 'image');
          syncPreview();
        }
      }
    },
    true
  );
}

// Close modal when clicking outside; bind upload & paste once
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeImageModal();
    });
  }
  setupImageUpload();
  setupContentImagePaste();
  updateContentEditorEmptyAttr();
});

function processImages(files) {
  if (!files || files.length === 0) return;

  files.forEach(file => {
    fileToDataUrlImage(
      file,
      (base64, name) => {
        const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        uploadedImages[imageId] = { base64, name };
        renderImagePreview();
      },
      (reason) => {
        if (reason === 'not-image') {
          console.warn(`Skipped non-image: ${file.name}`);
        } else if (reason === 'too-large') {
          const sizeMB = (file.size / 1024 / 1024).toFixed(2);
          alert(`⚠ Image too large: ${file.name}\n(${sizeMB}MB — max 5MB)`);
        }
      }
    );
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

  Object.values(uploadedImages).forEach((img, index) => {
    ceInsertImageEmbed(contentEl, img.base64, img.name);
    console.log(`Added image ${index + 1}: ${img.name}`);
  });

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
  const content = getEditorMarkdown();

  // Validate
  const missing = [];
  if (!id)      missing.push('ID');
  if (!title)   missing.push('Title');
  if (!excerpt) missing.push('Short Description');
  if (!tagsRaw) missing.push('Tags');
  if (!content.trim()) missing.push('Content');

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