// assets/js/site.js — 页面交互：代码块一键复制 + TOC 滚动高亮
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
})();
