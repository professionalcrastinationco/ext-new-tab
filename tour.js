/**
 * First-run walkthrough: a spotlight on one part of the page at a time.
 * Shown once to new users (nothing saved yet), replayable from Settings.
 * Uses globals from newtab.js (currentData, renderDock) and storage.js (updateSetting).
 */
(() => {
  const SAMPLE_DATA = () => ({
    categories: [
      { id: 'tour_work', name: 'Work', icon: 'briefcase', order: 0, links: [
        { id: 't1', title: 'Team Calendar', url: 'https://calendar.google.com', order: 0 },
        { id: 't2', title: 'Project Board', url: 'https://example.com/board', order: 1 },
        { id: 't3', title: 'Shared Drive', url: 'https://drive.google.com', order: 2 }
      ] },
      { id: 'tour_learn', name: 'Learn', icon: 'book-open', order: 1, links: [
        { id: 't4', title: 'Course Notes', url: 'https://example.com/notes', order: 0 },
        { id: 't5', title: 'Reading List', url: 'https://example.com/reading', order: 1 }
      ] },
      { id: 'tour_fun', name: 'Fun', icon: 'game-controller', order: 2, links: [
        { id: 't6', title: 'Watch Later', url: 'https://www.youtube.com', order: 0 },
        { id: 't7', title: 'Game News', url: 'https://example.com/games', order: 1 }
      ] }
    ],
    quickLinks: [],
    settings: Object.assign({}, currentData.settings)
  });

  const STEPS = [
    {
      target: '.search-box',
      also: '#settingsBtn',
      title: 'Search Anything',
      body: 'Type a search or a web address and press Enter.',
      tip: 'Want a different search engine? Change it in Settings, the gear icon in the top right corner.'
    },
    {
      target: '#quickLinks',
      title: 'Quick Links',
      body: 'The sites you open all day, one click away. Drag them to reorder, or right-click one to edit or delete it.'
    },
    {
      target: '.quick-link-add',
      title: 'Add A Quick Link',
      body: 'Click the plus. Pick a popular site in one click, or add your own link with a name and an icon. You can even use your own image as the icon.'
    },
    {
      target: '#dock',
      title: 'Categories',
      body: 'Group your bookmarks into categories like Work, Learn and Fun. Click a category to see what is inside. Add your own with the plus on the dock. These are examples, nothing is saved.',
      before: () => {
        renderDock(SAMPLE_DATA());
        // Open the first category after this click has finished, or the page's own
        // "click elsewhere closes panels" handler would shut it again
        setTimeout(() => {
          const first = document.querySelector('#dock .dock-btn');
          if (first) first.click();
        }, 0);
      },
      side: true, // card goes beside the lit area so it never covers the open category
      area: () => {
        // Light up the dock and the open category above it
        const dock = document.querySelector('#dock').getBoundingClientRect();
        const open = document.querySelector('#dock .dock-icon.open .bookmark-card');
        if (!open) return dock;
        const c = open.getBoundingClientRect();
        const top = Math.min(dock.top, c.top), bottom = Math.max(dock.bottom, c.bottom);
        const left = Math.min(dock.left, c.left), right = Math.max(dock.right, c.right);
        return { left, top, right, bottom, width: right - left, height: bottom - top };
      },
      after: () => {
        document.querySelectorAll('#dock .dock-icon.open').forEach(el => el.classList.remove('open'));
        renderDock(currentData);
      }
    },
    {
      target: '#settingsBtn',
      title: 'Settings',
      body: 'Choose your search engine, background, dock position and where links open. You can replay this tour any time from Settings.'
    }
  ];

  let root = null, index = 0;

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function place(box, r, pad) {
    box.style.left = (r.left - pad) + 'px';
    box.style.top = (r.top - pad) + 'px';
    box.style.width = (r.width + pad * 2) + 'px';
    box.style.height = (r.height + pad * 2) + 'px';
  }

  function show(i) {
    const prev = STEPS[index];
    if (root && prev && prev.after && i !== index) prev.after();
    index = i;
    const step = STEPS[i];
    if (step.before) step.before();

    // Wait one frame so any re-rendered content has its real position
    setTimeout(() => requestAnimationFrame(() => {
      if (!root) return;
      const target = document.querySelector(step.target);
      if (!target) { next(); return; }
      const r = step.area ? step.area() : target.getBoundingClientRect();

      const spot = root.querySelector('.tour-spot');
      place(spot, r, 10);
      const spot2 = root.querySelector('.tour-spot-2');
      const also = step.also && document.querySelector(step.also);
      spot2.hidden = !also;
      if (also) place(spot2, also.getBoundingClientRect(), 8);

      const card = root.querySelector('.tour-card');
      card.querySelector('.tour-count').textContent = `${i + 1} of ${STEPS.length}`;
      card.querySelector('.tour-title').textContent = step.title;
      card.querySelector('.tour-body').textContent = step.body;
      const tip = card.querySelector('.tour-tip');
      tip.hidden = !step.tip;
      tip.querySelector('p').textContent = step.tip || '';
      card.querySelector('.tour-back').hidden = i === 0;
      card.querySelector('.tour-next').textContent = i === STEPS.length - 1 ? 'Finish' : 'Next';
      card.querySelector('.tour-skip').hidden = i === STEPS.length - 1;

      // Below the target when there is room, otherwise above it
      const cw = card.offsetWidth, ch = card.offsetHeight;
      const below = window.innerHeight - r.bottom > ch + 40;
      let top = below ? r.bottom + 22 : r.top - ch - 22;
      let left = r.left + r.width / 2 - cw / 2;
      if (step.side) {
        top = r.bottom - ch;
        left = r.right + 24 + cw <= window.innerWidth - 16 ? r.right + 24 : r.left - 24 - cw;
      }
      top = Math.max(16, Math.min(window.innerHeight - ch - 16, top));
      left = Math.max(16, Math.min(window.innerWidth - cw - 16, left));
      card.style.top = top + 'px';
      card.style.left = left + 'px';
      card.querySelector('.tour-next').focus();
    }), step.before ? 120 : 0);
  }

  function next() { if (index >= STEPS.length - 1) finish(); else show(index + 1); }
  function back() { if (index > 0) show(index - 1); }

  async function finish() {
    const step = STEPS[index];
    if (step && step.after) step.after();
    if (root) { root.remove(); root = null; }
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', reposition);
    try { await updateSetting('tourDone', true); } catch (e) { /* fine: it just shows again next time */ }
  }

  function onKey(e) {
    if (!root) return;
    if (e.key === 'Escape') { e.preventDefault(); finish(); }
    else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
  }

  function reposition() { if (root) show(index); }

  function start() {
    if (root) return;
    document.querySelectorAll('dialog[open]').forEach(d => d.close());
    root = el('div', 'tour');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Dockside tour');
    root.appendChild(el('div', 'tour-block'));
    root.appendChild(el('div', 'tour-spot'));
    const s2 = el('div', 'tour-spot-2'); s2.hidden = true; root.appendChild(s2);

    const card = el('div', 'tour-card');
    card.appendChild(el('span', 'tour-count'));
    card.appendChild(el('h2', 'tour-title'));
    card.appendChild(el('p', 'tour-body'));
    const tipBox = el('div', 'tour-tip');
    tipBox.hidden = true;
    tipBox.append(el('span', 'tour-tip-label', 'Pro Tip'), el('p'));
    card.appendChild(tipBox);
    const actions = el('div', 'tour-actions');
    const skip = el('button', 'btn btn-ghost tour-skip', 'Skip Tour'); skip.type = 'button';
    const spacer = el('span', 'tour-spacer');
    const backBtn = el('button', 'btn btn-secondary tour-back', 'Back'); backBtn.type = 'button';
    const nextBtn = el('button', 'btn btn-primary tour-next', 'Next'); nextBtn.type = 'button';
    actions.append(skip, spacer, backBtn, nextBtn);
    card.appendChild(actions);
    root.appendChild(card);
    document.body.appendChild(root);

    skip.addEventListener('click', finish);
    backBtn.addEventListener('click', back);
    nextBtn.addEventListener('click', next);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', reposition);
    index = -1;
    show(0);
  }

  window.DocksideTour = { start };
})();
