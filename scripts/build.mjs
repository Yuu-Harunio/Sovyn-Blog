// scripts/build.mjs — 静态博客构建器
// 流程：读取 content/ 下的 Markdown（Obsidian 原生语法）
//  → 语法转换（双链/嵌入/callout/标签）→ marked 渲染 → 套模板 → 输出 dist/

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync, cpSync, copyFileSync } from 'node:fs';
import { join, basename, extname, relative, dirname, resolve } from 'node:path';
import { marked } from 'marked';
import matter from 'gray-matter';
import {
  escapeHtml, layout, heroHtml, postItemHtml, postListHtml, articlePageHtml,
  embedCardHtml, calloutHtml, pageShell, archiveHtml, tagIndexHtml,
  aboutPageHtml, notFoundHtml,
} from './templates.mjs';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');
const DIST = join(ROOT, 'dist');

/* ---------------- 工具 ---------------- */

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

/* ---------------- 文章加载 ---------------- */

// 解析一篇文章：frontmatter + 元数据（不渲染正文）
function loadPost(file) {
  const raw = readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const name = basename(file, extname(file)); // 文件名（Obsidian 里的笔记名）
  const slug = data.slug || name;
  return {
    file,
    name,
    slug,
    url: `/posts/${encodeURIComponent(slug)}/`,
    title: data.title || name,
    date: data.date
      ? (data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date).slice(0, 10))
      : '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    summary: data.summary || '',
    aliases: Array.isArray(data.aliases) ? data.aliases : [],
    pinned: !!data.pinned,
    publish: data.publish === true,
    raw: content,
  };
}

/* ---------------- 构建上下文（索引） ---------------- */

// 收集 content/ 下所有图片附件（含 Typora 约定的「笔记名.assets」文件夹）
// 输出统一平铺到 /assets/img/；同名冲突时用上级目录名做前缀
const IMG_EXT = /\.(png|jpe?g|gif|svg|webp|avif|bmp|ico)$/i;

function collectImages(publishedPosts) {
  // 只拷贝被已发布文章引用的图片：未发布笔记的附件不进入公开站
  // 匹配依据与渲染时一致：文件名 / 不含扩展名 / 相对路径（![[...]] 或 ![](...) 引用）
  const refs = new Set();
  for (const p of publishedPosts) {
    for (const m of p.raw.matchAll(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/g)) refs.add(m[1]);
    for (const m of p.raw.matchAll(/!\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)) refs.add(m[1]);
  }
  const refNames = new Set();
  for (const r of refs) {
    refNames.add(basename(r));
    refNames.add(basename(r, extname(r)));
  }
  const found = walk(CONTENT).filter(f => {
    if (!IMG_EXT.test(f)) return false;
    if (refNames.has(basename(f)) || refNames.has(basename(f, extname(f)))) return true;
    const rel = relative(CONTENT, f).replace(/\\/g, '/');
    return refs.has(rel) || refs.has(`/${rel}`) || refs.has(`content/${rel}`);
  });
  const seen = new Map(); // 输出名(小写) → 源文件，用于冲突检测
  const images = [];     // { file, out, url }
  for (const f of found) {
    let out = basename(f);
    while (seen.has(out.toLowerCase()) && seen.get(out.toLowerCase()) !== f) {
      out = `${basename(dirname(f))}-${out}`;
    }
    seen.set(out.toLowerCase(), f);
    images.push({ file: f, out, url: `/assets/img/${encodeURIComponent(out)}` });
  }
  return images;
}

function buildContext(posts, images) {
  // 笔记名 → 文章（文件名 + frontmatter 别名 都可被 [[]] 引用）
  const postsByName = new Map();
  for (const p of posts) {
    for (const key of [p.name, p.title, ...p.aliases]) {
      const k = key.toLowerCase();
      if (!postsByName.has(k)) postsByName.set(k, p);
    }
  }
  // 图片索引：绝对路径（供 md 相对路径解析）+ 文件名/不含扩展名/相对路径（供 ![[嵌入]]）
  const imagesByAbsPath = new Map();
  const imagesByName = new Map();
  for (const img of images) {
    imagesByAbsPath.set(img.file, img.url);
    const rel = relative(CONTENT, img.file).replace(/\\/g, '/');
    const full = basename(rel);
    const stem = basename(rel, extname(rel));
    if (!imagesByName.has(full)) imagesByName.set(full, img.url);
    if (!imagesByName.has(stem)) imagesByName.set(stem, img.url);
    if (!imagesByName.has(rel)) imagesByName.set(rel, img.url);
  }
  return { posts, postsByName, imagesByName, imagesByAbsPath };
}

