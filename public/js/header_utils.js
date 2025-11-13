(async function() {
  const headerDiv = document.getElementById('header');
  if (!headerDiv) return;
  try {
    const res = await fetch('../components/header.html', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Erro ao carregar header: ' + res.status);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) throw new Error('Resposta inesperada: ' + ct);
    const html = await res.text();

    // Parse the fetched HTML so we can move <link> into <head> and execute <script>s
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Move stylesheet links to document.head (avoid duplicates)
    const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (!document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = href;
        document.head.appendChild(newLink);
      }
    });

    // Clear any previous header content and insert non-script nodes
    headerDiv.innerHTML = '';
    const bodyChildren = Array.from(doc.body.children);
    bodyChildren.forEach(node => {
      if (node.tagName && node.tagName.toLowerCase() === 'script') return;
      if (node.tagName && node.tagName.toLowerCase() === 'link' && node.rel === 'stylesheet') return;
      headerDiv.appendChild(document.importNode(node, true));
    });

    // Execute scripts found in the fetched header HTML by creating new script elements
    const scripts = Array.from(doc.querySelectorAll('script'));
    for (const script of scripts) {
      const src = script.getAttribute('src');
      const newScript = document.createElement('script');
      if (src) {
        newScript.src = src;
        if (script.async) newScript.async = true;
        if (script.defer) newScript.defer = true;
        // append and wait for load to preserve order when needed
        await new Promise((resolve) => {
          newScript.onload = resolve;
          newScript.onerror = () => { console.error('Falha ao carregar script', src); resolve(); };
          document.body.appendChild(newScript);
        });
      } else {
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      }
    }

    // Adicionar lógica do botão de tema após carregar o header
    const temaBtn = document.getElementById('temaBtn');
    if (temaBtn) {
      temaBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        // Opcional: salvar preferência no localStorage
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      });
    }

    // Aplicar tema salvo no localStorage ao carregar
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    }

  } catch (err) {
    console.error('Falha ao carregar header:', err);
  }
})();
