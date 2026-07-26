(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  let searchEntriesPromise;

  const loadSearchEntries = () => {
    if (!searchEntriesPromise) {
      searchEntriesPromise = fetch('/search.json')
        .then((response) => response.json())
        .catch((error) => {
          console.error('无法载入站点索引', error);
          return [];
        });
    }
    return searchEntriesPromise;
  };

  const openRandomPost = async () => {
    const entries = await loadSearchEntries();
    const posts = entries.filter((entry) => /^\/\d{4}\/\d{2}\/\d{2}\//.test(entry.path));
    const candidates = posts.filter((entry) => entry.path !== window.location.pathname);
    const pool = candidates.length > 0 ? candidates : posts;

    if (pool.length > 0) {
      const selected = pool[Math.floor(Math.random() * pool.length)];
      window.location.assign(selected.path);
    }
  };

  const setupCommandPalette = () => {
    const palette = document.createElement('div');
    palette.className = 'command-palette';
    palette.hidden = true;
    palette.innerHTML = `
      <div class="command-backdrop" data-command-close></div>
      <section class="command-dialog" role="dialog" aria-modal="true" aria-label="站点命令面板">
        <div class="command-search-row">
          <span class="command-search-icon" aria-hidden="true">⌕</span>
          <input class="command-input" type="search" placeholder="搜索文章、笔记或页面…" autocomplete="off" aria-label="搜索站点">
          <kbd>Esc</kbd>
        </div>
        <div class="command-results" role="listbox" aria-label="搜索结果"></div>
        <footer class="command-footer"><span>↑↓ 选择</span><span>Enter 打开</span><span>Esc 关闭</span></footer>
      </section>`;
    document.body.appendChild(palette);

    const trigger = document.createElement('button');
    trigger.className = 'command-trigger';
    trigger.type = 'button';
    trigger.setAttribute('aria-label', '打开站点命令面板');
    trigger.innerHTML = '<span>快速导航</span><kbd>Ctrl K</kbd>';
    document.body.appendChild(trigger);

    const input = palette.querySelector('.command-input');
    const results = palette.querySelector('.command-results');
    let activeIndex = 0;
    let visibleItems = [];
    let cachedEntries = [];

    const commands = [
      { title: '返回首页', description: '最新文章与个人入口', path: '/', badge: 'H' },
      { title: '学习笔记', description: '结构化 Wiki 笔记', path: '/wiki/', badge: 'N' },
      { title: '阅读与研究', description: '论文、方向与实践计划', path: '/reading/', badge: 'R' },
      { title: '关于我', description: '方向与联系方式', path: '/about/', badge: 'A' },
      { title: '随机阅读', description: '随便打开一篇博客文章', action: openRandomPost, badge: '?' }
    ];

    const getEntryType = (path) => {
      if (/^\/\d{4}\//.test(path)) return '文章';
      if (path.startsWith('/notes/')) return '笔记';
      return '页面';
    };

    const setActiveItem = (index) => {
      const items = [...results.querySelectorAll('.command-item')];
      if (items.length === 0) return;
      activeIndex = (index + items.length) % items.length;
      items.forEach((item, itemIndex) => {
        const active = itemIndex === activeIndex;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    };

    const runItem = async (item) => {
      if (item.action) {
        closePalette();
        await item.action();
      } else if (item.path) {
        window.location.assign(item.path);
      }
    };

    const renderItems = (query = '') => {
      const normalizedQuery = query.trim().toLowerCase();
      const matchingCommands = commands.filter((command) =>
        !normalizedQuery || `${command.title} ${command.description}`.toLowerCase().includes(normalizedQuery)
      );
      const matchingEntries = normalizedQuery
        ? cachedEntries
            .filter((entry) => `${entry.title} ${entry.content || ''}`.toLowerCase().includes(normalizedQuery))
            .slice(0, 7)
            .map((entry) => ({
              title: entry.title,
              description: getEntryType(entry.path),
              path: entry.path,
              badge: getEntryType(entry.path).slice(0, 1)
            }))
        : [];

      const commandPaths = new Set(matchingCommands.map((item) => item.path).filter(Boolean));
      visibleItems = [...matchingCommands, ...matchingEntries.filter((item) => !commandPaths.has(item.path))].slice(0, 9);
      results.replaceChildren();

      if (visibleItems.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'command-empty';
        empty.textContent = '没有找到相关内容';
        results.appendChild(empty);
        return;
      }

      visibleItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'command-item';
        button.setAttribute('role', 'option');
        button.innerHTML = `
          <span class="command-badge" aria-hidden="true"></span>
          <span class="command-copy"><strong></strong><small></small></span>
          <span class="command-arrow" aria-hidden="true">↗</span>`;
        button.querySelector('.command-badge').textContent = item.badge;
        button.querySelector('strong').textContent = item.title;
        button.querySelector('small').textContent = item.description;
        button.addEventListener('mouseenter', () => setActiveItem(index));
        button.addEventListener('click', () => runItem(item));
        results.appendChild(button);
      });
      setActiveItem(0);
    };

    const openPalette = () => {
      palette.hidden = false;
      document.body.classList.add('command-open');
      input.value = '';
      renderItems();
      requestAnimationFrame(() => input.focus());
      loadSearchEntries().then((entries) => {
        cachedEntries = entries;
        if (input.value) renderItems(input.value);
      });
    };

    const closePalette = () => {
      palette.hidden = true;
      document.body.classList.remove('command-open');
      trigger.focus({ preventScroll: true });
    };

    trigger.addEventListener('click', openPalette);
    palette.querySelector('[data-command-close]').addEventListener('click', closePalette);
    input.addEventListener('input', () => renderItems(input.value));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveItem(activeIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveItem(activeIndex - 1);
      } else if (event.key === 'Enter' && visibleItems[activeIndex]) {
        event.preventDefault();
        runItem(visibleItems[activeIndex]);
      }
    });

    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        palette.hidden ? openPalette() : closePalette();
      } else if (event.key === 'Escape' && !palette.hidden) {
        closePalette();
      }
    });

    return openPalette;
  };

  const setupRandomLinks = () => {
    document.querySelectorAll('a[href="#random-post"]').forEach((link) => {
      link.setAttribute('aria-label', '随机阅读一篇博客文章');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openRandomPost();
      });
    });
  };

  const setupReadingFilters = () => {
    const wall = document.querySelector('.reading-wall');
    if (!wall) return;

    const cards = [...wall.querySelectorAll('.paper-card')];
    const result = wall.querySelector('.reading-result');
    wall.querySelectorAll('[data-reading-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.readingFilter;
        let visibleCount = 0;
        cards.forEach((card) => {
          const visible = filter === 'all' || card.dataset.readingStatus === filter;
          card.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        wall.querySelectorAll('[data-reading-filter]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        result.textContent = `显示 ${visibleCount} 个条目`;
      });
    });
  };

  const setupErrorTerminal = (openPalette) => {
    const errorPage = document.querySelector('.error-page');
    if (!errorPage) return;

    errorPage.innerHTML = `
      <section class="error-terminal" aria-labelledby="error-title">
        <header class="terminal-bar"><span></span><span></span><span></span><strong>softstar@blog</strong></header>
        <div class="terminal-body">
          <p><span class="terminal-prompt">softstar@blog:~$</span> locate requested-page</p>
          <h1 id="error-title">404</h1>
          <p class="terminal-message">没有找到这个页面，但你仍然可以从这里继续探索。</p>
          <div class="terminal-output" aria-live="polite">输入 <code>help</code> 查看可用命令。</div>
          <form class="terminal-form">
            <label for="terminal-command">visitor@blog:~$</label>
            <input id="terminal-command" type="text" autocomplete="off" spellcheck="false" placeholder="help">
          </form>
          <div class="terminal-actions">
            <button type="button" data-terminal-command="home">返回首页</button>
            <button type="button" data-terminal-command="random">随机文章</button>
            <button type="button" data-terminal-command="search">打开搜索</button>
          </div>
        </div>
      </section>`;

    const output = errorPage.querySelector('.terminal-output');
    const input = errorPage.querySelector('#terminal-command');
    const runCommand = async (rawCommand) => {
      const command = rawCommand.trim().toLowerCase();
      if (command === 'home') {
        window.location.assign('/');
      } else if (command === 'random') {
        output.textContent = '正在为你挑选一篇文章…';
        await openRandomPost();
      } else if (command === 'search') {
        openPalette();
      } else if (command === 'clear') {
        output.textContent = '';
      } else if (command === 'help' || !command) {
        output.innerHTML = '<code>home</code> 首页 · <code>random</code> 随机文章 · <code>search</code> 搜索 · <code>clear</code> 清空';
      } else {
        output.textContent = `command not found: ${command}`;
      }
      input.value = '';
    };

    errorPage.querySelector('.terminal-form').addEventListener('submit', (event) => {
      event.preventDefault();
      runCommand(input.value);
    });
    errorPage.querySelectorAll('[data-terminal-command]').forEach((button) => {
      button.addEventListener('click', () => runCommand(button.dataset.terminalCommand));
    });
  };

  ready(() => {
    const openPalette = setupCommandPalette();
    setupRandomLinks();
    setupReadingFilters();
    setupErrorTerminal(openPalette);
  });
})();