/* ---------------- Obsidian 语法转换 ---------------- */

// 行内语法：![[嵌入]] / [[双链]] / ![](相对路径图片) / #标签
// 跳过代码块（``` 分段）和行内代码（` 分段）
// fromFile：当前 md 文件路径，用于解析 Typora 的相对路径图片
function transformInline(md, ctx, fromFile = null) {
  const parts = md.split(/```/);
  return parts.map((seg, i) => {
    if (i % 2 === 1) return seg; // 代码块内容不动
    // 行内代码 `...` 也跳过（语法说明文字里的 [[x]] 不该被转换）
    const pieces = seg.split(/(`[^`\n]+`)/);
    return pieces.map((piece, j) => {
      if (j % 2 === 1) return piece;
      return piece
        // ![[xxx]]：图片嵌入 或 笔记嵌入（引用卡片）
        .replace(/!\[\[([^\]]+)\]\]/g, (_, target) => embedReplacer(target, ctx))
        // ![[xxx]]：标准 md 图片（Typora 相对路径，如 ![](笔记名.assets/a.png)）
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, rawUrl) =>
          mdImageReplacer(m, alt, rawUrl, fromFile, ctx))
        // [[xxx]] / [[xxx|别名]]
        .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, name, alias) =>
          wikilinkHtml(name.trim(), alias, ctx))
        // #标签（行首或空白后，# 后紧跟非空白；避开 markdown 标题）
        .replace(/(^|\s)#([\w\u4e00-\u9fff][\w\u4e00-\u9fff/-]*)/g, (m, pre, tag) =>
          `${pre}<a class="tag" href="/tags/${encodeURIComponent(tag)}/">#${tag}</a>`);
    }).join('');
  }).join('```');
}

