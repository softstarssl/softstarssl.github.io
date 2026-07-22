(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.placeholder = '站内搜索 · Ctrl K';
      document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    const randomLink = document.querySelector('a[href="#random-post"]');
    if (!randomLink) return;

    randomLink.setAttribute('aria-label', '随机阅读一篇博客文章');
    randomLink.addEventListener('click', async (event) => {
      event.preventDefault();

      try {
        const response = await fetch('/search.json');
        const entries = await response.json();
        const posts = entries.filter((entry) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(entry.path));
        const candidates = posts.filter((entry) => entry.path !== window.location.pathname);
        const pool = candidates.length > 0 ? candidates : posts;

        if (pool.length > 0) {
          const selected = pool[Math.floor(Math.random() * pool.length)];
          window.location.assign(selected.path);
        }
      } catch (error) {
        console.error('无法载入随机文章', error);
      }
    });
  });
})();
