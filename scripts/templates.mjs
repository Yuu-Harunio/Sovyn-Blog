// scripts/templates.mjs — HTML 页面模板部件（暖色人文风，与 design-preview.html 定稿一致）

export function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 导航：首页 / 标签 / 文章总览
const NAV = [
  { href: '/', label: '首页', key: 'home' },
  { href: '/tags/', label: '标签', key: 'tags' },
  { href: '/archive/', label: '文章总览', key: 'archive' },
];

// 页面骨架（head + 导航 + 页脚）
export function layout(site, { title, desc, active = '', content }) {
  const navHtml = NAV.map(n =>
    `<a href="${n.href}"${n.key === active ? ' class="active"' : ''}>${n.label}</a>`
  ).join('\n      ');

  const footerLinks = [
    ...(site.footer?.links || []).map(l =>
      `<a href="${l.url}"${/^https?:/.test(l.url) ? ' target="_blank" rel="noopener"' : ''}>${l.label}</a>`),
    `<a href="/about/">关于</a>`,
  ].join(' · ');

  const pageTitle = title ? `${title} · ${site.title}` : `${site.title} — ${site.description}`;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(desc || site.description)}">
<link rel="stylesheet" href="/assets/css/style.css">
</head>
<body>
<nav class="nav">
  <div class="nav-inner">
    <a class="nav-logo" href="/">${escapeHtml(site.title.replace(/\.$/, ''))}<em>.</em></a>
    <div class="nav-links">
      ${navHtml}
    </div>
  </div>
</nav>
${content}
<footer>
  <div class="footer-inner">
    <span>${escapeHtml(site.footer?.left || `© ${new Date().getFullYear()} ${site.author}`)}</span>
    <span>${footerLinks}</span>
  </div>
</footer>
<script src="/assets/js/site.js"></script>
</body>
</html>`;
}

// 首页 Hero 区：左文右图（site.json 配置 hero.image 后显示插图）
export function heroHtml(site) {
  const h = site.hero || {};
  const tags = (h.tags || []).map(t =>
    `<a class="tag" href="/tags/${encodeURIComponent(t)}/"># ${escapeHtml(t)}</a>`).join('');
  const art = h.image
    ? `<img class="hero-art" src="${h.image}" alt="${escapeHtml(h.alt || '博客封面插图')}">`
    : '';
  return `<header class="hero container">
  <div class="hero-text">
    <div class="section-label">个人博客</div>
    <h1>${h.heading || ''}</h1>
    <p>${escapeHtml(h.intro || '')}</p>
    <div class="hero-meta">${tags}</div>
  </div>
  ${art}
</header>`;
}

// 文章列表卡片（首页 / 标签页 / 总览页共用）
export function postItemHtml(post) {
  const tagHtml = (post.tags || []).slice(0, 3).map(t =>
    `<span class="tag">${escapeHtml(t)}</span>`).join(' ');
  return `<a class="post-item" href="${post.url}">
  <div class="post-item-top">
    ${post.pinned ? '<span class="pinned">置顶</span>' : ''}
    <time>${escapeHtml(post.date)}</time>
    ${tagHtml ? `<span>·</span>${tagHtml}` : ''}
  </div>
  <h3>${escapeHtml(post.title)}</h3>
  ${post.summary ? `<p>${escapeHtml(post.summary)}</p>` : ''}
</a>`;
}

export function postListHtml(posts) {
  return `<div class="post-list">${posts.map(postItemHtml).join('\n')}</div>`;
}

// 总览页网格卡片：带 data-* 属性供站内搜索过滤（标题/标签/摘要）
export function postCardHtml(post) {
  const tagHtml = (post.tags || []).slice(0, 3).map(t =>
    `<span class="tag">${escapeHtml(t)}</span>`).join(' ');
  return `<a class="post-item post-card" href="${post.url}"
  data-title="${escapeHtml(post.title)}"
  data-tags="${escapeHtml((post.tags || []).join(' '))}"
  data-summary="${escapeHtml(post.summary || '')}">
  <div class="post-item-top">
    ${post.pinned ? '<span class="pinned">置顶</span>' : ''}
    <time>${escapeHtml(post.date)}</time>
  </div>
  <h3>${escapeHtml(post.title)}</h3>
  ${post.summary ? `<p>${escapeHtml(post.summary)}</p>` : ''}
  ${tagHtml ? `<div class="post-card-tags">${tagHtml}</div>` : ''}
</a>`;
}