// ![](相对路径) 解析：外链原样保留；本地路径按 md 所在目录解析，找不到再按文件名兜底
function mdImageReplacer(m, alt, rawUrl, fromFile, ctx) {
  const url = rawUrl.trim().split(/\s+/)[0]; // 去掉可选的 title 部分
  if (!url || /^(https?:|data:|\/\/|#|mailto:)/i.test(url)) return m;
  if (!fromFile) return m;
  let abs;
  try {
    abs = resolve(dirname(fromFile), decodeURIComponent(url));
  } catch {
    return m;
  }
  let img = ctx.imagesByAbsPath.get(abs)
    || ctx.imagesByName.get(basename(abs))
    || ctx.imagesByName.get(basename(abs, extname(abs)));
  if (img) return `<img src="${img}" alt="${escapeHtml(alt)}">`;
  return m; // 解析不到 → 保留原始写法（marked 会渲染出裂图，方便发现漏拷的图片）
}

// ![[xxx]] 解析：先按图片匹配，再按笔记匹配，都没有则降级为纯文本
function embedReplacer(target, ctx) {
  const name = target.split('|')[0].trim(); // 忽略 Obsidian 尺寸语法 |300
  const img = ctx.imagesByName.get(name);
  if (img) return `<img src="${img}" alt="${escapeHtml(name)}">`;
  const post = ctx.postsByName.get(name.toLowerCase());
  if (post) return embedCardHtml(post);
  return `<span class="embed-missing">${escapeHtml(name)}</span>`;
}

// [[xxx]] 解析：已发布 → 站内链接；未发布 → 虚线降级文本
function wikilinkHtml(name, alias, ctx) {
  const post = ctx.postsByName.get(name.toLowerCase());
  if (post) return `<a class="wikilink" href="${post.url}">${escapeHtml(alias || post.title)}</a>`;
  return `<span class="wikilink-dead" title="该笔记未公开发布">${escapeHtml(alias || name)}</span>`;
}

// callout：> [!type] 标题 开头的引用块 → HTML 卡片（正文支持 Markdown）
function transformCallouts(md, ctx, fromFile = null) {
  const lines = md.split('\n');
  const out = [];
  let buf = null; // 正在收集 callout 正文
  let type = '', title = '';

  const flush = () => {
    if (buf === null) return;
    const bodyHtml = marked.parse(transformInline(buf.join('\n'), ctx, fromFile));
    out.push(calloutHtml(type, title, bodyHtml));
    buf = null;
  };

  for (const line of lines) {
    const m = line.match(/^>\s*\[!(\w+)\]\s*(.*)/);
    if (buf === null && m) {
      type = m[1].toLowerCase();
      title = m[2].trim();
      buf = [];
      continue;
    }
    if (buf !== null) {
      if (line.startsWith('>')) { buf.push(line.replace(/^>\s?/, '')); continue; }
      flush(); // 引用块结束
    }
    out.push(line);
  }
  flush();
  return out.join('\n');
}

/* ---------------- 渲染 ---------------- */

// 代码块 → 带"复制"按钮的结构（marked 自定义 renderer）
marked.use({
  renderer: {
    code(token) {
      const text = typeof token === 'string' ? token : token.text;
      const lang = (typeof token === 'string' ? arguments[1] : token.lang) || '';
      return `<div class="code-block">
  <div class="code-head">
    <span class="code-lang">${escapeHtml(lang || 'text')}</span>
    <button class="copy-btn" type="button">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span>复制</span>
    </button>
  </div>
  <pre><code>${escapeHtml(text)}</code></pre>
</div>`;
    },
  },
});

// 渲染一篇文章：语法转换 → marked → 提取 TOC（h2/h3 加锚点）
function renderPost(post, ctx) {
  let md = transformInline(post.raw, ctx, post.file);
  md = transformCallouts(md, ctx, post.file);
  let html = marked.parse(md);

  // 给 h2/h3 加锚点 id，同时收集大纲
  const toc = [];
  let n = 0;
  html = html.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (m, tag, inner) => {
    const id = `h-${++n}`;
    toc.push({ depth: tag === 'h2' ? 2 : 3, text: stripTags(inner), id });
    return `<${tag} id="${id}">${inner}</${tag}>`;
  });

  post.html = html;
  post.toc = toc;
  post.readingMinutes = Math.max(1, Math.round(stripTags(html).length / 400));
  return post;
}

function tocHtml(toc) {
  return toc.map(t =>
    `<a href="#${t.id}" class="${t.depth === 3 ? 'lvl3' : ''}">${escapeHtml(t.text)}</a>`).join('\n');
}

/* ---------------- 页面生成 ---------------- */

function buildHomePage(site, posts) {
  // 最新发布：按日期取最新 3 篇（不看置顶）
  const latest = [...posts]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);
  const content = `${heroHtml(site)}
<main class="container" style="padding-bottom: 56px;">
  <div class="section-label">文章</div>
  <h2 class="section-title">最新发布</h2>
  ${postListHtml(latest)}

  <div class="random-section" id="random-section">
    <div class="random-head">
      <div>
        <div class="section-label">发现</div>
        <h2 class="section-title">随机一篇</h2>
      </div>
      <button class="shuffle-btn" id="shuffle-btn" type="button">↻ 换一篇</button>
    </div>
    <a class="post-item" id="random-post" href="/" hidden>
      <div class="post-item-top"><time></time></div>
      <h3></h3>
      <p></p>
    </a>
  </div>
</main>`;
  return layout(site, { title: '', desc: site.description, active: 'home', content });
}

function buildArchivePage(site, posts) {
  const content = pageShell({
    label: '总览',
    title: '全部文章',
    inner: archiveHtml(posts),
  });
  return layout(site, { title: '文章总览', active: 'archive', content });
}

function buildTagPages(site, posts) {
  const tagMap = new Map();
  for (const p of posts) for (const t of p.tags) {
    if (!tagMap.has(t)) tagMap.set(t, []);
    tagMap.get(t).push(p);
  }
  const pages = new Map();
  // 标签索引页
  pages.set('tags/index.html', layout(site, {
    title: '标签',
    active: 'tags',
    content: pageShell({ label: '索引', title: '全部标签', inner: tagIndexHtml(tagMap) }),
  }));
  // 每个标签一页
  for (const [tag, list] of tagMap) {
    list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    pages.set(`tags/${tag}/index.html`, layout(site, {
      title: `标签：${tag}`,
      active: 'tags',
      content: pageShell({
        label: '标签',
        title: `# ${tag}`,
        inner: postListHtml(list),
      }),
    }));
  }
  return { pages, tagMap };
}

