// assets/js/site.js — 页面交互：代码块复制 + TOC 高亮 + 首页随机推荐 + 总览页搜索
(() => {
  // 代码块一键复制
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-block').querySelector('pre').innerText;
      const done = () => {
        const label = btn.querySelector('span');
        btn.classList.add('copied');
        label.textContent = '已复制';
        setTimeout(() => { btn.classList.remove('copied'); label.textContent = '复制'; }, 1600);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(code).then(done);
      } else {
        // 兼容非安全上下文（http 本地预览）
        const ta = document.createElement('textarea');
        ta.value = code;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        done();
      }
    });
  });

  // TOC：点击高亮 + 平滑滚动
  const tocLinks = document.querySelectorAll('.toc a');
  tocLinks.forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      tocLinks.forEach(x => x.classList.remove('current'));
      a.classList.add('current');
      const target = document.getElementById(a.getAttribute('href').slice(1));
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });
   // 首页：随机推荐（每次进入页面随机一篇，可点「换一篇」重抽）
  const randomCard = document.getElementById('random-post');
  if (randomCard) {
    const section = document.getElementById('random-section');
    fetch('/search.json').then(r => r.json()).then(list => {
      if (!Array.isArray(list) || list.length === 0) { section?.remove(); return; }
      const fill = () => {
        const p = list[Math.floor(Math.random() * list.length)];
        randomCard.href = p.url;
        randomCard.querySelector('time').textContent = p.date || '';
        randomCard.querySelector('h3').textContent = p.title;
        randomCard.querySelector('p').textContent = p.summary || '点开看看这一篇吧。';
        randomCard.hidden = false;
      };
      fill();
      document.getElementById('shuffle-btn')?.addEventListener('click', fill);
    }).catch(() => section?.remove()); // 拉取失败（如本地直接开文件）就隐藏整个模块
  }

  // 总览页：站内搜索（按标题 / 标签 / 摘要过滤卡片）
  const searchInput = document.getElementById('site-search');
  if (searchInput) {
    const cards = [...document.querySelectorAll('#archive-list .post-card')];
    const years = [...document.querySelectorAll('#archive-list .archive-year')];
    const countEl = document.getElementById('search-count');
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      let hits = 0;
      for (const c of cards) {
        const hay = `${c.dataset.title} ${c.dataset.tags} ${c.dataset.summary}`.toLowerCase();
        const hit = !q || hay.includes(q);
        c.style.display = hit ? '' : 'none';
        if (hit) hits++;
      }
      // 隐藏所有卡片都被过滤掉的年份标题
      for (const y of years) {
        let el = y.nextElementSibling, anyVisible = false;
        while (el && !el.classList.contains('archive-year')) {
          if (el.classList.contains('post-grid') && [...el.children].some(c => c.style.display !== 'none')) {
            anyVisible = true;
          }
          el = el.nextElementSibling;
        }
        y.style.display = anyVisible ? '' : 'none';
      }
      countEl.textContent = q ? `找到 ${hits} 篇` : '';
    });
  }
})();