export function postGridHtml(posts) {
  return `<div class="post-grid">${posts.map(postCardHtml).join('\n')}</div>`;
}

// 文章页：正文在左、TOC 大纲在右（sticky）
export function articlePageHtml(post, tocHtml) {
  const tagHtml = (post.tags || []).map(t =>
    `<a class="tag" href="/tags/${encodeURIComponent(t)}/">${escapeHtml(t)}</a>`).join(' ');
  return `<div class="article-wrap">

  <header class="article-header">
    <div class="meta">
      <time>${escapeHtml(post.date)}</time>
      <span>·</span>
      <span>约 ${post.readingMinutes} 分钟</span>
      ${tagHtml ? `<span>·</span>${tagHtml}` : ''}
    </div>
    <h1>${escapeHtml(post.title)}</h1>
    <hr class="article-divider">
  </header>

  <article class="prose">
    ${post.html}
  </article>

  <aside class="toc">
    <div class="toc-title">大纲</div>
    ${tocHtml}
  </aside>

</div>`;
}

// ![[笔记]] 嵌入 → 引用卡片（降级渲染：标题 + 摘要 + 链接）
export function embedCardHtml(post) {
  return `<a class="embed-card" href="${post.url}">
  <div class="embed-label">嵌入笔记 · EMBED</div>
  <div class="embed-title">${escapeHtml(post.title)}</div>
  ${post.summary ? `<div class="embed-summary">${escapeHtml(post.summary)}</div>` : ''}
</a>`;
}

// Obsidian callout（> [!type] 标题）
const CALLOUT_META = {
  note:    { icon: 'ℹ️', cls: 'note',    label: '笔记' },
  info:    { icon: 'ℹ️', cls: 'note',    label: '信息' },
  tip:     { icon: '💡', cls: 'tip',     label: '提示' },
  hint:    { icon: '💡', cls: 'tip',     label: '提示' },
  warning: { icon: '⚠️', cls: 'warn',    label: '注意' },
  caution: { icon: '⚠️', cls: 'warn',    label: '注意' },
  question:{ icon: '❓', cls: 'note',    label: '问题' },
  quote:   { icon: '❝',  cls: 'note',    label: '引用' },
};

export function calloutHtml(type, title, bodyHtml) {
  const meta = CALLOUT_META[type] || CALLOUT_META.note;
  return `<div class="callout callout-${meta.cls}">
  <span class="callout-icon">${meta.icon}</span>
  <div>
    <div class="callout-title">${escapeHtml(title || meta.label)}</div>
    ${bodyHtml}
  </div>
</div>`;
}

// 标签索引页 / 归档页 / 404 的区块外壳
export function pageShell({ label, title, inner }) {
  return `<main class="container page-shell">
  <div class="section-label">${escapeHtml(label)}</div>
  <h2 class="section-title">${title}</h2>
  ${inner}
</main>`;
}

// 归档页：搜索框 + 按年分组的 4 列卡片网格
export function archiveHtml(posts) {
  const years = new Map();
  for (const p of posts) {
    const y = (p.date || '').slice(0, 4) || '未分类';
    if (!years.has(y)) years.set(y, []);
    years.get(y).push(p);
  }
  const blocks = [...years.entries()].map(([y, list]) => `
  <h3 class="archive-year">${escapeHtml(y)}</h3>
  ${postGridHtml(list)}`).join('\n');
  return `<div class="search-box">
  <input type="search" id="site-search" placeholder="搜索文章：标题 / 标签 / 摘要…" autocomplete="off">
  <span class="search-count" id="search-count"></span>
</div>
<div id="archive-list">${blocks}</div>`;
}

// 标签索引：标签 + 数量
export function tagIndexHtml(tagMap) {
  const items = [...tagMap.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([tag, list]) => `<a class="tag-cloud-item" href="/tags/${encodeURIComponent(tag)}/">
  <span class="tag">${escapeHtml(tag)}</span><span class="tag-count">${list.length}</span>
</a>`).join('\n');
  return `<div class="tag-cloud">${items}</div>`;
}

// 关于页：简洁居中正文
export function aboutPageHtml(html) {
  return `<main class="container about-wrap">
  <article class="prose about-prose">${html}</article>
</main>`;
}

export function notFoundHtml(site) {
  return `<main class="container page-shell notfound">
  <div class="nf-code">404</div>
  <p>这里什么都没有，可能文章还没发布，或者链接写错了。</p>
  <p><a class="wikilink" href="/">← 回到首页</a></p>
</main>`;
}