function buildAboutPage(site, ctx) {
  const file = join(CONTENT, 'about.md');
  if (!existsSync(file)) return null;
  const post = loadPost(file);
  let md = transformInline(post.raw, ctx, file);
  md = transformCallouts(md, ctx, file);
  const html = marked.parse(md);
  return layout(site, { title: '关于', desc: post.summary || '关于本站', active: '', content: aboutPageHtml(html) });
}

function buildFeed(site, posts) {
  const items = posts.map(p => `  <item>
    <title>${escapeHtml(p.title)}</title>
    <link>${site.url}${p.url}</link>
    <guid>${site.url}${p.url}</guid>
    <pubDate>${new Date(p.date || Date.now()).toUTCString()}</pubDate>
    <description>${escapeHtml(p.summary || '')}</description>
  </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeHtml(site.title)}</title>
  <link>${site.url}</link>
  <description>${escapeHtml(site.description)}</description>
${items}
</channel>
</rss>`;
}

function buildSitemap(site, posts, tagMap) {
  const urls = [
    { loc: '/', last: null },
    { loc: '/tags/', last: null },
    { loc: '/archive/', last: null },
    { loc: '/about/', last: null },
    ...posts.map(p => ({ loc: p.url, last: p.date })),
    ...[...tagMap.keys()].map(t => ({ loc: `/tags/${encodeURIComponent(t)}/`, last: null })),
  ];
  const body = urls.map(u =>
    `  <url><loc>${site.url}${u.loc}</loc>${u.last ? `<lastmod>${u.last}</lastmod>` : ''}</url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}

/* ---------------- 主流程 ---------------- */

function main() {
  console.log('▶ 读取 site.json ...');
  const site = JSON.parse(readFileSync(join(ROOT, 'site.json'), 'utf8'));

  console.log('▶ 扫描文章 ...');
  const postFiles = walk(join(CONTENT, 'posts')).filter(f => f.endsWith('.md'));
  const all = postFiles.map(loadPost);

  // 收集图片附件：仅已发布文章的图片 → 平铺到 /assets/img/
  const posts = all.filter(p => p.publish);
  const images = collectImages(posts);

  // 仅 publish: true 的文章进入构建；未发布的仍可被 [[]] 感知吗？
  // ——不。未发布 = 完全不存在于公开站，双链会降级为纯文本。
  const ctx = buildContext(posts, images);

  console.log(`  ${all.length} 篇笔记，其中 ${posts.length} 篇标记发布`);

  // 渲染全部文章
  for (const p of posts) renderPost(p, ctx);

  // 排序：置顶优先，其余按日期倒序
  posts.sort((a, b) => (b.pinned - a.pinned) || (b.date || '').localeCompare(a.date || ''));

  console.log('▶ 清理 dist/ ...');
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  console.log('▶ 生成页面 ...');
  writeFile(join(DIST, 'index.html'), buildHomePage(site, posts));
  writeFile(join(DIST, 'archive/index.html'), buildArchivePage(site, posts));
  const { pages: tagPages, tagMap } = buildTagPages(site, posts);
  for (const [path, html] of tagPages) writeFile(join(DIST, path), html);

  for (const p of posts) {
    writeFile(join(DIST, `posts/${p.slug}/index.html`), layout(site, {
      title: p.title,
      desc: p.summary,
      active: '',
      content: articlePageHtml(p, tocHtml(p.toc)),
    }));
  }

  const about = buildAboutPage(site, ctx);
  if (about) writeFile(join(DIST, 'about/index.html'), about);

  writeFile(join(DIST, '404.html'), layout(site, { title: '404', active: '', content: notFoundHtml(site) }));
  writeFile(join(DIST, 'feed.xml'), buildFeed(site, posts));
  writeFile(join(DIST, 'sitemap.xml'), buildSitemap(site, posts, tagMap));
  writeFile(join(DIST, 'search.json'), JSON.stringify(
    posts.map(({ title, url, date, tags, summary }) => ({ title, url, date, tags, summary })),
    null, 2));

  console.log('▶ 拷贝静态资源 ...');
  // 站点资源（css / js）
  cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });
  // 文章图片附件（含「笔记名.assets」文件夹，平铺、重名自动加前缀）
  mkdirSync(join(DIST, 'assets/img'), { recursive: true });
  for (const { file, out } of images) copyFileSync(file, join(DIST, 'assets/img', out));

  console.log(`✔ 构建完成：${posts.length} 篇文章，输出到 dist/`);
}

main();
